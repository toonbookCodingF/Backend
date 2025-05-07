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
        // On extrait les données de la requête car elles sont nécessaires pour créer un nouveau contenu
        // Ces données proviennent du frontend et doivent être validées avant d'être utilisées
        const { chapter_id, content, order, type } = req.body;
        const imageFile = req.file;

        // On vérifie la présence des champs obligatoires car ils sont essentiels pour la cohérence des données
        // Sans ces informations, on ne peut pas créer un contenu valide dans la base de données
        if (!chapter_id || !order) {
            res.status(400).json({ message: 'chapter ID and order are required' });
            return;
        }

        // On vérifie le type car il détermine le comportement de création du contenu
        // Le type est crucial pour savoir comment traiter le contenu (texte ou image)
        if (!type) {
            res.status(400).json({ message: 'Type is required' });
            return;
        }

        // On valide le type car seuls 'text' et 'image' sont supportés
        // Cette validation assure que le système ne traite que des types de contenu connus
        if (type !== 'text' && type !== 'image') {
            res.status(400).json({ message: 'Type must be either "text" or "image"' });
            return;
        }

        // On vérifie la présence du fichier image car c'est nécessaire pour le type 'image'
        // Sans fichier image, on ne peut pas créer un contenu de type image valide
        if (type === 'image' && !imageFile) {
            res.status(400).json({ message: 'Image file is required when type is "image"' });
            return;
        }

        // On vérifie la présence du contenu texte car c'est nécessaire pour le type 'text'
        // Sans contenu texte, on ne peut pas créer un contenu de type texte valide
        if (type === 'text' && !content) {
            res.status(400).json({ message: 'Content is required when type is "text"' });
            return;
        }

        // On crée le nouveau contenu car toutes les validations ont été passées
        // Le content est initialisé comme une chaîne vide pour le type 'image' car il sera remplacé par le chemin
        const newContent = await createBookContent({
            chapter_id,
            content: content || '', // Si c'est une image, le content sera remplacé par le chemin
            order,
            type
        }, imageFile);

        // On renvoie une réponse 201 car la création a réussi
        // Le code 201 indique explicitement qu'une nouvelle ressource a été créée
        res.status(201).json({ message: 'Content created successfully', data: newContent });
    } catch (error) {
        // On gère les erreurs car elles peuvent survenir lors de la création
        // Cette gestion d'erreur permet de fournir des messages clairs au frontend
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