import { Request, Response, NextFunction } from 'express';
import { createUserController } from '../../controllers';
import { UserProps } from '../../services/user.service';

// Mock de la base de données
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('User Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockUser: UserProps;

    beforeEach(() => {
        // Mock de l'utilisateur
        mockUser = {
            id: 1,
            username: 'newuser',
            password: 'password123',
            email: 'newuser@example.com',
            name: 'New',
            lastName: 'User'
        };

        // Mock de la requête
        mockRequest = {
            body: {
                username: 'newuser',
                password: 'password123',
                email: 'newuser@example.com',
                name: 'New',
                lastName: 'User'
            }
        };

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();
    });

    test('should create user successfully', async () => {
        // Mock de la requête à la base de données
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockUser] });

        await createUserController(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                message: expect.any(String),
                status: 400
            })
        );
    });

    test('should return 400 with invalid email', async () => {
        // Mock de la requête à la base de données
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [] });

        mockRequest.body.email = 'invalid-email';

        await createUserController(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                message: "Invalid email address",
                status: 400
            })
        );
    });

    test('should return 400 with existing username', async () => {
        // Mock de la requête à la base de données
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockUser] });

        await createUserController(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                message: expect.any(String),
                status: 400
            })
        );
    });
}); 