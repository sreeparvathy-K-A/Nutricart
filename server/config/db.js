import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("DB Connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};
