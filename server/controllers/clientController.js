import Client from "../models/clientModel.js";

export const registerClient = async (req, res) => {
  try {
    const { name, email, phone, password, dob, address } = req.body;

    console.log("Registration data:", req.body); // Debug

    // Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "Client already exists ❌" });
    }

    // Create new client
    const client = new Client({
      name,
      email,
      phone,
      password,
      dob,
      address
    });

    const savedClient = await client.save();

    res.status(201).json({ message: "Registration Successful ✅", client: savedClient });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Registration Failed ❌", error: error.message });
  }
};