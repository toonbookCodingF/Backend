import { Router } from "express";
import { getUsersController, loginController, postUserController } from "../controllers";

const router = Router(); 

router.get("/getAll", getUsersController);
router.post("/postUser", postUserController);
router.post("/login", loginController);

export default router;