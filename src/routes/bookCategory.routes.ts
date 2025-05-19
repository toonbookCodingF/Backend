import { Router } from "express";
import { 
    getAllBookCategoriesController, 
    getBookCategoryController,
    getCategoriesByBookController,
    getBooksByCategoryIdController,
    createBookCategoryController,
    updateBookCategoryController,
    deleteBookCategoryController
} from "../controllers/bookCategory.controller";

const router = Router();

// Routes spécifiques d'abord
router.get("/book/:bookId", getCategoriesByBookController);
router.get("/category/:categoryId", getBooksByCategoryIdController);
router.get("/:bookId/:categoryId", getBookCategoryController);
// Route générique en dernier
router.get("/", getAllBookCategoriesController);

// Routes de modification
router.post("/", createBookCategoryController);
router.put("/:oldBookId/:oldCategoryId", updateBookCategoryController);
router.delete("/:bookId/:categoryId", deleteBookCategoryController);

export default router; 