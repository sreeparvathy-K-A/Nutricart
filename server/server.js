// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import { connectDB } from "./config/db.js";
// // import foodRouter from "./routes/foodRoute.js";
// // import userRouter from "./routes/userRoutes.js";
// // import cartRouter from "./routes/cartRoute.js";
// // import orderRouter from "./routes/orderRoute.js";

// // // app config
// // dotenv.config();
// // const app = express();
// // const port = process.env.PORT || 5000;

// // // middleware
// // app.use(express.json());
// // app.use(cors());

// // // serve uploaded images
// // app.use("/images", express.static("uploads"));

// // // API endpoints
// // app.use("/api/food", foodRouter);
// // app.use("/api/user", userRouter);
// // app.use("/api/cart", cartRouter);
// // app.use("/api/order", orderRouter);

// // // basic test route
// // app.get("/", (req, res) => {
// //   res.send("API Working");
// // });

// // // start server after DB connection
// // const startServer = async () => {
// //   try {
// //     await connectDB();
// //     app.listen(port, () => {
// //       console.log(`Server started on http://localhost:${port}`);
// //     });
// //   } catch (error) {
// //     console.error("Server startup aborted due to database connection failure:", error);
// //     process.exit(1);
// //   }
// // };

// // startServer();
// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";

// // Import all routes
// import userRoute from "./routes/userRoutes.js";
// import foodRoute from "./routes/foodRoute.js";
// import cartRoute from "./routes/cartRoute.js";
// import orderRoute from "./routes/orderRoute.js";
// import paymentRoute from "./routes/paymentRoute.js";
// import categoryRoute from "./routes/categoryRoute.js";

// // Initialize dotenv
// dotenv.config();

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Root endpoint
// app.get("/", (req, res) => {
//   res.send("Nutricart Backend is Running ✅");
// });

// // Connect routes
// app.use("/api/users", userRoute);
// app.use("/api/foods", foodRoute);
// app.use("/api/carts", cartRoute);
// app.use("/api/orders", orderRoute);
// app.use("/api/payments", paymentRoute);
// app.use("/api/categories", categoryRoute);

// // MongoDB Connection
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;

// mongoose
//   .connect(MONGO_URI) // ✅ no need for useNewUrlParser or useUnifiedTopology in Mongoose v7+
//   .then(() => {
//     console.log("MongoDB connected ✅");
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT} 🚀`);
//     });
//   })
//   .catch((err) => {
//     console.error("MongoDB connection failed ❌", err);
//   });

import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed ❌", err);
  });