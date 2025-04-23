import client from "../config/database";
import * as fs from 'fs';
import * as path from 'path';

export interface BookContentProps {
    id?: number;
    chapter_id: number;
    content: string;
    type: 'text' | 'image';
    order: number;
    imageFile?: Express.Multer.File;
}

export const getAllBookContents = async () => {
    const result = await client.query("SELECT * FROM \"bookcontent\"");
    return result.rows;
};

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

export const createBookContent = async (bookContent: BookContentProps, imageFile?: Express.Multer.File) => {
    try {
        // Vérifier si le chapitre existe
        const checkChapterQuery = `SELECT * FROM \"chapter\" WHERE id = $1;`;
        const checkChapterResult = await client.query(checkChapterQuery, [bookContent.chapter_id]);
        
        if (checkChapterResult.rows.length === 0) {
            throw new Error("chapter not found");
        }

        let content = bookContent.content || '';

        // Si une image est fournie, la sauvegarder et mettre à jour le content avec le chemin
        if (imageFile) {
            const uploadDir = path.join(__dirname, '../../public/images/contents');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `${Date.now()}-${imageFile.originalname}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, imageFile.buffer);
            content = `/images/contents/${fileName}`;
        }

        const query = `
            INSERT INTO \"bookcontent\"
            (chapter_id, content, type, "createdat", "order")
            VALUES 
            ($1, $2, $3, NOW(), $4)
            RETURNING *;
        `;

        const values = [
            bookContent.chapter_id,
            content,
            bookContent.type,
            bookContent.order
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};

export const updateBookContent = async (id: number, bookContent: Partial<BookContentProps>) => {
    try {
        // Récupérer l'ancien contenu pour vérifier s'il y a une image à supprimer
        const oldContentQuery = `SELECT * FROM "bookcontent" WHERE id = $1;`;
        const oldContentResult = await client.query(oldContentQuery, [id]);
        
        if (oldContentResult.rows.length === 0) {
            throw new Error("Content not found");
        }

        const oldContent = oldContentResult.rows[0];
        let content = bookContent.content || oldContent.content || '';

        // Si c'est une image, gérer le fichier
        if (bookContent.type === 'image' && bookContent.imageFile) {
            // Supprimer l'ancienne image si elle existe
            if (oldContent.type === 'image' && oldContent.content && oldContent.content.startsWith('/images/contents/')) {
                const oldImagePath = path.join(__dirname, '../../public', oldContent.content);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Sauvegarder la nouvelle image
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

export const deleteBookContent = async (id: number) => {
    try {
        // Récupérer le contenu pour supprimer l'image
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