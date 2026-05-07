import Category from "../models/categoryModel.js";

// Add a new category
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      message: "Category added successfully ✅",
      category
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding category ❌",
      error: error.message
    });
  }
};

// List all categories
export const listCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching categories ❌",
      error: error.message
    });
  }
};