// server/routes/clientRoute.js
import express from "express";
import { registerClient } from "../controllers/clientController.js";

const router = express.Router();

// POST /api/clients → register new client
router.post("/", registerClient);

export default router;