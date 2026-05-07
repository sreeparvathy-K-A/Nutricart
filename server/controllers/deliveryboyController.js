import DeliveryBoy from "../models/deliveryboyModel.js";
import bcrypt from "bcryptjs";

export const registerDeliveryBoy = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      vehicleType,
      vehicleNumber,
      licenseNumber,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Photo required" });
    }

    const existing = await DeliveryBoy.findOne({
      $or: [{ email }, { phone }, { vehicleNumber }, { licenseNumber }],
    });

    if (existing) {
      return res.status(400).json({ message: "Email / Phone / License exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const deliveryBoy = new DeliveryBoy({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      photo: req.file.filename,
      status: "pending",
      availability: "available",
      isApproved: false,
    });

    await deliveryBoy.save();

    res.status(201).json({ message: "Registered successfully (Wait for admin approval)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getDeliveryProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryBoy = await DeliveryBoy.findById(id).select("-password");

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery profile not found" });
    }

    res.status(200).json(deliveryBoy);
  } catch (error) {
    console.error("Get delivery profile error:", error);
    res.status(500).json({ message: "Error fetching delivery profile" });
  }
};

export const updateDeliveryProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      address,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      availability,
    } = req.body;

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        address,
        vehicleType,
        vehicleNumber,
        licenseNumber,
        availability,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery profile not found" });
    }

    res.status(200).json({
      message: "Delivery profile updated",
      deliveryBoy,
    });
  } catch (error) {
    console.error("Update delivery profile error:", error);
    res.status(500).json({ message: error.message || "Error updating delivery profile" });
  }
};

export const updateDeliveryAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    if (!["available", "busy", "offline"].includes(String(availability || "").toLowerCase())) {
      return res.status(400).json({ message: "Invalid availability status" });
    }

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      id,
      { availability: availability.toLowerCase() },
      { new: true }
    ).select("-password");

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery profile not found" });
    }

    res.status(200).json({
      message: "Availability updated",
      deliveryBoy,
    });
  } catch (error) {
    console.error("Update delivery availability error:", error);
    res.status(500).json({ message: "Error updating availability" });
  }
};
