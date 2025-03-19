import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bookRoutes from './routes/book.routes';
import chapterRoutes from './routes/chapter.routes';
import bookContentRoutes from './routes/bookContent.routes';
import userRoutes from './routes/user.routes';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuration des origines autorisées
const allowedOrigins = [
    'http://localhost:3000',           // Frontend web local
    'http://localhost:19006',          // Expo web
    'http://localhost:8081',           // Android emulator
    'http://localhost:19000',          // iOS simulator
    'http://localhost:19002',          // Expo dev server
    'http://localhost:19003',          // Expo dev server
    'http://localhost:19004',          // Expo dev server
    'http://localhost:19005',          // Expo dev server
    'http://localhost:19006',          // Expo dev server
    'exp://localhost:19000',           // Expo development
    'exp://localhost:8081',            // Android development
    'exp://localhost:19000',           // iOS development
    'exp://192.168.1.1:19000',        // Expo LAN
    'exp://192.168.1.1:8081',         // Android LAN
    'exp://192.168.1.1:19000',        // iOS LAN
    process.env.FRONTEND_URL || '',    // URL de production web
];

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Permettre les requêtes sans origine (comme les appels API directs)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La politique CORS pour ce site ne permet pas l\'accès depuis l\'origine spécifiée.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 minutes
}));

app.use(express.json());
app.use(cookieParser());

// Servir les fichiers statiques depuis le dossier public
app.use('/public', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/book-content', bookContentRoutes);
app.use('/api/users', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
