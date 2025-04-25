import { Request, Response, NextFunction } from 'express';
import { createChapterController, getChaptersController, getChapterController, updateChapterController, deleteChapterController } from '../../controllers';
import { ChapterProps } from '../../services/chapter.service';

// Mock de la base de données
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('Chapter Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockChapter: ChapterProps;

    beforeEach(() => {
        // Mock du chapitre
        mockChapter = {
            id: 1,
            book_id: 1,
            title: 'Test Chapter',
            status: 'published',
            order: 1,
            createdat: new Date()
        };

        // Mock de la requête
        mockRequest = {
            params: { id: '1' },
            body: {
                book_id: 1,
                title: 'Test Chapter',
                status: 'published',
                order: 1
            }
        };

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();
    });

    test('should create chapter successfully', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "book"')) {
                return Promise.resolve({ rows: [{ id: 1 }] });
            }
            if (query.includes('SELECT * FROM "chapter"')) {
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('INSERT INTO "chapter"')) {
                return Promise.resolve({ rows: [mockChapter] });
            }
            return Promise.resolve({ rows: [] });
        });

        await createChapterController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'chapter created successfully',
            data: mockChapter
        });
    });

    test('should get all chapters', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockChapter] });

        await getChaptersController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([mockChapter]);
    });

    test('should get chapter by id', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockChapter] });

        await getChapterController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockChapter);
    });

    test('should update chapter', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockChapter] });

        mockRequest.body.title = 'Updated Chapter';

        await updateChapterController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'chapter updated successfully',
            data: mockChapter
        });
    });

    test('should delete chapter', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "bookcontent"')) {
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('DELETE FROM "chapter"')) {
                return Promise.resolve({ rows: [mockChapter] });
            }
            return Promise.resolve({ rows: [] });
        });

        await deleteChapterController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'chapter deleted successfully'
        });
    });
}); 