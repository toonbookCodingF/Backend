import { Router } from 'express';
import { getChaptersController, getChapterController, getChaptersByBookController, createChapterController, updateChapterController, deleteChapterController } from '../controllers/chapter.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { checkChapterOwnership } from '../middlewares/bookOwnershipMiddleware';

const router = Router();

// Routes publiques
router.get('/getAll', getChaptersController);
router.get('/:id', getChapterController);
router.get('/book/:bookId', getChaptersByBookController);

// Routes protégées
router.post('/create', authenticateToken, createChapterController);
router.put('/:id', authenticateToken, checkChapterOwnership, updateChapterController);
router.delete('/:id', authenticateToken, checkChapterOwnership, deleteChapterController);

export default router; 