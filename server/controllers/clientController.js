import Client from "../models/clientModel.js";

export const registerClient = async (req, res) => {
  try {
    const { name, email, phone, password, dob, address, profileImage } = req.body;

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
      profileImage,
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

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, dob, address, profileImage } = req.body;

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        profileImage,
        dob,
        address,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Client update error:", error);
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};
