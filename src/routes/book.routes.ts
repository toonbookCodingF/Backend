import { Router } from 'express';
import { getBooksController, getBookController, createBookController, deleteBookController, updateBookController } from '../controllers/book.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { checkBookOwnership } from '../middlewares/bookOwnershipMiddleware';

const router = Router();

// Routes publiques
router.get('/getAll', getBooksController);
router.get('/:id', getBookController);

// Routes protégées
router.post('/create', authenticateToken, createBookController);
router.put('/:id', authenticateToken, checkBookOwnership, updateBookController);
router.delete('/:id', authenticateToken, checkBookOwnership, deleteBookController);

export default router; 