import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth";
import { UserProps } from "../services/user.service"; // Importation de UserProps

// Interface Authentifiée qui étend Request avec un utilisateur
interface AuthenticatedRequest extends Request {
    user?: UserProps; // L'utilisateur sera de type UserProps après vérification du token
}

// Middleware pour vérifier le token JWT
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ message: 'Token manquant' });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        req.user = { id: decoded.id } as UserProps;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
    }
};
