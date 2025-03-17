import { Router } from "express";
import { getUsersController, loginController, logoutController, postUserController } from "../controllers";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/getAll", authenticateToken, getUsersController); // Public
router.post("/postUser", postUserController); // Public
router.get("/login", loginController); // Public

// Routes protégées
router.post("/logout", authenticateToken, logoutController);

export default router;
