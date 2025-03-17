import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth";
import { UserProps } from "../services/user.service"; // Importation de UserProps

// Interface Authentifiée qui étend Request avec un utilisateur
interface AuthenticatedRequest extends Request {
    user?: UserProps; // L'utilisateur sera de type UserProps après vérification du token
}

// Middleware pour vérifier le token JWT
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Recherche du token dans les cookies ou dans l'en-tête Authorization
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        // Si aucun token n'est trouvé, renvoyer une erreur 401 et ne pas retourner de valeur
        res.status(401).json({ message: "Non autorisé : aucun token fourni" });
        return; // Don't return the response, just terminate the middleware
    }

    try {
        // Décoder le token et récupérer l'utilisateur. Utilisation de `UserProps` comme type pour l'utilisateur décodé.
        const decoded = jwt.verify(token, JWT_SECRET) as { exp: number } & UserProps;

        if (decoded.exp * 1000 < Date.now()) {
            res.status(403).json({ message: "Token invalide ou expiré" });

            return;
        }
        req.user = decoded;

        // Passer à la suite de la route ou du middleware
        next();
    } catch (err) {
        // Si le token est invalide ou expiré, renvoyer une erreur 403
        res.status(403).json({ message: "Token invalide ou expiré" });
    }
};
