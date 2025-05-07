import { Client } from 'pg';
import client from '../../config/database';

// On teste la configuration de la base de données car c'est un point critique de l'application
// Une mauvaise configuration pourrait empêcher l'application de fonctionner
describe('Database Configuration', () => {
    // On vérifie que l'instance de la base de données est bien créée
    // C'est important car toutes les requêtes SQL dépendent de cette instance
    test('should create a database instance', () => {
        expect(client).toBeInstanceOf(Client);
    });

    // On vérifie que la connexion à la base de données fonctionne
    // C'est crucial pour s'assurer que l'application peut communiquer avec la base de données
    test('should connect to the database', async () => {
        const result = await client.query('SELECT NOW()');
        expect(result.rows).toBeDefined();
    });

    // On vérifie que la base de données est accessible en lecture
    // C'est important car la plupart des fonctionnalités nécessitent de lire des données
    test('should be able to query the database', async () => {
        const result = await client.query('SELECT 1 as test');
        expect(result.rows[0].test).toBe(1);
    });

    // On vérifie que la base de données est accessible en écriture
    // C'est important pour les opérations de création, mise à jour et suppression
    test('should be able to write to the database', async () => {
        const result = await client.query('CREATE TEMP TABLE test (id SERIAL PRIMARY KEY)');
        expect(result.command).toBe('CREATE');
    });
}); 