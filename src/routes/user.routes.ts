import { Router } from "express";
import { getUsersController, loginController, logoutController, postUserController } from "../controllers";

const router = Router(); 

router.get("/getAll", getUsersController);
router.post("/postUser", postUserController);
router.post("/login", loginController);
router.post("/logout", logoutController);

export default router;