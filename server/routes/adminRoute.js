
import express from "express";

import Client from "../models/clientModel.js";
import Owner from "../models/ownerModel.js";
import Delivery from "../models/deliveryboyModel.js";

const router = express.Router();


// ✅ GET CLIENTS
router.get("/clients", async (req, res) => {
  try {
    const data = await Client.find();
    console.log("Clients:", data); // debug
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET OWNERS
router.get("/owners", async (req, res) => {
  try {
    const data = await Owner.find();
    console.log("Owners:", data); // debug
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET DELIVERY
router.get("/delivery", async (req, res) => {
  try {
    const data = await Delivery.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ VIEW USER
router.get("/user/:id", async (req, res) => {
  try {
    let user =
      (await Client.findById(req.params.id)) ||
      (await Owner.findById(req.params.id)) ||
      (await Delivery.findById(req.params.id));

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ APPROVE OWNER
router.post("/owners/approve/:id", async (req, res) => {
  await Owner.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "Owner Approved" });
});


// ❌ REJECT OWNER
router.post("/owners/reject/:id", async (req, res) => {
  await Owner.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.json({ message: "Owner Rejected" });
});


// ✅ APPROVE DELIVERY
router.post("/delivery/approve/:id", async (req, res) => {
  const updated = await Delivery.findByIdAndUpdate(
    req.params.id,
    { status: "approved", isApproved: true, role: "delivery" },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Delivery record not found" });
  }

  res.json({ message: "Delivery Approved", delivery: updated });
});


// ❌ REJECT DELIVERY
router.post("/delivery/reject/:id", async (req, res) => {
  const updated = await Delivery.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", isApproved: false, role: "delivery" },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Delivery record not found" });
  }

  res.json({ message: "Delivery Rejected", delivery: updated });
});


export default router;
