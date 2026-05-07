// routes/ownerRoute.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { registerOwner } from "../controllers/ownerController.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

// ✅ multer config
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ route
router.post(
  "/",
  upload.fields([
    { name: "ownerPhoto", maxCount: 1 },
    { name: "shopImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 },
  ]),
  registerOwner
);

export default router;
