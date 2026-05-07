import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  registerDeliveryBoy,
  getDeliveryProfile,
  updateDeliveryProfile,
  updateDeliveryAvailability,
} from "../controllers/deliveryboyController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.post("/register", upload.single("photo"), registerDeliveryBoy);
router.get("/profile/:id", getDeliveryProfile);
router.put("/profile/:id", updateDeliveryProfile);
router.patch("/availability/:id", updateDeliveryAvailability);

export default router;
