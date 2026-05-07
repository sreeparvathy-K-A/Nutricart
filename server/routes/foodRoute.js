// import express from "express";
// import multer from "multer";
// import fs from "fs";

// import {
//   addFood,
//   getFoods,
//   removeFood,
// } from "../controllers/foodController.js";

// const router = express.Router();

// // ✅ ensure uploads folder exists
// if (!fs.existsSync("uploads")) {
//   fs.mkdirSync("uploads");
// }

// // multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// // routes
// router.post("/add", upload.single("image"), addFood);
// router.get("/list", getFoods);
// router.post("/remove", removeFood);

// export default router;

import express from "express";
import multer from "multer";
import {
  addFood,
  getFoods,
  getFoodsByOwner,
  removeFood,
  updateFood,
} from "../controllers/foodController.js";

const router = express.Router();

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ➕ ADD FOOD
router.post("/add", upload.single("image"), addFood);

// 🍔 GET ALL FOODS
router.get("/list", getFoods);

// 🍽️ GET OWNER FOODS
router.get("/owner/:ownerName", getFoodsByOwner);

// ✏️ UPDATE FOOD
router.put("/update/:id", upload.single("image"), updateFood);

// 🗑️ DELETE FOOD
router.delete("/delete/:id", removeFood);

export default router;
