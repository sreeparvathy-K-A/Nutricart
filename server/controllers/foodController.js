import Food from "../models/foodModel.js";
import Owner from "../models/ownerModel.js";
import cloudinary from "../config/cloudinary.js";

const uploadFoodImage = async (file) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary is not configured");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "nutricart/foods",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};

const enrichFoodsWithOwnerDetails = async (foods) => {
  const ownerEmails = [...new Set(foods.map((food) => food.ownerEmail).filter(Boolean))];
  const ownerIds = [...new Set(foods.map((food) => food.ownerId).filter(Boolean))];

  if (ownerEmails.length === 0 && ownerIds.length === 0) {
    return foods;
  }

  const ownerQuery = [];

  if (ownerEmails.length > 0) {
    ownerQuery.push({ email: { $in: ownerEmails } });
  }

  if (ownerIds.length > 0) {
    ownerQuery.push({ _id: { $in: ownerIds } });
  }

  const owners = await Owner.find(ownerQuery.length > 0 ? { $or: ownerQuery } : {}).lean();
  const ownerEmailMap = new Map(owners.map((owner) => [owner.email, owner]));
  const ownerIdMap = new Map(owners.map((owner) => [String(owner._id), owner]));

  return foods.map((food) => {
    const owner = ownerEmailMap.get(food.ownerEmail) || ownerIdMap.get(String(food.ownerId));

    if (!owner) {
      return food;
    }

    const fallbackLocation = [owner.street, owner.city, owner.state, owner.pincode]
      .filter(Boolean)
      .join(", ");

    return {
      ...food,
      hotelName: owner.businessName || food.hotelName || owner.ownerName || "",
      location: food.location || fallbackLocation || "",
      rating: Number(food.rating || 0),
    };
  });
};

export const addFood = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      calories,
      protein,
      rating,
      ownerId,
      ownerEmail,
      hotelName,
      location,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    if (!hotelName) {
      return res.status(400).json({ message: "Owner name is required" });
    }

    const imageUrl = await uploadFoodImage(req.file);

    const food = new Food({
      name,
      description,
      price: Number(price),
      category,
      calories: calories ? Number(calories) : 0,
      protein: protein ? Number(protein) : 0,
      rating: rating ? Number(rating) : 0,
      image: imageUrl,
      ownerId: ownerId || "",
      ownerEmail: ownerEmail || "",
      hotelName,
      location: location || "",
    });

    await food.save();

    res.status(201).json({
      message: "Food added successfully",
      food,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message || "Error adding food" });
  }
};

export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 }).lean();
    const enrichedFoods = await enrichFoodsWithOwnerDetails(foods);
    res.status(200).json(enrichedFoods);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching foods" });
  }
};

export const getFoodsByOwner = async (req, res) => {
  try {
    const { ownerName } = req.params;
    const { ownerId, ownerEmail } = req.query;

    if (!ownerName && !ownerId && !ownerEmail) {
      return res.status(400).json({ message: "Owner details are required" });
    }

    const filters = [];

    if (ownerId) {
      filters.push({ ownerId });
    }

    if (ownerEmail) {
      filters.push({ ownerEmail });
    }

    if (ownerName) {
      filters.push({ hotelName: ownerName });
    }

    const foods = await Food.find(filters.length > 0 ? { $or: filters } : {})
      .sort({ createdAt: -1 })
      .lean();

    const enrichedFoods = await enrichFoodsWithOwnerDetails(foods);
    res.status(200).json(enrichedFoods);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching owner foods" });
  }
};

export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      calories,
      protein,
      rating,
      ownerId,
      ownerEmail,
      hotelName,
      location,
      isAvailable,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const updateData = {
      name,
      description,
      price: Number(price),
      category,
      calories: calories ? Number(calories) : 0,
      protein: protein ? Number(protein) : 0,
      rating: rating ? Number(rating) : 0,
      ownerId: ownerId || "",
      ownerEmail: ownerEmail || "",
      hotelName,
      location: location || "",
    };

    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable === true || isAvailable === "true";
    }

    if (req.file) {
      updateData.image = await uploadFoodImage(req.file);
    }

    const food = await Food.findByIdAndUpdate(id, updateData, { new: true });

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.status(200).json({ message: "Food updated successfully", food });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating food" });
  }
};

export const updateFoodAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ message: "A valid availability status is required" });
    }

    const food = await Food.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true, runValidators: true }
    );

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.status(200).json({
      message: isAvailable ? "Food is open for orders" : "Food marked as not available",
      food,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating food availability" });
  }
};

export const removeFood = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFood = await Food.findByIdAndDelete(id);

    if (!deletedFood) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.status(200).json({ message: "Food removed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error removing food" });
  }
};
