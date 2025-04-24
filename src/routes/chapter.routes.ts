import { Router } from 'express';
import { getChaptersController, getChapterController, getChaptersByBookController, createChapterController, updateChapterController, deleteChapterController } from '../controllers/chapter.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { checkChapterOwnership } from '../middlewares/bookOwnershipMiddleware';

const router = Router();

// Routes publiques - Accessibles sans authentification
// Récupère tous les chapitres du système
router.get('/getAll', getChaptersController);

// Récupère un chapitre spécifique par son ID
router.get('/:id', getChapterController);

// Récupère tous les chapitres d'un livre spécifique
router.get('/book/:bookId', getChaptersByBookController);

// Routes protégées - Requièrent une authentification
// Crée un nouveau chapitre pour un livre
router.post('/create', authenticateToken, createChapterController);

// Met à jour un chapitre existant (nécessite d'être propriétaire du livre)
router.put('/:id', authenticateToken, checkChapterOwnership, updateChapterController);

// Supprime un chapitre (nécessite d'être propriétaire du livre)
router.delete('/:id', authenticateToken, checkChapterOwnership, deleteChapterController);

export default router; 