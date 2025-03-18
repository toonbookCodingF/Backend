import client from "../config/database";

export interface BookProps {
    id?: number;
    title: string;
    description: string;
    cover: string;
    user_id: number;
    status: string;
    createdAt?: Date;
    category_id: number;
    bookType_id: number;
}

export const getAllBooks = async () => {
    const result = await client.query("SELECT * FROM \"Book\"");
    return result.rows;
};

export const getBook = async (id: number) => {
    const query = `SELECT * FROM \"Book\" WHERE id = $1;`;
    const values = [id];

    try {
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error getting book:", error);
        throw new Error("Database error");
    }
};

export const createBook = async (book: BookProps) => {
    try {
        const query = `
            INSERT INTO \"Book\"
            (title, description, cover, user_id, status, \"createdAt\", category_id, \"bookType_id\")
            VALUES 
            ($1, $2, $3, $4, $5, NOW(), $6, $7)
            RETURNING *;
        `;

        const values = [
            book.title,
            book.description,
            book.cover,
            book.user_id,
            book.status,
            book.category_id,
            book.bookType_id
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating book:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};

export const deleteBook = async (id: number) => {
    try {
        // Supprimer d'abord les chapitres associés
        const deleteChaptersQuery = `DELETE FROM \"Chapter\" WHERE book_id = $1;`;
        await client.query(deleteChaptersQuery, [id]);

        // Puis supprimer le livre
        const deleteBookQuery = `DELETE FROM \"Book\" WHERE id = $1 RETURNING *;`;
        const result = await client.query(deleteBookQuery, [id]);

        if (result.rows.length === 0) {
            throw new Error("Book not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Error deleting book:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};

export const updateBook = async (id: number, book: Partial<BookProps>) => {
    try {
        const query = `
            UPDATE \"Book\"
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                cover = COALESCE($3, cover),
                status = COALESCE($4, status),
                category_id = COALESCE($5, category_id),
                \"bookType_id\" = COALESCE($6, \"bookType_id\")
            WHERE id = $7
            RETURNING *;
        `;

        const values = [
            book.title,
            book.description,
            book.cover,
            book.status,
            book.category_id,
            book.bookType_id,
            id
        ];

        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            throw new Error("Book not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Error updating book:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
}; 