import express from "express";
import {
  addPayment,
  createRazorpayOrder,
  getPayments,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Add payment
router.post("/add", addPayment);
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

// Get payments by user
router.get("/:userId", getPayments);

// ✅ Default export
export default router;
