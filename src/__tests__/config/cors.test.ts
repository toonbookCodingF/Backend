import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { createApp } from '../../index';
import client from '../../config/database';

// On teste la configuration CORS car c'est un composant critique de sécurité
// Il contrôle l'accès aux ressources depuis différents domaines
describe('Configuration CORS', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let app: any;

    beforeEach(() => {
        // On crée une instance de l'application pour accéder à sa configuration CORS
        app = createApp();
        
        // On configure les mocks pour simuler une requête HTTP
        mockRequest = {
            headers: {
                origin: 'http://localhost:3001'
            },
            method: 'GET'
        };

        // On configure la réponse mockée pour vérifier les en-têtes CORS
        mockResponse = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            end: jest.fn(),
            getHeader: jest.fn(),
            set: jest.fn(),
            header: jest.fn(),
            get: jest.fn(),
            append: jest.fn(),
            removeHeader: jest.fn(),
            write: jest.fn(),
            send: jest.fn(),
            json: jest.fn(),
            type: jest.fn(),
            redirect: jest.fn(),
            render: jest.fn(),
            locals: {},
            statusCode: 200
        };

        nextFunction = jest.fn();
    });

    afterEach(async () => {
        // On ferme la connexion à la base de données après chaque test
        await client.end();
    });

    // On teste que la configuration CORS accepte les requêtes cross-origin
    // C'est important pour permettre l'accès depuis le frontend
    test('Devrait accepter les requêtes cross-origin', () => {
        // On récupère le middleware CORS de l'application
        const corsMiddleware = app._router.stack.find((layer: any) => layer.name === 'corsMiddleware');
        
        corsMiddleware.handle(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'Access-Control-Allow-Origin',
            'http://localhost:3001'
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'Access-Control-Allow-Credentials',
            'true'
        );
        expect(nextFunction).toHaveBeenCalled();
    });

    // On teste que la configuration CORS gère correctement les requêtes OPTIONS
    // C'est important pour la sécurité et la flexibilité de l'API
    test('Devrait gérer correctement les requêtes OPTIONS', () => {
        const corsMiddleware = app._router.stack.find((layer: any) => layer.name === 'corsMiddleware');
        mockRequest.method = 'OPTIONS';

        corsMiddleware.handle(mockRequest as Request, mockResponse as Response, nextFunction);

        // On vérifie que les en-têtes CORS de base sont présents
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'Access-Control-Allow-Origin',
            'http://localhost:3001'
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'Access-Control-Allow-Credentials',
            'true'
        );
        // Pour les requêtes OPTIONS, on s'attend à ce que la réponse soit terminée
        expect(mockResponse.end).toHaveBeenCalled();
        expect(nextFunction).not.toHaveBeenCalled();
    });

    // On teste que la configuration CORS gère correctement les requêtes avec des en-têtes personnalisés
    // C'est important pour permettre l'envoi de données personnalisées
    test('Devrait gérer correctement les requêtes avec des en-têtes personnalisés', () => {
        const corsMiddleware = app._router.stack.find((layer: any) => layer.name === 'corsMiddleware');
        mockRequest.method = 'OPTIONS';
        mockRequest.headers = {
            ...mockRequest.headers,
            'access-control-request-headers': 'Content-Type, Authorization'
        };

        corsMiddleware.handle(mockRequest as Request, mockResponse as Response, nextFunction);

        // On vérifie que les en-têtes CORS de base sont présents
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'Access-Control-Allow-Origin',
            'http://localhost:3001'
        );
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'Access-Control-Allow-Credentials',
            'true'
        );
        // Pour les requêtes OPTIONS, on s'attend à ce que la réponse soit terminée
        expect(mockResponse.end).toHaveBeenCalled();
        expect(nextFunction).not.toHaveBeenCalled();
    });
}); 