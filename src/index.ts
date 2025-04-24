import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bookRoutes from './routes/book.routes';
import chapterRoutes from './routes/chapter.routes';
import bookContentRoutes from './routes/bookContent.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import bookCategoryRoutes from './routes/bookCategory.routes';
import bookTypeRoutes from './routes/bookType.routes';
import commentRoutes from './routes/comment.routes';
import path from 'path';
import { authenticateToken } from './middlewares/authMiddleware';

// Configuration de l'environnement
// Charge les variables d'environnement depuis le fichier .env
// Permet une configuration sécurisée des paramètres sensibles
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS
// Permet les requêtes cross-origin depuis le frontend
// Configure les en-têtes autorisés et les méthodes HTTP acceptées
app.use(cors({
    origin: true, // Autorise toutes les origines
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600 // Durée de mise en cache des pré-vérifications CORS
}));

// Middleware de logging
// Enregistre les détails de chaque requête pour le débogage
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Middleware pour parser le JSON et les cookies
app.use(express.json());
app.use(cookieParser());

// Configuration des fichiers statiques
// Permet de servir les images et autres fichiers statiques
app.use('/public', express.static(path.join(__dirname, '../public')));

// Routes publiques
// Accessibles sans authentification
app.use('/api/books', bookRoutes); // Gestion des livres
app.use('/api/categories', categoryRoutes); // Gestion des catégories
app.use('/api/booktypes', bookTypeRoutes); // Gestion des types de livres

// Routes protégées
// Nécessitent une authentification valide
app.use('/api/comments', authenticateToken, commentRoutes); // Gestion des commentaires
app.use('/api/chapters', authenticateToken, chapterRoutes); // Gestion des chapitres
app.use('/api/bookcontents', authenticateToken, bookContentRoutes); // Gestion du contenu des livres
app.use('/api/users', authenticateToken, userRoutes); // Gestion des utilisateurs

// Routes de relations
// Gestion des relations entre livres et catégories
app.use('/api/book-categories', bookCategoryRoutes);

// Démarrage du serveur
// Écoute sur le port configuré dans les variables d'environnement
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
