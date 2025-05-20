import { Request, Response } from 'express';
import * as myReadingService from '../services/myreading.service';
import { CreateMyReadingDTO, UpdateMyReadingDTO } from '../types/myreading.types';

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const dto: CreateMyReadingDTO = req.body;
        const myReading = await myReadingService.createMyReading(dto);
        res.status(201).json(myReading);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du myreading', error });
    }
};

export const findAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const myReadings = await myReadingService.getAllMyReadings();
        res.json(myReadings);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des myreadings', error });
    }
};

export const findById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const myReading = await myReadingService.getMyReadingById(id);
        if (!myReading) {
            res.status(404).json({ message: 'MyReading non trouvé' });
            return;
        }
        res.json(myReading);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du myreading', error });
    }
};

export const findByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        const myReadings = await myReadingService.getMyReadingsByUserId(userId);
        res.json(myReadings);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des myreadings', error });
    }
};

export const findByBookId = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookId = parseInt(req.params.bookId);
        const myReadings = await myReadingService.getMyReadingsByBookId(bookId);
        res.json(myReadings);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des myreadings', error });
    }
};

export const findVerifiedByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        const myReadings = await myReadingService.getVerifiedMyReadingsByUserId(userId);
        res.json(myReadings);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des myreadings vérifiés', error });
    }
};

export const findUnverifiedByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        const myReadings = await myReadingService.getUnverifiedMyReadingsByUserId(userId);
        res.json(myReadings);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des myreadings non vérifiés', error });
    }
};

export const toggleVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const myReading = await myReadingService.toggleMyReadingVerification(id);
        if (!myReading) {
            res.status(404).json({ message: 'MyReading non trouvé' });
            return;
        }
        res.json(myReading);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du myreading', error });
    }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const myReading = await myReadingService.deleteMyReading(id);
        if (!myReading) {
            res.status(404).json({ message: 'MyReading non trouvé' });
            return;
        }
        res.json({ message: 'MyReading supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du myreading', error });
    }
}; 