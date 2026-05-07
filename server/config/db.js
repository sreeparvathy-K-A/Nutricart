import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb+srv://sreeparvathyka63_db_user:Nutricart@cluster0.9tv7dku.mongodb.net/Food-del";

  try {
    await mongoose.connect(mongoUri);
    console.log("DB Connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};
