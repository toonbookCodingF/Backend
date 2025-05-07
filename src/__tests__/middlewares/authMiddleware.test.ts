import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/jwt.config';

// On teste le middleware d'authentification car c'est un composant critique de sécurité
// Il protège les routes et doit fonctionner correctement pour éviter les accès non autorisés

// On crée des fonctions utilitaires pour les mocks
// Cela permet de réutiliser le même code de configuration dans tous les tests
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

    // On teste le cas sans token car c'est le scénario le plus basique
    // Il faut s'assurer que le middleware bloque les requêtes non authentifiées
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

    // On teste le token dans le header car c'est la méthode standard d'authentification
    // La plupart des clients API utilisent cette méthode
    test('Devrait accepter une requête avec un token valide dans le header', async () => {
        const token = jwt.sign({ id: 1 }, JWT_SECRET);
        const req = mockRequest({ authorization: `Bearer ${token}` });
        const res = mockResponse();
        
        await authenticateToken(req, res, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user?.id).toBe(1);
    });

    // On teste le token dans les cookies car c'est une méthode alternative
    // Certains clients web préfèrent utiliser les cookies pour la persistance
    test('Devrait accepter une requête avec un token valide dans les cookies', async () => {
        const token = jwt.sign({ id: 1 }, JWT_SECRET);
        const req = mockRequest({}, { token });
        const res = mockResponse();
        
        await authenticateToken(req, res, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user?.id).toBe(1);
    });

    // On teste le token invalide car c'est un scénario d'erreur courant
    // Il faut s'assurer que le middleware gère correctement les tokens corrompus
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