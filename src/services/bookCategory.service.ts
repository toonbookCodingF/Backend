import client from '../config/database';

export const getAllBookCategories = async () => {
    const query = `
        SELECT 
            bc.book_id,
            bc.category_id,
            b.title as book_title,
            c."nameCategory" as category_name
        FROM "bookcategory" bc
        JOIN "book" b ON bc.book_id = b.id
        JOIN "Category" c ON bc.category_id = c.id
        ORDER BY b.title, c."nameCategory"
    `;
    const result = await client.query(query);
    return result.rows;
};

export const getBookCategory = async (bookId: number, categoryId: number) => {
    const query = `
        SELECT 
            bc.book_id,
            bc.category_id,
            b.title as book_title,
            c."nameCategory" as category_name
        FROM "bookcategory" bc
        JOIN "book" b ON bc.book_id = b.id
        JOIN "Category" c ON bc.category_id = c.id
        WHERE bc.book_id = $1 AND bc.category_id = $2
    `;
    const result = await client.query(query, [bookId, categoryId]);
    return result.rows[0];
};

export const getCategoriesByBook = async (bookId: number) => {
    const query = `
        SELECT 
            c.id as category_id,
            c."nameCategory" as category_name
        FROM "bookcategory" bc
        JOIN "Category" c ON bc.category_id = c.id
        WHERE bc.book_id = $1
        ORDER BY c."nameCategory"
    `;
    const result = await client.query(query, [bookId]);
    return result.rows;
};

export const getBooksByCategory = async (categoryId: number) => {
    const query = `
        SELECT 
            b.id as book_id,
            b.title as book_title,
            b.description as book_description,
            b.cover,
            b.status,
            b."createdAt"
        FROM "bookcategory" bc
        JOIN "book" b ON bc.book_id = b.id
        WHERE bc.category_id = $1
        ORDER BY b.title
    `;
    const result = await client.query(query, [categoryId]);
    return result.rows;
};

export const createBookCategory = async (bookId: number, categoryId: number) => {
    try {
        // Vérifier si le livre existe
        const bookQuery = 'SELECT id FROM "book" WHERE id = $1';
        const bookResult = await client.query(bookQuery, [bookId]);
        if (bookResult.rows.length === 0) {
            throw new Error('Livre non trouvé');
        }

        // Vérifier si la catégorie existe
        const categoryQuery = 'SELECT id FROM "Category" WHERE id = $1';
        const categoryResult = await client.query(categoryQuery, [categoryId]);
        if (categoryResult.rows.length === 0) {
            throw new Error('Catégorie non trouvée');
        }

        // Vérifier si la relation existe déjà
        const existingQuery = 'SELECT * FROM "bookcategory" WHERE book_id = $1 AND category_id = $2';
        const existingResult = await client.query(existingQuery, [bookId, categoryId]);
        if (existingResult.rows.length > 0) {
            throw new Error('Cette relation livre-catégorie existe déjà');
        }

        // Créer la relation
        const insertQuery = 'INSERT INTO "bookcategory" (book_id, category_id) VALUES ($1, $2) RETURNING *';
        const result = await client.query(insertQuery, [bookId, categoryId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error in createBookCategory:', error);
        throw error;
    }
};

export const updateBookCategory = async (oldBookId: number, oldCategoryId: number, newBookId: number, newCategoryId: number) => {
    try {
        // Vérifier si la relation existe
        const existingQuery = 'SELECT * FROM "bookcategory" WHERE book_id = $1 AND category_id = $2';
        const existingResult = await client.query(existingQuery, [oldBookId, oldCategoryId]);
        if (existingResult.rows.length === 0) {
            throw new Error('Relation livre-catégorie non trouvée');
        }

        // Vérifier si le nouveau livre existe
        const bookQuery = 'SELECT id FROM "book" WHERE id = $1';
        const bookResult = await client.query(bookQuery, [newBookId]);
        if (bookResult.rows.length === 0) {
            throw new Error('Nouveau livre non trouvé');
        }

        // Vérifier si la nouvelle catégorie existe
        const categoryQuery = 'SELECT id FROM "Category" WHERE id = $1';
        const categoryResult = await client.query(categoryQuery, [newCategoryId]);
        if (categoryResult.rows.length === 0) {
            throw new Error('Nouvelle catégorie non trouvée');
        }

        // Vérifier si la nouvelle relation existe déjà
        const newExistingQuery = 'SELECT * FROM "bookcategory" WHERE book_id = $1 AND category_id = $2';
        const newExistingResult = await client.query(newExistingQuery, [newBookId, newCategoryId]);
        if (newExistingResult.rows.length > 0) {
            throw new Error('Cette nouvelle relation livre-catégorie existe déjà');
        }

        // Mettre à jour la relation
        const updateQuery = `
            UPDATE "bookcategory" 
            SET book_id = $1, category_id = $2 
            WHERE book_id = $3 AND category_id = $4 
            RETURNING *
        `;
        const result = await client.query(updateQuery, [newBookId, newCategoryId, oldBookId, oldCategoryId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateBookCategory:', error);
        throw error;
    }
};

export const deleteBookCategory = async (bookId: number, categoryId: number) => {
    try {
        // Vérifier si la relation existe
        const existingQuery = 'SELECT * FROM "bookcategory" WHERE book_id = $1 AND category_id = $2';
        const existingResult = await client.query(existingQuery, [bookId, categoryId]);
        if (existingResult.rows.length === 0) {
            throw new Error('Relation livre-catégorie non trouvée');
        }

        // Supprimer la relation
        const deleteQuery = 'DELETE FROM "bookcategory" WHERE book_id = $1 AND category_id = $2 RETURNING *';
        const result = await client.query(deleteQuery, [bookId, categoryId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error in deleteBookCategory:', error);
        throw error;
    }
}; 