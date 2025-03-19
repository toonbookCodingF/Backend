import { Request, Response } from 'express';
import { getAllChapters, getChapter, getChaptersByBook, createChapter, updateChapter, deleteChapter } from '../services/chapter.service';

export const getChaptersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const chapters = await getAllChapters();
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const chapter = await getChapter(id);
        if (!chapter) {
            res.status(404).json({ message: 'Chapter not found' });
            return;
        }
        res.json(chapter);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getChaptersByBookController = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId);
        const chapters = await getChaptersByBook(bookId);
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

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

        res.status(201).json({ message: 'Chapter created successfully', data: newChapter });
    } catch (error) {
        console.error('Error in createChapterController:', error);
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

export const updateChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { title, status, order } = req.body;

        const updatedChapter = await updateChapter(id, {
            title,
            status,
            order
        });

        res.json({ message: 'Chapter updated successfully', data: updatedChapter });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
};

export const deleteChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        await deleteChapter(id);
        res.json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
}; 