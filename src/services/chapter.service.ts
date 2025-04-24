import client from "../config/database";
import * as fs from 'fs';
import * as path from 'path';

// Interface définissant la structure d'un chapitre
interface ChapterProps {
    id?: number;
    book_id: number;
    title: string;
    status: string;
    order: number;
    createdat?: Date;
}

// Récupère tous les chapitres de la base de données
// Utilisé pour lister l'ensemble des chapitres du système
export const getAllChapters = async (): Promise<ChapterProps[]> => {
    const result = await client.query("SELECT * FROM \"chapter\"");
    return result.rows;
};

// Récupère un chapitre spécifique par son ID
// Utilisé pour obtenir les détails d'un chapitre particulier
export const getChapter = async (id: number): Promise<ChapterProps | null> => {
    const query = `SELECT * FROM \"chapter\" WHERE id = $1;`;
    const values = [id];

    try {
        const result = await client.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        throw new Error("Erreur lors de la récupération du chapitre");
    }
};

// Récupère tous les chapitres associés à un livre spécifique
// Utilisé pour construire la table des matières d'un livre
export const getChaptersByBook = async (bookId: number): Promise<ChapterProps[]> => {
    const query = `SELECT * FROM \"chapter\" WHERE book_id = $1 ORDER BY "order";`;
    const values = [bookId];

    try {
        const result = await client.query(query, values);
        return result.rows;
    } catch (error) {
        throw new Error("Erreur lors de la récupération des chapitres du livre");
    }
};

// Crée un nouveau chapitre dans la base de données
// Gère la validation et la création d'un nouveau chapitre
export const createChapter = async (chapter: ChapterProps): Promise<ChapterProps> => {
    try {
        // Vérifier si le livre existe
        const checkBookQuery = `SELECT * FROM "book" WHERE id = $1;`;
        const checkBookResult = await client.query(checkBookQuery, [chapter.book_id]);
        
        if (checkBookResult.rows.length === 0) {
            throw new Error("Livre non trouvé");
        }

        // Vérifier si l'ordre est déjà utilisé dans ce livre
        const checkOrderQuery = `SELECT * FROM "chapter" WHERE book_id = $1 AND "order" = $2;`;
        const checkOrderResult = await client.query(checkOrderQuery, [chapter.book_id, chapter.order]);
        
        if (checkOrderResult.rows.length > 0) {
            throw new Error("L'ordre est déjà utilisé dans ce livre");
        }

        const query = `
            INSERT INTO \"chapter\"
            (book_id, title, status, "order", "createdat")
            VALUES 
            ($1, $2, $3, $4, NOW())
            RETURNING *;
        `;

        const values = [
            chapter.book_id,
            chapter.title,
            chapter.status,
            chapter.order
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("Erreur lors de la création du chapitre");
        }
    }
};

// Met à jour un chapitre existant
// Permet de modifier les propriétés d'un chapitre
export const updateChapter = async (id: number, chapter: Partial<ChapterProps>): Promise<ChapterProps> => {
    const query = `
        UPDATE \"chapter\"
        SET 
            book_id = COALESCE($1, book_id),
            title = COALESCE($2, title),
            status = COALESCE($3, status),
            "order" = COALESCE($4, "order")
        WHERE id = $5
        RETURNING *;
    `;

    const values = [
        chapter.book_id,
        chapter.title,
        chapter.status,
        chapter.order,
        id
    ];

    try {
        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            throw new Error("Chapitre non trouvé");
        }
        return result.rows[0];
    } catch (error) {
        throw new Error("Erreur lors de la mise à jour du chapitre");
    }
};

// Supprime un chapitre de la base de données
// Gère la suppression propre d'un chapitre
export const deleteChapter = async (id: number): Promise<boolean> => {
    try {
        // Récupérer tous les contenus associés au chapitre
        const getContentsQuery = `SELECT * FROM "bookcontent" WHERE chapter_id = $1;`;
        const contents = await client.query(getContentsQuery, [id]);

        // Supprimer les fichiers images associés
        for (const content of contents.rows) {
            if (content.type === 'image' && content.content.startsWith('/images/contents/')) {
                const imagePath = path.join(__dirname, '../../public', content.content);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        // Supprimer le chapitre (les bookcontent seront supprimés automatiquement grâce à ON DELETE CASCADE)
        const deleteChapterQuery = `DELETE FROM "chapter" WHERE id = $1 RETURNING *;`;
        const result = await client.query(deleteChapterQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error("Chapitre non trouvé");
        }
        return true;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("Erreur lors de la suppression du chapitre");
        }
    }
}; 