// models/ownerModel.js
import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },

    password: { type: String, required: true },

    street: String,
    city: String,
    state: String,
    pincode: String,
    restaurantAddress: String,
    restaurantType: { type: String, enum: ["Veg", "Non-Veg", "Both"], default: "Both" },
    deliveryRadius: String,

    // ✅ NEW (Healthy platform)
    fssaiNumber: { type: String, required: true },

    // ✅ Images
    ownerPhoto: String,
    shopImage: String,
    licenseImage: String,

    // ✅ Admin approval
    isApproved: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Owner = mongoose.model("Owner", ownerSchema);
export default Owner;

