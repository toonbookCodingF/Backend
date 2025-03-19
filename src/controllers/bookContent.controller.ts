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
            res.status(404).json({ message: 'Content not found' });
            return;
        }

        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
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
        const { chapter_id, content, order, type } = req.body;
        const imageFile = req.file;

        if (!chapter_id || !order) {
            res.status(400).json({ message: 'Chapter ID and order are required' });
            return;
        }

        if (!type) {
            res.status(400).json({ message: 'Type is required' });
            return;
        }

        if (type !== 'text' && type !== 'image') {
            res.status(400).json({ message: 'Type must be either "text" or "image"' });
            return;
        }

        // Si c'est une image, le content n'est pas requis car il sera remplacé par le chemin de l'image
        if (type === 'image' && !imageFile) {
            res.status(400).json({ message: 'Image file is required when type is "image"' });
            return;
        }

        // Si c'est du texte, le content est requis
        if (type === 'text' && !content) {
            res.status(400).json({ message: 'Content is required when type is "text"' });
            return;
        }

        const newContent = await createBookContent({
            chapter_id,
            content: content || '', // Si c'est une image, le content sera remplacé par le chemin
            order,
            type
        }, imageFile);

        res.status(201).json({ message: 'Content created successfully', data: newContent });
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
        const { content, order, type } = req.body;
        const imageFile = req.file;

        const updatedContent = await updateBookContent(id, {
            content,
            order,
            type,
            imageFile
        });

        res.json({ message: 'Content updated successfully', data: updatedContent });
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
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
}; 