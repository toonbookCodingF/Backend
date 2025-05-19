import { Request, Response } from "express";
import { getAllCategories, getCategory, getBooksByCategory } from "../services/category.service";

const handleResponse = <T>(res: Response, status: number, message: string, data: T | null = null) => {
    res.status(status).json({ status, message, data });
};

export const getAllCategoriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Getting all categories...');
        const categories = await getAllCategories();
        console.log('Categories retrieved:', categories);
        handleResponse(res, 200, "Catégories récupérées avec succès", categories);
    } catch (error) {
        console.error('Error in getAllCategoriesController:', error);
        handleResponse(res, 500, "Une erreur est survenue");
    }
};

export const getCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log('Getting category with id:', id);
        const category = await getCategory(parseInt(id));
        
        if (!category) {
            handleResponse(res, 404, "Catégorie non trouvée");
            return;
        }
        
        handleResponse(res, 200, "Catégorie récupérée avec succès", category);
    } catch (error) {
        console.error('Error in getCategoryController:', error);
        handleResponse(res, 500, "Une erreur est survenue");
    }
};

export const getBooksByCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        console.log('Getting books for category:', categoryId);
        const books = await getBooksByCategory(parseInt(categoryId));
        
        if (!books || books.length === 0) {
            handleResponse(res, 404, "Aucun livre trouvé pour cette catégorie");
            return;
        }
        
        handleResponse(res, 200, "Livres de la catégorie récupérés avec succès", books);
    } catch (error) {
        console.error('Error in getBooksByCategoryController:', error);
        handleResponse(res, 500, "Une erreur est survenue");
    }
}; 