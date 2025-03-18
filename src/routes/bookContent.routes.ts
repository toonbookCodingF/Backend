import { Router } from 'express';
import { getBookContentsController, getBookContentController, getBookContentsByChapterController, createBookContentController, updateBookContentController, deleteBookContentController } from '../controllers/bookContent.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { checkContentOwnership } from '../middlewares/bookOwnershipMiddleware';

const router = Router();

// Routes publiques
router.get('/getAll', getBookContentsController);
router.get('/:id', getBookContentController);
router.get('/chapter/:chapterId', getBookContentsByChapterController);

// Routes protégées
router.post('/create', authenticateToken, createBookContentController);
router.put('/:id', authenticateToken, checkContentOwnership, updateBookContentController);
router.delete('/:id', authenticateToken, checkContentOwnership, deleteBookContentController);

export default router; 