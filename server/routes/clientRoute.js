// server/routes/clientRoute.js
import express from "express";
import { registerClient, updateClient } from "../controllers/clientController.js";

const router = express.Router();

// POST /api/clients → register new client
router.post("/", registerClient);
router.put("/:id", updateClient);

export default router;
