import express from "express";
import multer from "multer";
import { registerOwner } from "../controllers/ownerController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
