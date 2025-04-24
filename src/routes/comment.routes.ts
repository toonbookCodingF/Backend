import { Router } from 'express';
import {
    getCommentsController,
    getCommentController,
    getCommentsByBookContentController,
    getCommentsByChapterController,
    createCommentController,
    updateCommentController,
    deleteCommentController,
    toggleCommentVisibilityController,
    incrementLikeController,
    decrementLikeController
} from '../controllers/comment.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Routes publiques
router.get('/', getCommentsController);
router.get('/:id', getCommentController);
router.get('/book-content/:bookContentId', getCommentsByBookContentController);
router.get('/chapter/:chapterId', getCommentsByChapterController);

// Routes protégées
router.post('/', authenticateToken, createCommentController);
router.put('/:id', authenticateToken, updateCommentController);
router.delete('/:id', authenticateToken, deleteCommentController);
router.put('/:id/visibility', authenticateToken, toggleCommentVisibilityController);
router.post('/:id/like', authenticateToken, incrementLikeController);
router.delete('/:id/like', authenticateToken, decrementLikeController);

export default router; 