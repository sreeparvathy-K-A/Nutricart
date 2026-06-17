import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoDB connection failed", err.message);
    });
} else {
  console.warn("MONGO_URI is not set. Database features will be unavailable.");
}
