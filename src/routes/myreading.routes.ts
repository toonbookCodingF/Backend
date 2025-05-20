import { Router } from 'express';
import * as myReadingController from '../controllers/myreading.controller';

const router = Router();

// Routes CRUD de base
router.post('/', myReadingController.create);
router.get('/', myReadingController.findAll);
router.get('/:id', myReadingController.findById);
router.delete('/:id', myReadingController.remove);

// Routes spécifiques
router.get('/user/:userId', myReadingController.findByUserId);
router.get('/book/:bookId', myReadingController.findByBookId);
router.get('/user/:userId/verified', myReadingController.findVerifiedByUserId);
router.get('/user/:userId/unverified', myReadingController.findUnverifiedByUserId);
router.patch('/:id/toggle-verify', myReadingController.toggleVerification);

export default router; 