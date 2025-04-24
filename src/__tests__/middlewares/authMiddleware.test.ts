import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/jwt.config';

// Mock des fonctions Express
const mockRequest = (headers = {}, cookies = {}, query = {}) => ({
    headers,
    cookies,
    query,
    user: undefined
} as Request);

const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn() as NextFunction;

describe('Middleware d\'authentification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Devrait rejeter une requête sans token', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        await authenticateToken(req, res, mockNext);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Token manquant',
            error: 'AUTH_NO_TOKEN'
        });
    });

    test('Devrait accepter une requête avec un token valide dans le header', async () => {
        const token = jwt.sign({ id: 1 }, JWT_SECRET);
        const req = mockRequest({ authorization: `Bearer ${token}` });
        const res = mockResponse();
        
        await authenticateToken(req, res, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user?.id).toBe(1);
    });

    test('Devrait accepter une requête avec un token valide dans les cookies', async () => {
        const token = jwt.sign({ id: 1 }, JWT_SECRET);
        const req = mockRequest({}, { token });
        const res = mockResponse();
        
        await authenticateToken(req, res, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user?.id).toBe(1);
    });

    test('Devrait rejeter une requête avec un token invalide', async () => {
        const req = mockRequest({ authorization: 'Bearer invalid-token' });
        const res = mockResponse();
        
        await authenticateToken(req, res, mockNext);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Token invalide ou expiré',
            error: 'AUTH_INVALID_TOKEN'
        });
    });
}); 