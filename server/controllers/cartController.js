import mongoose from "mongoose";
import Cart from "../models/cartModel.js";

const { ObjectId } = mongoose.Types;

export const addToCart = async (req, res) => {
  try {
    let { userId, foodId, quantity } = req.body;

    quantity = quantity ? Number(quantity) : 1;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(foodId)) {
      return res.status(400).json({
        message: "Invalid userId or foodId",
      });
    }

    const existing = await Cart.findOne({ userId, foodId });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();

      return res.status(200).json({
        message: "Cart updated",
        cart: existing,
      });
    }

    const cartItem = new Cart({
      userId: new ObjectId(userId),
      foodId: new ObjectId(foodId),
      quantity,
    });

    await cartItem.save();

    res.status(201).json({
      message: "Added to cart",
      cart: cartItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const cartItems = await Cart.find({ userId })
      .populate("foodId")
      .sort({ createdAt: -1 });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Fetch cart error:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!ObjectId.isValid(cartId)) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const nextQuantity = Number(quantity);

    if (!nextQuantity || nextQuantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cartId,
      { quantity: nextQuantity },
      { new: true }
    ).populate("foodId");

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({
      message: "Cart item updated",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Error updating cart item" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!ObjectId.isValid(cartId)) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const deletedCart = await Cart.findByIdAndDelete(cartId);

    if (!deletedCart) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ message: "Cart item removed" });
  } catch (error) {
    console.error("Remove cart error:", error);
    res.status(500).json({ message: "Error removing cart item" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    await Cart.deleteMany({ userId });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Error clearing cart" });
  }
};
