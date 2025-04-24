import { JWT_SECRET } from '../../config/jwt.config';
import jwt from 'jsonwebtoken';

describe('JWT Configuration', () => {
    test('should have a valid JWT secret', () => {
        expect(JWT_SECRET).toBeDefined();
        expect(typeof JWT_SECRET).toBe('string');
        expect(JWT_SECRET.length).toBeGreaterThan(0);
    });

    test('should be able to sign and verify a token', () => {
        const payload = { id: 1 };
        const token = jwt.sign(payload, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET);
        
        expect(decoded).toHaveProperty('id', 1);
    });

    test('should reject invalid tokens', () => {
        const invalidToken = 'invalid.token.here';
        expect(() => {
            jwt.verify(invalidToken, JWT_SECRET);
        }).toThrow();
    });
}); 