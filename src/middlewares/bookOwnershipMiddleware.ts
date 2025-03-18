import { Request, Response, NextFunction } from 'express';
import client from '../config/database';
import { UserProps } from '../services/user.service';

interface AuthenticatedRequest extends Request {
    user?: UserProps;
}

export const checkBookOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const bookId = parseInt(req.params.id);
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Utilisateur non authentifié' });
            return;
        }

        // Vérifier si l'utilisateur est le propriétaire du livre
        const bookQuery = `SELECT user_id FROM "Book" WHERE id = $1;`;
        const bookResult = await client.query(bookQuery, [bookId]);

        if (bookResult.rows.length === 0) {
            res.status(404).json({ message: 'Livre non trouvé' });
            return;
        }

        if (bookResult.rows[0].user_id !== userId) {
            res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce livre' });
            return;
        }

        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de la propriété du livre:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const checkChapterOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const chapterId = parseInt(req.params.id);
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Utilisateur non authentifié' });
            return;
        }

        // Vérifier si le chapitre existe et obtenir le book_id associé
        const chapterQuery = `SELECT book_id FROM "Chapter" WHERE id = $1;`;
        const chapterResult = await client.query(chapterQuery, [chapterId]);

        if (chapterResult.rows.length === 0) {
            res.status(404).json({ message: 'Chapitre non trouvé' });
            return;
        }

        const bookId = chapterResult.rows[0].book_id;

        // Vérifier si l'utilisateur est le propriétaire du livre
        const bookQuery = `SELECT user_id FROM "Book" WHERE id = $1;`;
        const bookResult = await client.query(bookQuery, [bookId]);

        if (bookResult.rows.length === 0) {
            res.status(404).json({ message: 'Livre non trouvé' });
            return;
        }

        if (bookResult.rows[0].user_id !== userId) {
            res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce chapitre' });
            return;
        }

        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de la propriété du chapitre:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const checkContentOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const contentId = parseInt(req.params.id);
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Utilisateur non authentifié' });
            return;
        }

        // Vérifier si le contenu existe et obtenir le book_id associé
        const contentQuery = `
            SELECT b.user_id 
            FROM "BookContent" bc
            JOIN "Chapter" c ON bc.chapter_id = c.id
            JOIN "Book" b ON c.book_id = b.id
            WHERE bc.id = $1;
        `;
        const contentResult = await client.query(contentQuery, [contentId]);

        if (contentResult.rows.length === 0) {
            res.status(404).json({ message: 'Contenu non trouvé' });
            return;
        }

        if (contentResult.rows[0].user_id !== userId) {
            res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce contenu' });
            return;
        }

        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de la propriété du contenu:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}; 