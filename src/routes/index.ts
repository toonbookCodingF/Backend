import { Router } from "express";
import userRoutes from "./user.routes";
import bookRoutes from "./book.routes";
import chapterRoutes from "./chapter.routes";
import bookContentRoutes from "./bookContent.routes";
import categoryRoutes from "./category.routes";
import bookCategoryRoutes from "./bookCategory.routes";
import bookTypeRoutes from "./bookType.routes";
import commentRoutes from "./comment.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/books", bookRoutes);
router.use("/chapters", chapterRoutes);
router.use("/book-contents", bookContentRoutes);
router.use("/categories", categoryRoutes);
router.use("/book-categories", bookCategoryRoutes);
router.use("/book-types", bookTypeRoutes);
router.use("/comments", commentRoutes);

export default router;
