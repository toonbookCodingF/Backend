import { Pool } from 'pg';
import client from '../../config/database';

describe('Database Configuration', () => {
    test('should create a valid database client', () => {
        expect(client).toBeDefined();
    });

    test('should be able to connect to the database', async () => {
        try {
            const result = await client.query('SELECT NOW()');
            expect(result.rows).toHaveLength(1);
        } finally {
            await client.end();
        }
    });
}); 