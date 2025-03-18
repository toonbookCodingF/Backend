import client from "../config/database";

export interface BookContentProps {
    id?: number;
    chapter_id: number;
    content: string;
    type?: string;
    createdAt?: Date;
}

export const getAllBookContents = async () => {
    const result = await client.query("SELECT * FROM \"BookContent\"");
    return result.rows;
};

export const getBookContent = async (id: number) => {
    const query = `SELECT * FROM \"BookContent\" WHERE id = $1;`;
    const values = [id];

    try {
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error getting book content:", error);
        throw new Error("Database error");
    }
};

export const getBookContentsByChapter = async (chapterId: number) => {
    const query = `SELECT * FROM \"BookContent\" WHERE chapter_id = $1 ORDER BY "createdAt";`;
    const values = [chapterId];

    try {
        const result = await client.query(query, values);
        return result.rows;
    } catch (error) {
        console.error("Error getting book contents by chapter:", error);
        throw new Error("Database error");
    }
};

export const createBookContent = async (bookContent: BookContentProps) => {
    try {
        // Vérifier si le chapitre existe
        const checkChapterQuery = `SELECT * FROM \"Chapter\" WHERE id = $1;`;
        const checkChapterResult = await client.query(checkChapterQuery, [bookContent.chapter_id]);
        
        if (checkChapterResult.rows.length === 0) {
            throw new Error("Chapter not found");
        }

        const query = `
            INSERT INTO \"BookContent\"
            (chapter_id, content, type, "createdAt")
            VALUES 
            ($1, $2, $3, NOW())
            RETURNING *;
        `;

        const values = [
            bookContent.chapter_id,
            bookContent.content,
            bookContent.type
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating book content:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};

export const updateBookContent = async (id: number, bookContent: Partial<BookContentProps>) => {
    try {
        const query = `
            UPDATE \"BookContent\"
            SET 
                chapter_id = COALESCE($1, chapter_id),
                content = COALESCE($2, content),
                type = COALESCE($3, type)
            WHERE id = $4
            RETURNING *;
        `;

        const values = [
            bookContent.chapter_id,
            bookContent.content,
            bookContent.type,
            id
        ];

        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            throw new Error("Book content not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Error updating book content:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};

export const deleteBookContent = async (id: number) => {
    const query = `DELETE FROM \"BookContent\" WHERE id = $1 RETURNING *;`;
    const values = [id];

    try {
        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            throw new Error("Book content not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Error deleting book content:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
}; 