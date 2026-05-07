// controllers/ownerController.js
import Owner from "../models/ownerModel.js";
import bcrypt from "bcryptjs";

export const registerOwner = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      password,
      street,
      city,
      state,
      pincode,
      fssaiNumber,
    } = req.body;

    // ✅ check existing email
    const existing = await Owner.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ handle images
    const ownerPhoto = req.files?.ownerPhoto?.[0]?.filename;
    const shopImage = req.files?.shopImage?.[0]?.filename;
    const licenseImage = req.files?.licenseImage?.[0]?.filename;

    const owner = new Owner({
      businessName,
      ownerName,
      email,
      phone,
      password: hashedPassword,
      street,
      city,
      state,
      pincode,
      fssaiNumber,
      ownerPhoto,
      shopImage,
      licenseImage,
    });

    const savedOwner = await owner.save();

    res.status(201).json({
      message: "Registration successful. Wait for admin approval.",
      data: savedOwner,
    });
  } catch (error) {
    console.error("ERROR 👉", error.message);
    res.status(500).json({ message: error.message });
  }
};