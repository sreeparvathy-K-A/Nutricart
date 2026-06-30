import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import Owner from "../models/ownerModel.js";

const uploadOwnerImage = async (file, folderName, resourceType = "image") => {
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
        folder: `nutricart/owners/${folderName}`,
        resource_type: resourceType,
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
      restaurantAddress,
      restaurantType,
      deliveryRadius,
    } = req.body;

    const existing = await Owner.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const ownerPhotoFile = req.files?.ownerPhoto?.[0];
    const licenseImageFile = req.files?.licenseImage?.[0];

    if (!ownerPhotoFile || !licenseImageFile) {
      return res.status(400).json({
        message: "Owner photo and FSSAI license document are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [ownerPhoto, licenseImage] = await Promise.all([
      uploadOwnerImage(ownerPhotoFile, "photos"),
      uploadOwnerImage(licenseImageFile, "licenses", "auto"),
    ]);

    const owner = new Owner({
      businessName,
      ownerName,
      email,
      phone,
      password: hashedPassword,
      street: restaurantAddress || street,
      city,
      fssaiNumber,
      restaurantAddress: restaurantAddress || street,
      restaurantType,
      deliveryRadius,
      ownerPhoto,
      licenseImage,
    });

    const savedOwner = await owner.save();

    res.status(201).json({
      message: "Registration successful. Wait for admin approval.",
      data: savedOwner,
    });
  } catch (error) {
    console.error("Owner registration error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
