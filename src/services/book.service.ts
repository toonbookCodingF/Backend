import client from '../config/database';
import { BookProps } from '../types/book.types';
import fs from 'fs';
import path from 'path';

export const getAllBooks = async () => {
    const query = 'SELECT * FROM "Book" ORDER BY title';
    const result = await client.query(query);
    return result.rows;
};

export const getBook = async (id: number) => {
    const query = 'SELECT * FROM "Book" WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0];
};

export const getCategoriesByBook = async (bookId: number) => {
    const query = `
        SELECT 
            c.id,
            c.name,
            c.description
        FROM "Category" c
        JOIN "Book_Category" bc ON c.id = bc.category_id
        WHERE bc.book_id = $1
        ORDER BY c.name
    `;
    const result = await client.query(query, [bookId]);
    return result.rows;
};

export const createBook = async (book: BookProps, coverFile?: Express.Multer.File) => {
    try {
        let coverPath = '';
        
        if (coverFile) {
            const uploadDir = path.join(__dirname, '../../public/images/covers');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileExtension = path.extname(coverFile.originalname);
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, coverFile.buffer);
            coverPath = `/images/covers/${fileName}`;
        }

        const result = await client.query(
            `INSERT INTO "Book" (title, description, cover, status, category_id, "bookType_id", user_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [book.title, book.description, coverPath, book.status, book.category_id, book.bookType_id, book.user_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in createBook:', error);
        throw error;
    }
};

export const updateBook = async (id: number, book: Partial<BookProps>, coverFile?: Express.Multer.File) => {
    try {
        let coverPath = '';
        
        if (coverFile) {
            const uploadDir = path.join(__dirname, '../../public/images/covers');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileExtension = path.extname(coverFile.originalname);
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, coverFile.buffer);
            coverPath = `/images/covers/${fileName}`;

            // Supprimer l'ancienne couverture si elle existe
            const oldBook = await getBook(id);
            if (oldBook && oldBook.cover) {
                const oldCoverPath = path.join(__dirname, '../../public', oldBook.cover);
                if (fs.existsSync(oldCoverPath)) {
                    fs.unlinkSync(oldCoverPath);
                }
            }
        }

        const result = await client.query(
            `UPDATE "Book" 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 cover = COALESCE($3, cover),
                 status = COALESCE($4, status),
                 category_id = COALESCE($5, category_id),
                 "bookType_id" = COALESCE($6, "bookType_id")
             WHERE id = $7
             RETURNING *`,
            [book.title, book.description, coverPath, book.status, book.category_id, book.bookType_id, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateBook:', error);
        throw error;
    }
};

export const deleteBook = async (id: number) => {
    try {
        // Supprimer la couverture si elle existe
        const book = await getBook(id);
        if (book && book.cover) {
            const coverPath = path.join(__dirname, '../../public', book.cover);
            if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath);
            }
        }

        // Supprimer le livre et tous ses chapitres associés
        await client.query('DELETE FROM "Chapter" WHERE book_id = $1', [id]);
        const result = await client.query('DELETE FROM "Book" WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error in deleteBook:', error);
        throw error;
    }
}; 