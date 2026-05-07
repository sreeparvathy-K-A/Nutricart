import express from "express";
import {
  addToCart,
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartItem,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:userId", getCartItems);
router.put("/:cartId", updateCartItem);
router.delete("/:cartId", removeCartItem);
router.delete("/clear/:userId", clearCart);

export default router;
