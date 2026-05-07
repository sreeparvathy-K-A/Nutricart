import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, default: "" },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    image: { type: String, required: true },
    ownerId: { type: String, default: "", trim: true },
    ownerEmail: { type: String, default: "", trim: true },
    hotelName: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default Food;
