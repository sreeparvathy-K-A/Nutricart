import express from "express";
import {
  registerUser,
  loginUser,
  loginClient,
  loginAdmin,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/client-login", loginClient);
router.post("/admin-login", loginAdmin);
router.post("/update", updateUserProfile);

export default router;
