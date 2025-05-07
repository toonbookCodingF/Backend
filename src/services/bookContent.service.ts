import client from "../config/database";
import * as fs from 'fs';
import * as path from 'path';

// On définit l'interface pour le contenu de livre
// Cela permet d'avoir un typage fort et de documenter la structure attendue
export interface BookContentProps {
    id?: number;
    chapter_id: number;
    content: string;
    type: 'text' | 'image';
    order: number;
    imageFile?: Express.Multer.File;
}

// On récupère tous les contenus de livre
// C'est utile pour l'administration et la gestion globale des contenus
export const getAllBookContents = async () => {
    const result = await client.query("SELECT * FROM \"bookcontent\"");
    return result.rows;
};

// On récupère un contenu spécifique par son ID
// C'est nécessaire pour l'édition et la visualisation d'un contenu particulier
export const getBookContent = async (id: number) => {
    const query = `SELECT * FROM \"bookcontent\" WHERE id = $1;`;
    const values = [id];

    try {
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw new Error("Database error");
    }
};

// On récupère tous les contenus d'un chapitre
// C'est important pour afficher le contenu complet d'un chapitre dans l'ordre
export const getBookContentsByChapter = async (chapterId: number) => {
    const query = `SELECT * FROM \"bookcontent\" WHERE chapter_id = $1 ORDER BY "order";`;
    const values = [chapterId];

    try {
        const result = await client.query(query, values);
        return result.rows;
    } catch (error) {
        throw new Error("Database error");
    }
};

// On crée un nouveau contenu de livre
// C'est une opération fondamentale pour ajouter du contenu aux chapitres
export const createBookContent = async (bookContent: BookContentProps, imageFile?: Express.Multer.File) => {
    try {
        // On vérifie l'existence du chapitre car c'est une contrainte d'intégrité référentielle
        // Cette vérification prévient les erreurs de clé étrangère et assure la cohérence des données
        const checkChapterQuery = `SELECT * FROM \"chapter\" WHERE id = $1;`;
        const checkChapterResult = await client.query(checkChapterQuery, [bookContent.chapter_id]);
        
        if (checkChapterResult.rows.length === 0) {
            throw new Error("chapter not found");
        }

        // On initialise le contenu avec une valeur par défaut car il peut être modifié plus tard
        // Cette initialisation assure que le contenu n'est jamais undefined
        let content = bookContent.content || '';

        // On gère le téléchargement d'image car c'est nécessaire pour le type 'image'
        // Cette gestion permet de stocker les images de manière organisée et sécurisée
        if (imageFile) {
            // On crée le répertoire de destination car il doit exister pour sauvegarder l'image
            // Cette création récursive assure que tous les dossiers parents existent
            const uploadDir = path.join(__dirname, '../../public/images/contents');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // On génère un nom de fichier unique pour éviter les conflits
            // L'utilisation de Date.now() garantit l'unicité du nom de fichier
            const fileName = `${Date.now()}-${imageFile.originalname}`;
            const filePath = path.join(uploadDir, fileName);

            // On sauvegarde le fichier car il doit être stocké physiquement sur le serveur
            // Cette sauvegarde permet d'accéder à l'image ultérieurement
            fs.writeFileSync(filePath, imageFile.buffer);

            // On met à jour le chemin du contenu car il doit pointer vers l'image stockée
            // Ce chemin sera utilisé pour afficher l'image dans le frontend
            content = `/images/contents/${fileName}`;
        }

        // On construit la requête SQL car elle est nécessaire pour insérer les données
        // Le RETURNING * permet de récupérer l'enregistrement créé
        const query = `
            INSERT INTO \"bookcontent\"
            (chapter_id, content, type, "createdat", "order")
            VALUES 
            ($1, $2, $3, NOW(), $4)
            RETURNING *;
        `;

        // On prépare les valeurs pour la requête car elles doivent être injectées de manière sécurisée
        // Cette préparation prévient les injections SQL
        const values = [
            bookContent.chapter_id,
            content,
            bookContent.type,
            bookContent.order
        ];

        // On exécute la requête car c'est nécessaire pour créer l'enregistrement
        // Le résultat contient l'enregistrement créé avec tous ses champs
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        // On gère les erreurs car elles peuvent survenir lors de l'exécution
        // Cette gestion permet de remonter des messages d'erreur clairs au controller
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};

// On met à jour un contenu existant
// C'est nécessaire pour permettre l'édition et la modification des contenus
export const updateBookContent = async (id: number, bookContent: Partial<BookContentProps>) => {
    try {
        // On récupère l'ancien contenu pour gérer la suppression des images
        // C'est important pour éviter les fichiers orphelins
        const oldContentQuery = `SELECT * FROM "bookcontent" WHERE id = $1;`;
        const oldContentResult = await client.query(oldContentQuery, [id]);
        
        if (oldContentResult.rows.length === 0) {
            throw new Error("Content not found");
        }

        const oldContent = oldContentResult.rows[0];
        let content = bookContent.content || oldContent.content || '';

        // On gère le remplacement d'image si nécessaire
        // C'est important pour la gestion des ressources
        if (bookContent.type === 'image' && bookContent.imageFile) {
            if (oldContent.type === 'image' && oldContent.content && oldContent.content.startsWith('/images/contents/')) {
                const oldImagePath = path.join(__dirname, '../../public', oldContent.content);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            const file = bookContent.imageFile;
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(__dirname, '../../public/images/contents', fileName);
            
            await fs.promises.writeFile(filePath, file.buffer);
            content = `/images/contents/${fileName}`;
        }

        const query = `
            UPDATE "bookcontent"
            SET 
                chapter_id = COALESCE($1, chapter_id),
                content = COALESCE($2, content),
                type = COALESCE($3, type),
                "order" = COALESCE($4, "order")
            WHERE id = $5
            RETURNING *;
        `;

        const values = [
            bookContent.chapter_id,
            content,
            bookContent.type,
            bookContent.order,
            id
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("Database error");
        }
    }
};

// On supprime un contenu
// C'est important pour la maintenance et la gestion des ressources
export const deleteBookContent = async (id: number) => {
    try {
        // On récupère le contenu pour supprimer l'image associée
        // C'est crucial pour éviter les fichiers orphelins
        const content = await getBookContent(id);
        if (content && content.type === 'image' && content.content.startsWith('/images/contents/')) {
            const imagePath = path.join(__dirname, '../../public', content.content);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const query = `DELETE FROM \"bookcontent\" WHERE id = $1 RETURNING *;`;
        const values = [id];

        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            throw new Error("book content not found");
        }
        return result.rows[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
}; 