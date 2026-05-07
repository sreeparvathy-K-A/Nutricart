import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";
import crypto from "crypto";

const createRazorpayOrderRequest = ({ amount, currency = "INR", receipt }) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  const payload = JSON.stringify({
    amount: Math.round(Number(amount) * 100),
    currency,
    receipt,
  });

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  return fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload).toString(),
    },
    body: payload,
  });
};

// Add payment
export const addPayment = async (req, res) => {
  try {
    const { orderId, userId, amount, paymentMethod, paymentStatus } = req.body;
    const normalizedAmount = Number(amount);

    if (!orderId || !userId || !normalizedAmount || normalizedAmount < 1 || !paymentMethod) {
      return res.status(400).json({ message: "Missing required payment details" });
    }

    const payment = new Payment({
      orderId,
      userId,
      amount: normalizedAmount,
      paymentMethod,
      paymentStatus: paymentStatus || "Pending",
    });

    await payment.save();
    res.status(201).json({ message: "Payment added", payment });
  } catch (error) {
    console.error("Add payment error:", error);
    res.status(500).json({ message: "Error adding payment" });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const normalizedAmount = Number(amount);

    if (!orderId || !normalizedAmount || normalizedAmount < 1) {
      return res.status(400).json({ message: "orderId and valid amount are required" });
    }

    const response = await createRazorpayOrderRequest({
      amount: normalizedAmount,
      receipt: `order_${String(orderId).slice(-12)}`,
    });

    const razorpayOrder = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: razorpayOrder?.error?.description || "Unable to create Razorpay order",
      });
    }

    await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });

    res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    res.status(500).json({ message: error.message || "Error creating Razorpay order" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      userId,
      amount,
      paymentMethod,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !userId ||
      !amount ||
      !paymentMethod ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ message: "Missing Razorpay verification details" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay secret is not configured" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Payment order mismatch" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const payment = new Payment({
      orderId,
      userId,
      amount: Number(amount),
      paymentMethod,
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    await payment.save();

    res.status(200).json({ message: "Payment verified", payment });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};

// Get payments
export const getPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ userId });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};
