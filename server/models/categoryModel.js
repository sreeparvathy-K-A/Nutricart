import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

// Create the model
const Category = mongoose.model("Category", categorySchema);

// ✅ Default export is mandatory for import Category from "../models/categoryModel.js";
export default Category;