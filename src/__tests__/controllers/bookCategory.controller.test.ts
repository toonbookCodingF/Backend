import { Request, Response, NextFunction } from 'express';
import { getAllBookCategoriesController, getBookCategoryController, getCategoriesByBookController, getBooksByCategoryIdController, createBookCategoryController, updateBookCategoryController, deleteBookCategoryController } from '../../controllers';

// Mock de la base de données
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('BookCategory Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockBookCategory: any;

    beforeEach(() => {
        // Mock de la relation livre-catégorie
        mockBookCategory = {
            book_id: 1,
            category_id: 1,
            book_title: 'Test Book',
            category_name: 'Test Category'
        };

        // Mock de la requête
        mockRequest = {
            params: { bookId: '1', categoryId: '1', oldBookId: '1', oldCategoryId: '1' },
            body: {
                bookId: 1,
                categoryId: 1,
                newBookId: 2,
                newCategoryId: 2
            }
        };

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();
    });

    test('should get all book categories', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookCategory] });

        await getAllBookCategoriesController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Relations livre-catégorie récupérées avec succès',
            data: [mockBookCategory]
        });
    });

    test('should get book category by id', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookCategory] });

        await getBookCategoryController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Relation livre-catégorie récupérée avec succès',
            data: mockBookCategory
        });
    });

    test('should get categories by book', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookCategory] });

        await getCategoriesByBookController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Catégories du livre récupérées avec succès',
            data: [mockBookCategory]
        });
    });

    test('should get books by category', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookCategory] });

        await getBooksByCategoryIdController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Livres de la catégorie récupérés avec succès',
            data: [mockBookCategory]
        });
    });

    test('should create book category successfully', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT id FROM "book"')) {
                return Promise.resolve({ rows: [{ id: 1 }] });
            }
            if (query.includes('SELECT id FROM "Category"')) {
                return Promise.resolve({ rows: [{ id: 1 }] });
            }
            if (query.includes('SELECT * FROM "bookcategory"')) {
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('INSERT INTO "bookcategory"')) {
                return Promise.resolve({ rows: [mockBookCategory] });
            }
            return Promise.resolve({ rows: [] });
        });

        await createBookCategoryController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 201,
            message: 'Relation livre-catégorie créée avec succès',
            data: mockBookCategory
        });
    });

    test('should update book category', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "bookcategory" WHERE book_id = $1 AND category_id = $2')) {
                if (params && params[0] === 1 && params[1] === 1) {
                    return Promise.resolve({ rows: [mockBookCategory] });
                }
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('SELECT id FROM "book"')) {
                return Promise.resolve({ rows: [{ id: 2 }] });
            }
            if (query.includes('SELECT id FROM "Category"')) {
                return Promise.resolve({ rows: [{ id: 2 }] });
            }
            if (query.includes('UPDATE "bookcategory"')) {
                return Promise.resolve({ rows: [mockBookCategory] });
            }
            return Promise.resolve({ rows: [] });
        });

        await updateBookCategoryController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Relation livre-catégorie mise à jour avec succès',
            data: mockBookCategory
        });
    });

    test('should delete book category', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "bookcategory" WHERE book_id = $1 AND category_id = $2')) {
                return Promise.resolve({ rows: [mockBookCategory] });
            }
            if (query.includes('DELETE FROM "bookcategory"')) {
                return Promise.resolve({ rows: [mockBookCategory] });
            }
            return Promise.resolve({ rows: [] });
        });

        await deleteBookCategoryController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Relation livre-catégorie supprimée avec succès',
            data: mockBookCategory
        });
    });
}); 