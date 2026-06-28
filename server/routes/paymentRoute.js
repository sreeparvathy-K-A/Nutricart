import express from "express";
import {
  addPayment,
  createRazorpayOrder,
  getPaymentConfig,
  getPayments,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Add payment
router.post("/add", addPayment);
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
router.get("/config", getPaymentConfig);

// Get payments by user
router.get("/:userId", getPayments);

// ✅ Default export
export default router;
