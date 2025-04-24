import { Router } from "express";
import { getUsersController, loginController, logoutController, createUserController } from "../controllers";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Routes publiques
router.post("/login", loginController);
router.post("/postUser", createUserController);

// Routes protégées
router.get("/getAll", authenticateToken, getUsersController);
router.get("/logout", authenticateToken, logoutController);

export default router;
