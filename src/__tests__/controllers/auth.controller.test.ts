import { Request, Response, NextFunction } from 'express';
import { loginController } from '../../controllers';
import { UserProps } from '../../services/user.service';
import argon2 from 'argon2';

// Mock de la base de données
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockUser: UserProps;

    beforeEach(async () => {
        // Mock de l'utilisateur
        mockUser = {
            id: 1,
            username: 'testuser',
            password: await argon2.hash('password123'),
            email: 'test@example.com',
            name: 'Test',
            lastName: 'User'
        };

        // Mock de la requête
        mockRequest = {
            body: {
                email: 'test@example.com',
                password: 'password123'
            }
        };

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };

        nextFunction = jest.fn();
    });

    test('should login successfully with correct credentials', async () => {
        // Mock de la requête à la base de données
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockUser] });

        await loginController(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.any(Object),
                message: expect.any(String),
                status: 200
            })
        );
    });

    test('should return 401 with incorrect password', async () => {
        // Mock de la requête à la base de données
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockUser] });

        mockRequest.body.password = 'wrongpassword';

        await loginController(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                message: expect.any(String),
                status: 401
            })
        );
    });

    test('should return 401 with non-existent email', async () => {
        // Mock de la requête à la base de données
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [] });

        mockRequest.body.email = 'nonexistent@example.com';

        await loginController(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                message: expect.any(String),
                status: 401
            })
        );
    });
}); 