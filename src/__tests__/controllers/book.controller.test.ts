import { Request, Response, NextFunction } from 'express';
import { createBookController, getBooksController, getBookController, updateBookController, deleteBookController } from '../../controllers';
import { BookProps } from '../../types/book.types';

// On teste le contrôleur de livres car c'est une fonctionnalité centrale de l'application
// Les livres sont la ressource principale et doivent être gérés correctement
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('Book Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockBook: BookProps;

    beforeEach(() => {
        // On crée un mock de livre pour simuler les données
        // C'est important d'avoir des données cohérentes pour tous les tests
        mockBook = {
            id: 1,
            title: 'Test Book',
            description: 'Test Description',
            cover: '/images/covers/test.jpg',
            status: 'published',
            user_id: 1,
            booktype_id: 1,
            categories: [1, 2]
        };

        // On configure la requête mockée avec les paramètres nécessaires
        // Cela permet de tester le comportement du contrôleur avec différentes entrées
        mockRequest = {
            params: { id: '1' },
            body: {
                title: 'Test Book',
                description: 'Test Description',
                status: 'published',
                booktype_id: 1,
                user_id: 1
            }
        };

        // On configure la réponse mockée pour vérifier les réponses HTTP
        // C'est crucial pour s'assurer que le contrôleur renvoie les bonnes réponses
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();
    });

    // On teste la création d'un livre car c'est une opération fondamentale
    // Il faut s'assurer que les livres sont créés correctement avec toutes leurs relations
    test('should create book', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('BEGIN')) {
                return Promise.resolve();
            }
            if (query.includes('INSERT INTO book')) {
                return Promise.resolve({ rows: [mockBook] });
            }
            if (query.includes('INSERT INTO bookcategory')) {
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('COMMIT')) {
                return Promise.resolve();
            }
            return Promise.resolve({ rows: [] });
        });

        await createBookController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'book created successfully',
            data: mockBook
        });
    });

    // On teste la récupération de tous les livres car c'est une fonctionnalité essentielle
    // Les utilisateurs doivent pouvoir voir tous les livres disponibles
    test('should get all books', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBook] });

        await getBooksController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([mockBook]);
    });

    // On teste la récupération d'un livre spécifique car c'est important pour le détail
    // Les utilisateurs doivent pouvoir accéder aux détails d'un livre particulier
    test('should get book by id', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBook] });

        await getBookController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockBook);
    });

    // On teste la mise à jour d'un livre car c'est important pour la maintenance
    // Les auteurs doivent pouvoir modifier leurs livres
    test('should update book', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('BEGIN')) {
                return Promise.resolve();
            }
            if (query.includes('UPDATE book')) {
                return Promise.resolve({ rows: [mockBook] });
            }
            if (query.includes('DELETE FROM bookcategory')) {
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('INSERT INTO bookcategory')) {
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('COMMIT')) {
                return Promise.resolve();
            }
            return Promise.resolve({ rows: [] });
        });

        mockRequest.body.title = 'Updated Book';

        await updateBookController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'book updated successfully',
            data: mockBook
        });
    });

    // On teste la suppression d'un livre car c'est une opération sensible
    // Il faut s'assurer que la suppression est propre et supprime toutes les relations
    test('should delete book', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('BEGIN')) {
                return Promise.resolve();
            }
            if (query.includes('DELETE FROM bookcategory')) {
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('DELETE FROM book')) {
                return Promise.resolve({ rows: [mockBook] });
            }
            if (query.includes('COMMIT')) {
                return Promise.resolve();
            }
            return Promise.resolve({ rows: [] });
        });

        await deleteBookController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'book deleted successfully'
        });
    });
}); 