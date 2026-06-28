import express from "express";
import multer from "multer";
import {
  getDeliveryProfile,
  registerDeliveryBoy,
  updateDeliveryAvailability,
  updateDeliveryProfile,
} from "../controllers/deliveryboyController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", upload.single("photo"), registerDeliveryBoy);
router.get("/profile/:id", getDeliveryProfile);
router.put("/profile/:id", upload.single("photo"), updateDeliveryProfile);
router.patch("/availability/:id", updateDeliveryAvailability);

export default router;
