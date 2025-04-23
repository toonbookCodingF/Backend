import client from '../config/database';

export const getAllCategories = async () => {
    const query = 'SELECT * FROM category ORDER BY namecategory';
    const result = await client.query(query);
    return result.rows;
};

export const getCategory = async (id: number) => {
    const query = 'SELECT * FROM category WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0];
};

export const getBooksByCategory = async (categoryId: number) => {
    const query = `
        SELECT 
            b.id,
            b.title,
            b.description,
            b.cover,
            b.status,
            b.createdat,
            b.user_id,
            b.booktype_id
        FROM book b
        JOIN bookcategory bc ON b.id = bc.book_id
        WHERE bc.category_id = $1
        ORDER BY b.title
    `;
    const result = await client.query(query, [categoryId]);
    return result.rows;
}; 