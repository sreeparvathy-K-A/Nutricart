import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    vehicleType: {
      type: String,
      enum: ["Bike", "Scooter"],
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    photo: {
      type: String,
    },

    role: {
      type: String,
      default: "delivery",
    },

    status: {
      type: String,
      default: "pending",
    },

    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ IMPORTANT NAME CHANGE
const DeliveryBoy = mongoose.model("DeliveryBoy", deliveryBoySchema);

export default DeliveryBoy;
