import { Request, Response, NextFunction } from 'express';
import { getAllCategoriesController, getCategoryController, getBooksByCategoryController } from '../../controllers';

// Mock de la base de données
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('Category Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockCategory: any;
    let mockBook: any;

    beforeEach(() => {
        // Mock de la catégorie
        mockCategory = {
            id: 1,
            name: 'Test Category',
            description: 'Test Description'
        };

        // Mock du livre
        mockBook = {
            id: 1,
            title: 'Test Book',
            description: 'Test Description',
            cover: '/images/covers/test.jpg',
            status: 'published',
            createdat: new Date(),
            user_id: 1,
            booktype_id: 1
        };

        // Mock de la requête
        mockRequest = {
            params: { id: '1', categoryId: '1' }
        };

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();
    });

    test('should get all categories', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockCategory] });

        await getAllCategoriesController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Catégories récupérées avec succès',
            data: [mockCategory]
        });
    });

    test('should get category by id', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockCategory] });

        await getCategoryController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Catégorie récupérée avec succès',
            data: mockCategory
        });
    });

    test('should return 404 when category not found', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [] });

        await getCategoryController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 404,
            message: 'Catégorie non trouvée',
            data: null
        });
    });

    test('should get books by category', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBook] });

        await getBooksByCategoryController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Livres de la catégorie récupérés avec succès',
            data: [mockBook]
        });
    });

    test('should return 404 when no books found for category', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [] });

        await getBooksByCategoryController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 404,
            message: 'Aucun livre trouvé pour cette catégorie',
            data: null
        });
    });
}); 