// import express from "express";
// import { listOrders, placeOrder, updateStatus, userOrders } from "../controllers/orderController.js";
// import adminAuth from "../middleware/adminAuth.js";
// import authMiddleware from "../middleware/auth.js";

// const orderRouter = express.Router();

// orderRouter.post("/place", authMiddleware, placeOrder);
// orderRouter.post("/userorders", authMiddleware, userOrders);
// orderRouter.get("/list", authMiddleware, adminAuth, listOrders);
// orderRouter.post("/status", authMiddleware, adminAuth, updateStatus);

// export default orderRouter;
import express from "express";
import {
  placeOrder,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
  assignDeliveryBoy,
  getDeliveryOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/place", placeOrder);
router.get("/list", getAllOrders);
router.get("/user/:userId", getUserOrders);
router.get("/delivery/:deliveryBoyId", getDeliveryOrders);
router.put("/assign-delivery", assignDeliveryBoy);
router.put("/status", updateOrderStatus);

export default router;
