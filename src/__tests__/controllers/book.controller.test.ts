import { Request, Response, NextFunction } from 'express';
import { createBookController, getBooksController, getBookController, updateBookController, deleteBookController } from '../../controllers';
import { BookProps } from '../../types/book.types';

// Mock de la base de données
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
        // Mock du livre
        mockBook = {
            id: 1,
            title: 'Test Book',
            description: 'Test Description',
            cover: '/images/covers/test.jpg',
            status: 'published',
            createdat: new Date(),
            user_id: 1,
            booktype_id: 1,
            categories: [1, 2]
        };

        // Mock de la requête
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

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();
    });

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

    test('should get all books', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBook] });

        await getBooksController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([mockBook]);
    });

    test('should get book by id', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBook] });

        await getBookController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockBook);
    });

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