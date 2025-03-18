import { Request, Response } from 'express';
import { getAllBookContents, getBookContent, getBookContentsByChapter, createBookContent, updateBookContent, deleteBookContent } from '../services/bookContent.service';

export const getBookContentsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const contents = await getAllBookContents();
        res.json(contents);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getBookContentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const content = await getBookContent(id);
        if (!content) {
            res.status(404).json({ message: 'Book content not found' });
            return;
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getBookContentsByChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const chapterId = parseInt(req.params.chapterId);
        const contents = await getBookContentsByChapter(chapterId);
        res.json(contents);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const createBookContentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chapter_id, content, type } = req.body;

        if (!chapter_id || !content) {
            res.status(400).json({ message: 'Chapter ID and content are required' });
            return;
        }

        const newContent = await createBookContent({
            chapter_id,
            content,
            type
        });

        res.status(201).json({ message: 'Book content created successfully', data: newContent });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
};

export const updateBookContentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { chapter_id, content, type } = req.body;

        const updatedContent = await updateBookContent(id, {
            chapter_id,
            content,
            type
        });

        res.json({ message: 'Book content updated successfully', data: updatedContent });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
};

export const deleteBookContentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        await deleteBookContent(id);
        res.json({ message: 'Book content deleted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
}; 