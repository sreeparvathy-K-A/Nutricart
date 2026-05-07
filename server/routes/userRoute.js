import express from "express";
import { registerUser, loginUser, updateUserProfile } from "../controllers/userController.js";

const router = express.Router();   // ✅ MUST come first

// ================= ROUTES =================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/update", updateUserProfile); // ✅ your new route

export default router;