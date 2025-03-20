import { Router } from "express";
import { getUsersController, loginController, logoutController, createUserController } from "../controllers";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/getAll", authenticateToken, getUsersController); // Public
router.post("/postUser", createUserController); // Public
router.post("/login", loginController); // Public

// Routes protégées
router.get("/logout", authenticateToken, logoutController);

export default router;
