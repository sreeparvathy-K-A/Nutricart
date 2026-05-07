


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "owner", "client", "delivery"],
      default: "client",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // 🔥 better logic
    },
  },
  { timestamps: true }
);

// 🔥 FIX HERE
const userModel =
  mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
