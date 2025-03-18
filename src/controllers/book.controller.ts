import { Request, Response } from 'express';
import { getAllBooks, getBook, createBook, deleteBook, updateBook } from '../services/book.service';

export const getBooksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await getAllBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getBookController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const book = await getBook(id);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const createBookController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, cover, user_id, status, category_id, bookType_id } = req.body;

    // Validation des champs requis
    if (!title || !description || !cover || !user_id || !status || !category_id || !bookType_id) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const newBook = await createBook({
      title,
      description,
      cover,
      user_id,
      status,
      category_id,
      bookType_id
    });

    res.status(201).json({ message: 'Book created successfully', data: newBook });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
};

export const deleteBookController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await deleteBook(id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
};

export const updateBookController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { title, description, cover, status, category_id, bookType_id } = req.body;

        const updatedBook = await updateBook(id, {
            title,
            description,
            cover,
            status,
            category_id,
            bookType_id
        });

        res.json({ message: 'Livre mis à jour avec succès', data: updatedBook });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Erreur inconnue' });
        }
    }
}; 