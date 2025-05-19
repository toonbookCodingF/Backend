import { Router } from 'express';
import { getBookContentsController, getBookContentController, getBookContentsByChapterController, createBookContentController, updateBookContentController, deleteBookContentController } from '../controllers/bookContent.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { checkContentOwnership } from '../middlewares/bookOwnershipMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Routes publiques
router.get('/', getBookContentsController);
router.get('/:id', getBookContentController);
router.get('/chapter/:chapterId', getBookContentsByChapterController);

// Routes protégées
router.post('/', authenticateToken, upload.single('image'), createBookContentController);
router.put('/:id', authenticateToken, checkContentOwnership, upload.single('image'), updateBookContentController);
router.delete('/:id', authenticateToken, checkContentOwnership, deleteBookContentController);

export default router; 