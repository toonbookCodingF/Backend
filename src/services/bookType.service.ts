import client from '../config/database';

export const getAllBookTypes = async () => {
    const query = 'SELECT * FROM "BookType"';
    const result = await client.query(query);
    return result.rows;
};

export const getBookType = async (id: number) => {
    const query = 'SELECT * FROM "BookType" WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0];
}; 