import { Router } from "express";
import userRoutes from "./user.routes";
import bookRoutes from "./book.routes";
import chapterRoutes from "./chapter.routes";
import bookContentRoutes from "./bookContent.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/books", bookRoutes);
router.use("/chapters", chapterRoutes);
router.use("/book-contents", bookContentRoutes);

export default router;
