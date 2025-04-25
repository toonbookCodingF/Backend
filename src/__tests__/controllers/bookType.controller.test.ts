import { Request, Response, NextFunction } from 'express';
import { getAllBookTypesController, getBookTypeController } from '../../controllers';

// Mock de la base de données
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

describe('BookType Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockBookType: any;

    beforeEach(() => {
        // Mock du type de livre
        mockBookType = {
            id: 1,
            name: 'Test Book Type',
            description: 'Test Description'
        };

        // Mock de la requête
        mockRequest = {
            params: { id: '1' }
        };

        // Mock de la réponse
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();
    });

    test('should get all book types', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookType] });

        await getAllBookTypesController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Types de livres récupérés avec succès',
            data: [mockBookType]
        });
    });

    test('should get book type by id', async () => {
        const { default: client } = require('../../config/database');
        client.query.mockResolvedValueOnce({ rows: [mockBookType] });

        await getBookTypeController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 200,
            message: 'Type de livre récupéré avec succès',
            data: mockBookType
        });
    });
}); 