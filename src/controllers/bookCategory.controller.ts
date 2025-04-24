import { Request, Response } from "express";
import { 
    getAllBookCategories, 
    getBookCategory,
    getCategoriesByBook,
    getBooksByCategory,
    createBookCategory,
    updateBookCategory,
    deleteBookCategory
} from "../services/bookCategory.service";

const handleResponse = <T>(res: Response, status: number, message: string, data: T | null = null) => {
    res.status(status).json({ status, message, data });
};

export const createBookCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookId, categoryId } = req.body;
        
        if (!bookId || !categoryId) {
            handleResponse(res, 400, "bookId et categoryId sont requis");
            return;
        }

        const bookCategory = await createBookCategory(parseInt(bookId), parseInt(categoryId));
        handleResponse(res, 201, "Relation livre-catégorie créée avec succès", bookCategory);
    } catch (error) {
        console.error('Error in createBookCategoryController:', error);
        if (error instanceof Error) {
            handleResponse(res, 400, error.message);
        } else {
            handleResponse(res, 500, "Une erreur est survenue");
        }
    }
};

export const getAllBookCategoriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Getting all book categories...');
        const bookCategories = await getAllBookCategories();
        console.log('book categories retrieved:', bookCategories);
        handleResponse(res, 200, "Relations livre-catégorie récupérées avec succès", bookCategories);
    } catch (error) {
        console.error('Error in getAllBookCategoriesController:', error);
        handleResponse(res, 500, "Une erreur est survenue");
    }
};

export const getBookCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookId, categoryId } = req.params;
        console.log('Getting book category with bookId:', bookId, 'and categoryId:', categoryId);
        const bookCategory = await getBookCategory(parseInt(bookId), parseInt(categoryId));
        
        if (!bookCategory) {
            handleResponse(res, 404, "Relation livre-catégorie non trouvée");
            return;
        }
        
        handleResponse(res, 200, "Relation livre-catégorie récupérée avec succès", bookCategory);
    } catch (error) {
        console.error('Error in getBookCategoryController:', error);
        handleResponse(res, 500, "Une erreur est survenue");
    }
};

export const getCategoriesByBookController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookId } = req.params;
        console.log('Getting categories for book:', bookId);
        const categories = await getCategoriesByBook(parseInt(bookId));
        console.log('Categories retrieved:', categories);
        
        if (!categories || categories.length === 0) {
            handleResponse(res, 404, "Aucune catégorie trouvée pour ce livre");
            return;
        }
        
        handleResponse(res, 200, "Catégories du livre récupérées avec succès", categories);
    } catch (error) {
        console.error('Error in getCategoriesByBookController:', error);
        handleResponse(res, 500, "Une erreur est survenue");
    }
};

export const getBooksByCategoryIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        console.log('Getting books for category:', categoryId);
        const books = await getBooksByCategory(parseInt(categoryId));
        console.log('Books retrieved:', books);
        
        if (!books || books.length === 0) {
            handleResponse(res, 404, "Aucun livre trouvé pour cette catégorie");
            return;
        }
        
        handleResponse(res, 200, "Livres de la catégorie récupérés avec succès", books);
    } catch (error) {
        console.error('Error in getBooksByCategoryIdController:', error);
        handleResponse(res, 500, "Une erreur est survenue");
    }
};

export const updateBookCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { oldBookId, oldCategoryId } = req.params;
        const { newBookId, newCategoryId } = req.body;

        if (!newBookId || !newCategoryId) {
            handleResponse(res, 400, "newBookId et newCategoryId sont requis");
            return;
        }

        const bookCategory = await updateBookCategory(
            parseInt(oldBookId),
            parseInt(oldCategoryId),
            parseInt(newBookId),
            parseInt(newCategoryId)
        );

        handleResponse(res, 200, "Relation livre-catégorie mise à jour avec succès", bookCategory);
    } catch (error) {
        console.error('Error in updateBookCategoryController:', error);
        if (error instanceof Error) {
            handleResponse(res, 400, error.message);
        } else {
            handleResponse(res, 500, "Une erreur est survenue");
        }
    }
};

export const deleteBookCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookId, categoryId } = req.params;
        console.log('Deleting book category with bookId:', bookId, 'and categoryId:', categoryId);
        
        const deletedBookCategory = await deleteBookCategory(parseInt(bookId), parseInt(categoryId));
        console.log('book category deleted:', deletedBookCategory);
        
        handleResponse(res, 200, "Relation livre-catégorie supprimée avec succès", deletedBookCategory);
    } catch (error) {
        console.error('Error in deleteBookCategoryController:', error);
        if (error instanceof Error) {
            handleResponse(res, 400, error.message);
        } else {
            handleResponse(res, 500, "Une erreur est survenue");
        }
    }
}; 