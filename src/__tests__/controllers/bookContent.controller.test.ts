import { Request, Response } from 'express';
import { getBookContentsController, getBookContentController, getBookContentsByChapterController, createBookContentController, updateBookContentController, deleteBookContentController } from '../../controllers';
import { BookContentProps } from '../../services/bookContent.service';

// Mock de la base de données
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('BookContent Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockBookContent: BookContentProps;

    beforeEach(() => {
        // Mock du contenu de livre
        mockBookContent = {
            id: 1,
            chapter_id: 1,
            content: 'Test Content',
            order: 1,
            type: 'text'
        };

        // Mock de la requête
        mockRequest = {
            params: { id: '1', chapterId: '1' },
            body: {
                chapter_id: 1,
                content: 'Test Content',
                order: 1,
                type: 'text'
            }
        };

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    test('should get all book contents', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookContent] });

        await getBookContentsController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith([mockBookContent]);
    });

    test('should get book content by id', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookContent] });

        await getBookContentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(mockBookContent);
    });

    test('should get book contents by chapter', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookContent] });

        await getBookContentsByChapterController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith([mockBookContent]);
    });

    test('should create book content successfully', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "chapter"')) {
                return Promise.resolve({ rows: [{ id: 1 }] });
            }
            if (query.includes('INSERT INTO "bookcontent"')) {
                return Promise.resolve({ rows: [mockBookContent] });
            }
            return Promise.resolve({ rows: [] });
        });

        await createBookContentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Content created successfully',
            data: mockBookContent
        });
    });

    test('should update book content', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "bookcontent"')) {
                return Promise.resolve({ rows: [mockBookContent] });
            }
            if (query.includes('UPDATE "bookcontent"')) {
                return Promise.resolve({ rows: [mockBookContent] });
            }
            return Promise.resolve({ rows: [] });
        });

        await updateBookContentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Content updated successfully',
            data: mockBookContent
        });
    });

    test('should delete book content', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "bookcontent"')) {
                return Promise.resolve({ rows: [mockBookContent] });
            }
            if (query.includes('DELETE FROM "bookcontent"')) {
                return Promise.resolve({ rows: [mockBookContent] });
            }
            return Promise.resolve({ rows: [] });
        });

        await deleteBookContentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Content deleted successfully'
        });
    });
}); 