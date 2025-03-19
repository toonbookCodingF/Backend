import { Router } from 'express';
import { getBooksController, getBookController, createBookController, updateBookController, deleteBookController } from '../controllers/book.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { checkBookOwnership } from '../middlewares/bookOwnershipMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Routes publiques
router.get('/', getBooksController);
router.get('/:id', getBookController);

// Routes protégées
router.post('/', authenticateToken, upload.single('cover'), createBookController);
router.put('/:id', authenticateToken,checkBookOwnership, upload.single('cover'), updateBookController);
router.delete('/:id', authenticateToken,checkBookOwnership, deleteBookController);

export default router; 