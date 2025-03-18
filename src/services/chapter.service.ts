import client from "../config/database";

export interface ChapterProps {
    id?: number;
    book_id: number;
    status: string;
    createdAt?: Date;
    title: string;
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
        console.error("Error getting chapter:", error);
        throw new Error("Database error");
    }
};

export const getChaptersByBook = async (bookId: number) => {
    const query = `SELECT * FROM \"Chapter\" WHERE book_id = $1;`;
    const values = [bookId];

    try {
        const result = await client.query(query, values);
        return result.rows;
    } catch (error) {
        console.error("Error getting chapters by book:", error);
        throw new Error("Database error");
    }
};

export const createChapter = async (chapter: ChapterProps) => {
    try {
        // Vérifier si le livre existe
        const checkBookQuery = `SELECT * FROM \"Book\" WHERE id = $1;`;
        const checkBookResult = await client.query(checkBookQuery, [chapter.book_id]);
        
        if (checkBookResult.rows.length === 0) {
            throw new Error("Book not found");
        }

        const query = `
            INSERT INTO \"Chapter\"
            (book_id, status, title, "createdAt")
            VALUES 
            ($1, $2, $3, NOW())
            RETURNING *;
        `;

        const values = [
            chapter.book_id,
            chapter.status,
            chapter.title
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating chapter:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};

export const updateChapter = async (id: number, chapter: Partial<ChapterProps>) => {
    try {
        const query = `
            UPDATE \"Chapter\"
            SET 
                book_id = COALESCE($1, book_id),
                status = COALESCE($2, status),
                title = COALESCE($3, title)
            WHERE id = $4
            RETURNING *;
        `;

        const values = [
            chapter.book_id,
            chapter.status,
            chapter.title,
            id
        ];

        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            throw new Error("Chapter not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Error updating chapter:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};

export const deleteChapter = async (id: number) => {
    try {
        // Supprimer d'abord les contenus associés
        const deleteContentsQuery = `DELETE FROM "BookContent" WHERE chapter_id = $1;`;
        await client.query(deleteContentsQuery, [id]);

        // Puis supprimer le chapitre
        const deleteChapterQuery = `DELETE FROM "Chapter" WHERE id = $1 RETURNING *;`;
        const result = await client.query(deleteChapterQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error("Chapter not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Error deleting chapter:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
}; 