import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createApp } from '../../index';

describe('Configuration CORS', () => {
    let app: any;

    beforeEach(() => {
        app = createApp();
    });

    test('Devrait accepter les requêtes cross-origin', async () => {
        const response = await fetch('http://localhost:3000/api/books', {
            method: 'GET',
            headers: {
                'Origin': 'http://localhost:3001'
            }
        });

        expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:3001');
        expect(response.headers.get('access-control-allow-credentials')).toBe('true');
    });

    test('Devrait autoriser les méthodes HTTP spécifiées', async () => {
        const response = await fetch('http://localhost:3000/api/books', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3001',
                'Access-Control-Request-Method': 'POST'
            }
        });

        const allowedMethods = response.headers.get('access-control-allow-methods');
        expect(allowedMethods).toContain('POST');
        expect(allowedMethods).toContain('GET');
        expect(allowedMethods).toContain('PUT');
        expect(allowedMethods).toContain('DELETE');
    });

    test('Devrait autoriser les en-têtes spécifiés', async () => {
        const response = await fetch('http://localhost:3000/api/books', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3001',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });

        const allowedHeaders = response.headers.get('access-control-allow-headers');
        expect(allowedHeaders).toContain('Content-Type');
        expect(allowedHeaders).toContain('Authorization');
    });
}); 