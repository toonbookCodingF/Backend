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

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
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
