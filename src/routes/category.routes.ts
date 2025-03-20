import { Router } from "express";
import { 
    getAllCategoriesController, 
    getCategoryController,
    getBooksByCategoryController
} from "../controllers/category.controller";

const router = Router();

router.get("/", getAllCategoriesController);
router.get("/:id", getCategoryController);
router.get("/:categoryId/books", getBooksByCategoryController);

export default router; 