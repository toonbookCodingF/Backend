import { Request, Response, NextFunction } from 'express';
import { createCommentController, getCommentsController, getCommentController, updateCommentController, deleteCommentController } from '../../controllers';

// Mock de la base de données
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('Comment Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockComment: any;

    beforeEach(() => {
        // Mock du commentaire
        mockComment = {
            id: 1,
            content: 'Test Comment',
            user_id: 1,
            book_id: 1,
            createdat: new Date()
        };

        // Mock de la requête
        mockRequest = {
            params: { id: '1' },
            body: {
                content: 'Test Comment',
                user_id: 1,
                book_id: 1
            }
        };

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();
    });

    test('should create comment successfully', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "book"')) {
                return Promise.resolve({ rows: [{ id: 1 }] });
            }
            if (query.includes('SELECT * FROM "user"')) {
                return Promise.resolve({ rows: [{ id: 1 }] });
            }
            if (query.includes('INSERT INTO "comment"')) {
                return Promise.resolve({ rows: [mockComment] });
            }
            return Promise.resolve({ rows: [] });
        });

        await createCommentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(mockComment);
    });

    test('should get all comments', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockComment] });

        await getCommentsController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith([mockComment]);
    });

    test('should get comment by id', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockComment] });

        await getCommentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(mockComment);
    });

    test('should update comment', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('SELECT * FROM "comment"')) {
                return Promise.resolve({ rows: [mockComment] });
            }
            if (query.includes('UPDATE "comment"')) {
                return Promise.resolve({ rows: [mockComment] });
            }
            return Promise.resolve({ rows: [] });
        });

        mockRequest.body.content = 'Updated Comment';

        await updateCommentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(mockComment);
    });

    test('should delete comment', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('DELETE FROM "comment"')) {
                return Promise.resolve({ rowCount: 1 });
            }
            return Promise.resolve({ rows: [] });
        });

        await deleteCommentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Commentaire supprimé avec succès' });
    });

    test('should return 404 when comment not found', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockImplementation((query: string, params?: any[]) => {
            if (query.includes('DELETE FROM "comment"')) {
                return Promise.resolve({ rowCount: 0 });
            }
            return Promise.resolve({ rows: [] });
        });

        await deleteCommentController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Commentaire non trouvé' });
    });
}); 