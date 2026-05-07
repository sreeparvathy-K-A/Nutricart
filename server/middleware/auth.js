import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please login." });
    }

    const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-this";
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.id;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;
