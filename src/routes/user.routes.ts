import { Router } from "express";
import { getUsersController, postUserController } from "../controllers";

const router = Router(); 

router.get("/getAll", getUsersController);
router.post("/postUser", postUserController);

export default router;