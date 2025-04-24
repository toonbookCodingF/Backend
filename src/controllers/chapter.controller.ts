import { Request, Response } from 'express';
import { getAllChapters, getChapter, getChaptersByBook, createChapter, updateChapter, deleteChapter } from '../services/chapter.service';

// Récupère tous les chapitres de la base de données
// Utilisé principalement pour la modération et l'administration
export const getChaptersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const chapters = await getAllChapters();
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des chapitres' });
    }
};

// Récupère un chapitre spécifique par son ID
// Utilisé pour afficher le contenu d'un chapitre particulier
export const getChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const chapter = await getChapter(id);
        
        if (!chapter) {
            res.status(404).json({ message: 'Chapitre non trouvé' });
            return;
        }

        res.json(chapter);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du chapitre' });
    }
};

// Récupère tous les chapitres d'un livre spécifique
// Permet d'afficher la table des matières d'un livre
export const getChaptersByBookController = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId);
        const chapters = await getChaptersByBook(bookId);
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des chapitres' });
    }
};

// Crée un nouveau chapitre pour un livre
// Permet aux auteurs d'ajouter du contenu à leur livre
export const createChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { book_id, title, status, order } = req.body;

        // Validation des champs requis
        if (!book_id || !title || !status || order === undefined) {
            res.status(400).json({ 
                message: 'Missing required fields',
                required: ['book_id', 'title', 'status', 'order']
            });
            return;
        }

        // Validation des types
        if (typeof book_id !== 'number' || typeof order !== 'number') {
            res.status(400).json({ 
                message: 'Invalid field types',
                errors: {
                    book_id: 'Must be a number',
                    order: 'Must be a number'
                }
            });
            return;
        }

        if (typeof title !== 'string' || typeof status !== 'string') {
            res.status(400).json({ 
                message: 'Invalid field types',
                errors: {
                    title: 'Must be a string',
                    status: 'Must be a string'
                }
            });
            return;
        }

        const newChapter = await createChapter({
            book_id,
            title,
            status,
            order
        });

        res.status(201).json({ message: 'chapter created successfully', data: newChapter });
    } catch (error) {
        console.error('Error in createChapterController:', error);
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Met à jour un chapitre existant
// Permet aux auteurs de modifier le contenu de leurs chapitres
export const updateChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { title, status, order } = req.body;

        const updatedChapter = await updateChapter(id, {
            title,
            status,
            order
        });

        res.json({ message: 'chapter updated successfully', data: updatedChapter });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
};

// Supprime un chapitre
// Permet aux auteurs de retirer des chapitres de leur livre
export const deleteChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        await deleteChapter(id);
        res.json({ message: 'chapter deleted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
}; 