import client from "../config/database";
import * as fs from 'fs';
import * as path from 'path';

export interface ChapterProps {
    id?: number;
    book_id: number;
    title: string;
    status: string;
    order: number;
    createdAt?: Date;
}

export const getAllChapters = async () => {
    const result = await client.query("SELECT * FROM \"Chapter\"");
    return result.rows;
};

export const getChapter = async (id: number) => {
    const query = `SELECT * FROM \"Chapter\" WHERE id = $1;`;
    const values = [id];

    try {
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw new Error("Database error");
    }
};

export const getChaptersByBook = async (bookId: number) => {
    const query = `SELECT * FROM \"Chapter\" WHERE book_id = $1 ORDER BY "order";`;
    const values = [bookId];

    try {
        const result = await client.query(query, values);
        return result.rows;
    } catch (error) {
        throw new Error("Database error");
    }
};

export const createChapter = async (chapter: ChapterProps) => {
    try {
        // Vérifier si le livre existe
        const checkBookQuery = `SELECT * FROM "Book" WHERE id = $1;`;
        const checkBookResult = await client.query(checkBookQuery, [chapter.book_id]);
        
        if (checkBookResult.rows.length === 0) {
            throw new Error("Book not found");
        }

        // Vérifier si l'ordre est déjà utilisé dans ce livre
        const checkOrderQuery = `SELECT * FROM "Chapter" WHERE book_id = $1 AND "order" = $2;`;
        const checkOrderResult = await client.query(checkOrderQuery, [chapter.book_id, chapter.order]);
        
        if (checkOrderResult.rows.length > 0) {
            throw new Error("Order already used in this book");
        }

        const query = `
            INSERT INTO \"Chapter\"
            (book_id, title, status, "order", "createdAt")
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
            throw new Error("Database error");
        }
    }
};

export const updateChapter = async (id: number, chapter: Partial<ChapterProps>) => {
    const query = `
        UPDATE \"Chapter\"
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
            throw new Error("Chapter not found");
        }
        return result.rows[0];
    } catch (error) {
        throw new Error("Database error");
    }
};

export const deleteChapter = async (id: number) => {
    try {
        // Récupérer tous les contenus associés au chapitre
        const getContentsQuery = `SELECT * FROM "BookContent" WHERE chapter_id = $1;`;
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

        // Supprimer le chapitre (les BookContent seront supprimés automatiquement grâce à ON DELETE CASCADE)
        const deleteChapterQuery = `DELETE FROM "Chapter" WHERE id = $1 RETURNING *;`;
        const result = await client.query(deleteChapterQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error("Chapter not found");
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