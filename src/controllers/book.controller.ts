import { Request, Response } from 'express';
import { getAllBooks, getBook, createBook, deleteBook, updateBook, searchBooks } from '../services/book.service';

// Récupère tous les livres pour afficher la liste complète des œuvres disponibles
// Permet aux utilisateurs de découvrir de nouveaux contenus
export const getBooksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await getAllBooks();
    res.status(200).json(books);
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
    res.status(200).json(book);
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
    res.status(200).json({ message: 'book deleted successfully' });
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

    res.status(200).json({ message: 'book updated successfully', data: updatedBook });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
};

// On crée un contrôleur de recherche de livres car c'est nécessaire pour l'API
// Ce contrôleur gère les requêtes de recherche et renvoie les résultats triés
export const searchBooksController = async (req: Request, res: Response): Promise<void> => {
    try {
        // On récupère le terme de recherche depuis le body car c'est plus approprié pour une recherche complexe
        // Cela permet d'ajouter facilement d'autres paramètres de recherche si nécessaire
        const { searchTerm, limit = 10, page = 1 } = req.body;

        // On vérifie la présence du terme de recherche car il est obligatoire
        // Cette validation assure que la recherche a un sens
        if (!searchTerm) {
            res.status(400).json({ message: 'Le terme de recherche est requis' });
            return;
        }

        // On effectue la recherche car c'est nécessaire pour trouver les livres
        // Les résultats sont déjà triés par pertinence dans le service
        const books = await searchBooks(searchTerm, limit, page);

        // On renvoie les résultats car ils sont nécessaires pour le frontend
        // Le code 200 indique que la recherche a réussi
        res.status(200).json({
            message: 'Recherche effectuée avec succès',
            data: books,
            pagination: {
                page,
                limit,
                total: books.length
            }
        });
    } catch (error) {
        // On gère les erreurs car elles peuvent survenir lors de la recherche
        // Cette gestion permet de fournir des messages d'erreur clairs au frontend
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Erreur lors de la recherche de livres' });
        }
    }
}; 