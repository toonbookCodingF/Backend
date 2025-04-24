import { Request, Response } from 'express';
import {
    getAllComments,
    getComment,
    getCommentsByBookContent,
    getCommentsByChapter,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentVisibility,
    incrementLike,
    decrementLike
} from '../services/comment.service';

// Récupère tous les commentaires pour la modération
// Permet aux administrateurs de gérer les commentaires inappropriés
export const getCommentsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const comments = await getAllComments();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
    }
};

// Récupère un commentaire spécifique pour afficher ses détails
// Utilisé pour la modération et l'affichage des réponses
export const getCommentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const comment = await getComment(id);
        
        if (!comment) {
            res.status(404).json({ message: 'Commentaire non trouvé' });
            return;
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du commentaire' });
    }
};

// Récupère les commentaires d'un contenu spécifique
// Permet aux lecteurs de voir les discussions sur une partie précise du livre
export const getCommentsByBookContentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookContentId = parseInt(req.params.bookContentId);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const { comments, total } = await getCommentsByBookContent(bookContentId, page, limit);
        
        res.json({
            data: comments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
    }
};

// Récupère les commentaires d'un chapitre
// Permet aux lecteurs de discuter du chapitre dans son ensemble
export const getCommentsByChapterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const chapterId = parseInt(req.params.chapterId);
        const comments = await getCommentsByChapter(chapterId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
    }
};

// Crée un nouveau commentaire
// Permet aux utilisateurs de participer aux discussions
export const createCommentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = await createComment(req.body);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du commentaire' });
    }
};

// Met à jour un commentaire existant
// Permet aux utilisateurs de corriger ou modifier leurs commentaires
export const updateCommentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const comment = await updateComment(id, req.body);
        
        if (!comment) {
            res.status(404).json({ message: 'Commentaire non trouvé' });
            return;
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du commentaire' });
    }
};

// Supprime un commentaire
// Permet aux utilisateurs de retirer leurs commentaires
export const deleteCommentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const success = await deleteComment(id);
        
        if (!success) {
            res.status(404).json({ message: 'Commentaire non trouvé' });
            return;
        }

        res.json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du commentaire' });
    }
};

// Modifie la visibilité d'un commentaire
// Permet aux modérateurs de masquer les commentaires inappropriés
export const toggleCommentVisibilityController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { visible } = req.body;
        
        const comment = await toggleCommentVisibility(id, visible);
        
        if (!comment) {
            res.status(404).json({ message: 'Commentaire non trouvé' });
            return;
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la modification de la visibilité du commentaire' });
    }
};

// Ajoute un like à un commentaire
// Permet aux utilisateurs d'exprimer leur appréciation
export const incrementLikeController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const comment = await incrementLike(id);
        
        if (!comment) {
            res.status(404).json({ message: 'Commentaire non trouvé' });
            return;
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'incrémentation du like' });
    }
};

// Retire un like d'un commentaire
// Permet aux utilisateurs de retirer leur appréciation
export const decrementLikeController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const comment = await decrementLike(id);
        
        if (!comment) {
            res.status(404).json({ message: 'Commentaire non trouvé' });
            return;
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la décrémentation du like' });
    }
}; 