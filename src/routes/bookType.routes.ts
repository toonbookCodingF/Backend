import { Router } from "express";
import { getAllBookTypesController, getBookTypeController } from "../controllers/bookType.controller";

const router = Router();

router.get("/", getAllBookTypesController);
router.get("/:id", getBookTypeController);

export default router; 