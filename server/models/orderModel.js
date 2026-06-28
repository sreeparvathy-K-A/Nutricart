import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
        },
        quantity: Number,
      },
    ],
    totalAmount: Number,
    address: {
      type: String,
      default: "",
    },
    preparationInstructions: {
      type: String,
      default: "",
      maxlength: 300,
    },
    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },
    deliveryBoyName: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Pending",
    },
    restaurantStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Preparing", "Ready for Pickup"],
      default: "Pending",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
