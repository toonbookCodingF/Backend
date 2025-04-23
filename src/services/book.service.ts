import client from '../config/database';
import { BookProps } from '../types/book.types';
import fs from 'fs';
import path from 'path';

// Récupère tous les livres avec leurs catégories pour permettre une vue d'ensemble complète
// Utilise LEFT JOIN pour inclure les livres même sans catégories, car un livre peut exister sans catégorie
export const getAllBooks = async () => {
    const query = `
        SELECT 
            b.id,
            b.title,
            b.description,
            b.cover,
            b.status,
            b.createdat,
            b.user_id,
            b.booktype_id,
            array_agg(bc.category_id) as categories
        FROM book b
        LEFT JOIN bookcategory bc ON b.id = bc.book_id
        GROUP BY b.id, b.title, b.description, b.cover, b.status, b.createdat, b.user_id, b.booktype_id
        ORDER BY b.title
    `;
    const result = await client.query(query);
    return result.rows;
};

// Récupère un livre spécifique avec ses catégories pour afficher tous les détails nécessaires
// Utilise LEFT JOIN pour gérer le cas où le livre n'a pas encore de catégories
export const getBook = async (id: number) => {
    const query = `
        SELECT 
            b.id,
            b.title,
            b.description,
            b.cover,
            b.status,
            b.createdat,
            b.user_id,
            b.booktype_id,
            array_agg(bc.category_id) as categories
        FROM book b
        LEFT JOIN bookcategory bc ON b.id = bc.book_id
        WHERE b.id = $1
        GROUP BY b.id, b.title, b.description, b.cover, b.status, b.createdat, b.user_id, b.booktype_id
    `;
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
        JOIN "bookcategory" bc ON c.id = bc.category_id
        WHERE bc.book_id = $1
        ORDER BY c.name
    `;
    const result = await client.query(query, [bookId]);
    return result.rows;
};

// Crée un nouveau livre avec gestion des catégories multiples
// Utilise une transaction pour garantir que soit le livre et toutes ses catégories sont créés, soit rien n'est créé
export const createBook = async (book: BookProps, coverFile?: Express.Multer.File) => {
    try {
        let coverPath = '';
        
        // Gère le téléchargement de la couverture pour permettre une visualisation immédiate du livre
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

        // Utilise une transaction pour garantir l'intégrité des données entre le livre et ses catégories
        await client.query('BEGIN');

        try {
            // Crée d'abord le livre pour obtenir son ID avant d'ajouter les catégories
            const bookResult = await client.query(
                `INSERT INTO book (title, description, cover, status, booktype_id, user_id, createdat) 
                 VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
                 RETURNING *`,
                [book.title, book.description, coverPath, book.status, book.booktype_id, book.user_id]
            );

            const newBook = bookResult.rows[0];

            // Ajoute les catégories une par une pour permettre une gestion flexible des erreurs
            if (book.categories && book.categories.length > 0) {
                for (const categoryId of book.categories) {
                    await client.query(
                        'INSERT INTO bookcategory (book_id, category_id) VALUES ($1, $2)',
                        [newBook.id, categoryId]
                    );
                }
            }

            await client.query('COMMIT');
            return newBook;
        } catch (error) {
            // Annule toute la transaction en cas d'erreur pour éviter des données incohérentes
            await client.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error in createBook:', error);
        throw error;
    }
};

// Met à jour un livre et ses catégories de manière atomique
// Utilise une transaction pour garantir que toutes les modifications sont appliquées ou aucune
export const updateBook = async (id: number, book: Partial<BookProps>, coverFile?: Express.Multer.File) => {
    try {
        let coverPath = '';
        
        // Gère la mise à jour de la couverture pour maintenir la cohérence visuelle
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

            // Supprime l'ancienne couverture pour éviter l'accumulation de fichiers inutilisés
            const oldBook = await getBook(id);
            if (oldBook && oldBook.cover) {
                const oldCoverPath = path.join(__dirname, '../../public', oldBook.cover);
                if (fs.existsSync(oldCoverPath)) {
                    fs.unlinkSync(oldCoverPath);
                }
            }
        }

        // Utilise une transaction pour garantir la cohérence des données
        await client.query('BEGIN');

        try {
            // Met à jour d'abord les informations de base du livre
            const result = await client.query(
                `UPDATE book 
                 SET title = COALESCE($1, title),
                     description = COALESCE($2, description),
                     cover = COALESCE($3, cover),
                     status = COALESCE($4, status),
                     booktype_id = COALESCE($5, booktype_id)
                 WHERE id = $6
                 RETURNING *`,
                [book.title, book.description, coverPath, book.status, book.booktype_id, id]
            );

            // Gère la mise à jour des catégories de manière atomique
            if (book.categories) {
                // Supprime toutes les anciennes catégories pour éviter les doublons
                await client.query('DELETE FROM bookcategory WHERE book_id = $1', [id]);
                
                // Ajoute les nouvelles catégories
                for (const categoryId of book.categories) {
                    await client.query(
                        'INSERT INTO bookcategory (book_id, category_id) VALUES ($1, $2)',
                        [id, categoryId]
                    );
                }
            }

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            // Annule la transaction en cas d'erreur pour maintenir la cohérence des données
            await client.query('ROLLBACK');
            throw error;
        }
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
        await client.query('DELETE FROM "chapter" WHERE book_id = $1', [id]);
        const result = await client.query('DELETE FROM "book" WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error in deleteBook:', error);
        throw error;
    }
}; 