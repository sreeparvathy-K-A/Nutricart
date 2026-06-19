import mongoose from "mongoose";
import app from "../app.js";

let connectionPromise;

function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!process.env.MONGO_URI) {
    return Promise.reject(new Error("MONGO_URI is not configured"));
  }

  connectionPromise ??= mongoose.connect(process.env.MONGO_URI);
  return connectionPromise;
}

export default async function handler(req, res) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(500).json({ message: "Database connection failed" });
  }
}
