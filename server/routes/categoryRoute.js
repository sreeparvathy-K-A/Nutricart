import express from "express";
import { addCategory, listCategory } from "../controllers/categoryController.js";
const router = express.Router();

router.post("/add", addCategory);
router.get("/list", listCategory);

export default router;