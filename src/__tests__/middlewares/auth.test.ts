import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/jwt.config';
import { UserProps } from '../../services/user.service';

describe('Auth Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {},
            cookies: {},
            query: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    test('should return 401 if no token is provided', async () => {
        await authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Token manquant',
            error: 'AUTH_NO_TOKEN'
        });
    });

    test('should accept request with valid token in header', async () => {
        const token = jwt.sign({ id: 1, username: 'test', password: 'test', email: 'test@test.com', name: 'Test', lastName: 'User' }, JWT_SECRET);
        mockRequest = {
            headers: {
                authorization: `Bearer ${token}`
            },
            cookies: {},
            query: {}
        };

        await authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user).toBeDefined();
        expect(mockRequest.user?.id).toBe(1);
    });

    test('should accept request with valid token in cookies', async () => {
        const token = jwt.sign({ id: 1, username: 'test', password: 'test', email: 'test@test.com', name: 'Test', lastName: 'User' }, JWT_SECRET);
        mockRequest = {
            headers: {},
            cookies: {
                token: token
            },
            query: {}
        };

        await authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user).toBeDefined();
        expect(mockRequest.user?.id).toBe(1);
    });
}); 