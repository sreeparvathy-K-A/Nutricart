import userModel from "../models/UserModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error validating admin access" });
  }
};

export default adminAuth;
