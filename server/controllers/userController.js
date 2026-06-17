import userModel from "../models/userModel.js";
import Client from "../models/clientModel.js";
import Owner from "../models/ownerModel.js";
import DeliveryBoy from "../models/deliveryboyModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const buildUserPayload = (user, role) => {
  const hotel = user.hotel || user.businessName || "";
  const address =
    user.address ||
    [user.street, user.city, user.state, user.pincode].filter(Boolean).join(", ");

  return {
    id: user._id,
    name: user.name || user.ownerName || "",
    email: user.email,
    role,
    phone: user.phone || "",
    hotel,
    address,
    businessName: user.businessName || "",
    city: user.city || "",
    state: user.state || "",
    pincode: user.pincode || "",
  };
};

const sendLoginResponse = (res, user, role) => {
  const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({
    message: "Login successful",
    user: buildUserPayload(user, role),
    token,
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all fields",
      });
    }

    const existingUser = await userModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "client",
      status:
        role === "owner" || role === "delivery"
          ? "pending"
          : "approved",
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide all fields",
      });
    }

    email = email.toLowerCase();

    let user = await userModel.findOne({ email });
    let role = "";

    if (user) {
      role = user.role;

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid password",
        });
      }

      if ((role === "owner" || role === "delivery") && user.status !== "approved") {
        return res.status(403).json({
          message: "Waiting for admin approval",
        });
      }
    } else {
      const owner = await Owner.findOne({ email });

      if (owner) {
        const passwordLooksHashed = typeof owner.password === "string" && owner.password.startsWith("$2");
        const isMatch = passwordLooksHashed
          ? await bcrypt.compare(password, owner.password)
          : password === owner.password;

        if (!isMatch) {
          return res.status(400).json({
            message: "Invalid password",
          });
        }

        if (owner.status !== "approved") {
          return res.status(403).json({
            message: "Waiting for admin approval",
          });
        }

        user = owner;
        role = "owner";
      } else {
        const deliveryBoy = await DeliveryBoy.findOne({ email });

        if (deliveryBoy) {
          const passwordLooksHashed =
            typeof deliveryBoy.password === "string" && deliveryBoy.password.startsWith("$2");
          const isMatch = passwordLooksHashed
            ? await bcrypt.compare(password, deliveryBoy.password)
            : password === deliveryBoy.password;

          if (!isMatch) {
            return res.status(400).json({
              message: "Invalid password",
            });
          }

          if (deliveryBoy.status !== "approved" && !deliveryBoy.isApproved) {
            return res.status(403).json({
              message: "Waiting for admin approval",
            });
          }

          user = deliveryBoy;
          role = "delivery";
        } else {
          const client = await Client.findOne({ email });

          if (!client) {
            return res.status(400).json({
              message: "User not found",
            });
          }

          if (client.password !== password) {
            return res.status(400).json({
              message: "Invalid password",
            });
          }

          user = client;
          role = "client";
        }
      }
    }

    return sendLoginResponse(res, user, role);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginClient = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    email = email.toLowerCase();
    const client = await Client.findOne({ email });

    if (!client) {
      return res.status(400).json({ message: "Client account not found" });
    }

    const passwordLooksHashed =
      typeof client.password === "string" && client.password.startsWith("$2");
    const isMatch = passwordLooksHashed
      ? await bcrypt.compare(password, client.password)
      : client.password === password;

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    return sendLoginResponse(res, client, "client");
  } catch (error) {
    console.error("Client login error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    email = email.trim().toLowerCase();
    password = password.trim();
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    if (envAdminEmail && envAdminPassword && email === envAdminEmail) {
      if (password !== envAdminPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      return sendLoginResponse(
        res,
        {
          _id: "env-admin",
          name: "Admin",
          email: envAdminEmail,
          role: "admin",
        },
        "admin"
      );
    }

    const admin = await userModel.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(400).json({ message: "Admin account not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    return sendLoginResponse(res, admin, "admin");
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id, name, phone, hotel, address, role } = req.body;

    let updatedUser;

    if (role === "owner") {
      updatedUser = await Owner.findByIdAndUpdate(
        id,
        {
          ownerName: name,
          phone,
          businessName: hotel,
          street: address,
        },
        { new: true }
      );
    } else {
      updatedUser = await userModel.findByIdAndUpdate(
        id,
        {
          name,
          phone,
          address,
        },
        { new: true }
      );
    }

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated",
      user: buildUserPayload(updatedUser, role || updatedUser.role || "client"),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Update failed",
    });
  }
};
