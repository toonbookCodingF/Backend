import client from '../config/database';
import { MyReading, CreateMyReadingDTO, UpdateMyReadingDTO } from '../types/myreading.types';

export const createMyReading = async (dto: CreateMyReadingDTO): Promise<MyReading> => {
    const query = `
        INSERT INTO myreadings (user_id, book_id, isverified)
        VALUES ($1, $2, false)
        RETURNING *
    `;
    const values = [dto.user_id, dto.book_id];
    const result = await client.query(query, values);
    return result.rows[0];
};

export const getAllMyReadings = async (): Promise<MyReading[]> => {
    const query = 'SELECT * FROM myreadings ORDER BY createdat DESC';
    const result = await client.query(query);
    return result.rows;
};

export const getMyReadingById = async (id: number): Promise<MyReading | null> => {
    const query = 'SELECT * FROM myreadings WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
};

export const getMyReadingsByUserId = async (userId: number): Promise<MyReading[]> => {
    const query = 'SELECT * FROM myreadings WHERE user_id = $1 ORDER BY createdat DESC';
    const result = await client.query(query, [userId]);
    return result.rows;
};

export const getMyReadingsByBookId = async (bookId: number): Promise<MyReading[]> => {
    const query = 'SELECT * FROM myreadings WHERE book_id = $1 ORDER BY createdat DESC';
    const result = await client.query(query, [bookId]);
    return result.rows;
};

export const getVerifiedMyReadingsByUserId = async (userId: number): Promise<MyReading[]> => {
    const query = 'SELECT * FROM myreadings WHERE user_id = $1 AND isverified = true ORDER BY createdat DESC';
    const result = await client.query(query, [userId]);
    return result.rows;
};

export const getUnverifiedMyReadingsByUserId = async (userId: number): Promise<MyReading[]> => {
    const query = 'SELECT * FROM myreadings WHERE user_id = $1 AND isverified = false ORDER BY createdat DESC';
    const result = await client.query(query, [userId]);
    return result.rows;
};

export const toggleMyReadingVerification = async (id: number): Promise<MyReading | null> => {
    const query = `
        UPDATE myreadings
        SET isverified = NOT isverified
        WHERE id = $1
        RETURNING *
    `;
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
};

export const deleteMyReading = async (id: number): Promise<MyReading | null> => {
    const query = 'DELETE FROM myreadings WHERE id = $1 RETURNING *';
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
}; 