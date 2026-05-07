import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import userRoute from "./routes/UserRoute.js";
import foodRoute from "./routes/foodRoute.js";
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import adminRoute from "./routes/adminRoute.js";
import clientRoute from "./routes/clientRoute.js";
import deliveryboyRoute from "./routes/deliveryboyRoute.js";
import ownerRoute from "./routes/ownerRoute.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send("Nutricart Backend Running");
});

app.use("/api/users", userRoute);
app.use("/api/foods", foodRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/admin", adminRoute);
app.use("/api/clients", clientRoute);
app.use("/api/delivery", deliveryboyRoute);
app.use("/api/registerOwner", ownerRoute);

export default app;
