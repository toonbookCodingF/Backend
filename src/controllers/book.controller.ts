import { Request, Response } from 'express';
import { getAllBooks, getBook, createBook, deleteBook, updateBook } from '../services/book.service';

// Récupère tous les livres pour afficher la liste complète des œuvres disponibles
// Permet aux utilisateurs de découvrir de nouveaux contenus
export const getBooksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await getAllBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Récupère un livre spécifique pour afficher ses détails complets
// Utilisé pour la page de détail d'un livre
export const getBookController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const book = await getBook(id);
    if (!book) {
      res.status(404).json({ message: 'book not found' });
      return;
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Crée un nouveau livre avec gestion de la couverture
// Permet aux auteurs de publier leurs œuvres
export const createBookController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, user_id, status, categories, booktype_id } = req.body;
    const coverFile = req.file;

    // Valide les champs requis pour garantir la qualité des données
    if (!title || !description || !user_id || !status || !booktype_id) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const newBook = await createBook({
      title,
      description,
      cover: '',
      user_id,
      status,
      categories,
      booktype_id
    }, coverFile);

    res.status(201).json({ message: 'book created successfully', data: newBook });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
};

// Supprime un livre et toutes ses données associées
// Permet aux auteurs de retirer leurs œuvres
export const deleteBookController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await deleteBook(id);
    res.json({ message: 'book deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
};

// Met à jour les informations d'un livre existant
// Permet aux auteurs de modifier leurs œuvres après publication
export const updateBookController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, status, categories, booktype_id } = req.body;
    const coverFile = req.file;

    const updatedBook = await updateBook(id, {
      title,
      description,
      status,
      categories,
      booktype_id
    }, coverFile);

    res.json({ message: 'book updated successfully', data: updatedBook });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
}; 