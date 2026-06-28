import React, { useState } from "react";
import axios from "axios";
import OwnerSidebar from "../components/OwnerSidebar";
import "../CSS-pages/OwnerDashboard.css";
import "../CSS-pages/AddFood.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

const initialFormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  calories: "",
  protein: "",
  rating: "",
};

const foodCategories = [
  "Healthy Meal",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Salad",
  "Smoothie",
  "Protein Bowl",
  "Vegan",
  "Weight Loss",
  "Muscle Gain",
  "Low Calorie",
  "Diabetic Friendly",
  "Gluten Free",
  "Snacks",
  "Drinks",
];

const AddFood = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const hotelName =
    storedUser?.hotel ||
    storedUser?.businessName ||
    storedUser?.name ||
    "Owner";
  const ownerLocation =
    storedUser?.address ||
    [storedUser?.city, storedUser?.state, storedUser?.pincode].filter(Boolean).join(", ");
  const ownerId = storedUser?.id || "";
  const ownerEmail = storedUser?.email || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setImage(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required");
      return;
    }

    if (!image) {
      alert("Select an image");
      return;
    }

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    data.append("ownerId", ownerId);
    data.append("ownerEmail", ownerEmail);
    data.append("hotelName", hotelName);
    data.append("location", ownerLocation);
    data.append("image", image);

    try {
      setIsSubmitting(true);

      const response = await axios.post(`${API_BASE_URL}/api/foods/add`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data?.message || "Food added successfully");
      setFormData(initialFormState);
      setImage(null);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error adding food");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="owner-dashboard add-food-page">
      <OwnerSidebar />

      <main className="owner-main add-food-main">
      <section className="add-food-hero">
        <p className="add-food-kicker">Menu Management</p>
        <h1>Add Food</h1>
        <p>Add the food information customers need to see.</p>
      </section>

      <div className="add-food-layout">
        <form className="add-food-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <div>
              <p className="add-food-kicker">Food details</p>
              <h2>Create menu item</h2>
            </div>
          </div>

          <div className="form-grid">
            <label className="field field-wide">
              <span>Food name</span>
              <input
                name="name"
                value={formData.name}
                placeholder="Paneer Power Bowl"
                onChange={handleChange}
                required
              />
            </label>

            <label className="field field-wide">
              <span>Description</span>
              <textarea
                name="description"
                value={formData.description}
                placeholder="A short, appetizing description for customers"
                onChange={handleChange}
                rows="4"
              />
            </label>

            <label className="field">
              <span>Price</span>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                placeholder="199"
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {foodCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Calories</span>
              <input
                name="calories"
                type="number"
                min="0"
                value={formData.calories}
                placeholder="350"
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span>Protein</span>
              <input
                name="protein"
                type="number"
                min="0"
                value={formData.protein}
                placeholder="22"
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span>Rating</span>
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                placeholder="4.5"
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="upload-box">
            <span className="upload-label">Food image</span>
            <input type="file" accept="image/*" onChange={handleImageChange} required />
            <strong>{image ? image.name : "Choose an image to upload"}</strong>
            <p>Use a clear food photo for a better menu listing.</p>
          </label>

          <button className="submit-food-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Food"}
          </button>
        </form>
      </div>
      </main>
    </div>
  );
};

export default AddFood;
