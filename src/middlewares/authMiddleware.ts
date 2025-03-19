import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.config";
import { UserProps } from "../services/user.service"; // Importation de UserProps

// Interface Authentifiée qui étend Request avec un utilisateur
interface AuthenticatedRequest extends Request {
    user?: UserProps; // L'utilisateur sera de type UserProps après vérification du token
}

// Middleware pour vérifier le token JWT
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
       

        // Vérifier d'abord le header Authorization
        const authHeader = req.headers['authorization'];
        
        let token = authHeader && authHeader.split(' ')[1];

        // Si pas de token dans le header, vérifier le cookie
        if (!token) {
            token = req.cookies.token;
        }

        if (!token) {
            res.status(401).json({ message: 'Token manquant' });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        
        req.user = { id: decoded.id } as UserProps;
        next();
    } catch (error) {
        console.error('=== Erreur d\'authentification ===');
        console.error('Erreur complète:', error);
        res.status(401).json({ message: 'Token invalide' });
    }
};
