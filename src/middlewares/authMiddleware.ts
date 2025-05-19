import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.config";
import { UserProps } from "../services/user.service"; // Importation de UserProps

// Middleware pour vérifier le token JWT
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Vérifier d'abord le header Authorization
        const authHeader = req.headers['authorization'];
        
        let token = authHeader && authHeader.split(' ')[1];

        // Si pas de token dans le header, vérifier le cookie
        if (!token) {
            token = req.cookies.token;
        }

        // Si toujours pas de token, vérifier le query parameter (pour les appels API directs)
        if (!token && req.query.token) {
            token = req.query.token as string;
        }

        if (!token) {
            res.status(401).json({ 
                message: 'Token manquant',
                error: 'AUTH_NO_TOKEN'
            });
            return;
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
            req.user = { id: decoded.id } as UserProps;
            next();
        } catch (jwtError) {
            console.error('Erreur de vérification du token:', jwtError);
            res.status(401).json({ 
                message: 'Token invalide ou expiré',
                error: 'AUTH_INVALID_TOKEN'
            });
        }
    } catch (error) {
        console.error('=== Erreur d\'authentification ===');
        console.error('Erreur complète:', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de l\'authentification',
            error: 'AUTH_SERVER_ERROR'
        });
    }
};
