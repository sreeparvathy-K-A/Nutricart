import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OwnerSidebar from "../components/OwnerSidebar";
import "../CSS-pages/OwnerDashboard.css";
import "../CSS-pages/MyFood.css";

const API_BASE_URL = "";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  calories: "",
  protein: "",
  rating: "",
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/uploads")) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return `${API_BASE_URL}/${imagePath.replace(/^\/+/, "")}`;
};

function MyFood() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState(emptyForm);
  const [newImage, setNewImage] = useState(null);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch {
      return {};
    }
  }, []);

  const ownerName = storedUser?.name || "";
  const hotelName =
    storedUser?.hotel ||
    storedUser?.businessName ||
    storedUser?.name ||
    "";
  const ownerLocation =
    storedUser?.address ||
    [storedUser?.city, storedUser?.state, storedUser?.pincode].filter(Boolean).join(", ");
  const ownerId = storedUser?.id || "";
  const ownerEmail = storedUser?.email || "owner@nutricart.com";

  const fetchFoods = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await axios.get(
        `${API_BASE_URL}/api/foods/owner/${encodeURIComponent(ownerName)}`,
        {
          params: {
            ownerId,
            ownerEmail,
          },
        }
      );
      setFoods(response.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);

      try {
        const fallbackResponse = await axios.get(`${API_BASE_URL}/api/foods/list`);
        const filteredFoods = (fallbackResponse.data || []).filter((food) => {
          return (
            (ownerId && food.ownerId === ownerId) ||
            (ownerEmail && food.ownerEmail === ownerEmail) ||
            (ownerName && food.hotelName === ownerName) ||
            (hotelName && food.hotelName === hotelName)
          );
        });

        setFoods(filteredFoods);
        setErrorMessage(
          "Owner filter route was unavailable, so a fallback food list was used."
        );
      } catch (fallbackErr) {
        console.log(fallbackErr.response?.data || fallbackErr.message);
        setFoods([]);
        setErrorMessage(
          "Unable to load your foods. If you recently changed the backend, restart the server and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [hotelName, ownerEmail, ownerId, ownerName]);

  useEffect(() => {
    if (!ownerName) {
      navigate("/restaurant/login");
      return;
    }

    fetchFoods();
  }, [fetchFoods, navigate, ownerName]);

  const startEdit = (food) => {
    setEditingId(food._id);
    setEditForm({
      name: food.name || "",
      description: food.description || "",
      price: food.price ?? "",
      category: food.category || "",
      calories: food.calories ?? "",
      protein: food.protein ?? "",
      rating: food.rating ?? "",
    });
    setNewImage(null);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditForm(emptyForm);
    setNewImage(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (foodId) => {
    const confirmed = window.confirm("Delete this food item?");
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/foods/delete/${foodId}`);
      setFoods((prev) => prev.filter((food) => food._id !== foodId));
      if (editingId === foodId) {
        cancelEdit();
      }
      alert("Food deleted successfully");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Unable to delete food");
    }
  };

  const handleUpdate = async (foodId) => {
    if (!editForm.name || !editForm.price) {
      alert("Name and price are required");
      return;
    }

    try {
      setIsSaving(true);

      const payload = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        payload.append(key, value);
      });
      payload.append("ownerId", ownerId);
      payload.append("ownerEmail", ownerEmail);
      payload.append("hotelName", hotelName || ownerName);
      payload.append("location", ownerLocation);

      if (newImage) {
        payload.append("image", newImage);
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/foods/update/${foodId}`,
        payload
      );

      const updatedFood = response.data?.food;

      setFoods((prev) =>
        prev.map((food) => (food._id === foodId ? updatedFood : food))
      );

      cancelEdit();
      alert("Food updated successfully");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Unable to update food");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="owner-dashboard owner-food-page">
      <OwnerSidebar />

      <main className="owner-main owner-food-main">
        <section className="owner-food-hero">
          <div>
            <p className="hero-kicker">My foods</p>
            <h1>Manage your food list</h1>
            <p>
              View everything you have added, update details anytime, and remove old menu items.
            </p>
          </div>
        </section>

        {errorMessage ? (
          <div className="owner-food-notice">
            <p>{errorMessage}</p>
            <div className="owner-food-notice-actions">
              <button type="button" onClick={fetchFoods}>
                Retry
              </button>
              <button type="button" className="secondary" onClick={() => navigate("/owner")}>
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="owner-food-empty">Loading your food list...</div>
        ) : foods.length === 0 ? (
          <div className="owner-food-empty">
            <h3>No foods added yet</h3>
            <p>Your menu is empty right now. Add your first item to start selling.</p>
            <button type="button" onClick={() => navigate("/owner/add-food")}>
              Add Food
            </button>
          </div>
        ) : (
          <section className="owner-food-grid">
            {foods.map((food) => {
              const isEditing = editingId === food._id;
              const imageUrl = getImageUrl(food.image);

              return (
                <article className="food-card" key={food._id}>
                  <div className="food-card-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={food.name} />
                    ) : (
                      <div className="food-card-image-fallback">No image</div>
                    )}
                    <span>{food.category || "Menu item"}</span>
                  </div>

                  <div className="food-card-body">
                    {isEditing ? (
                      <div className="food-edit-form">
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          placeholder="Food name"
                        />
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          placeholder="Description"
                          rows="3"
                        />
                        <div className="food-edit-grid">
                          <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={editForm.price}
                            onChange={handleEditChange}
                            placeholder="Price"
                          />
                          <input
                            name="category"
                            value={editForm.category}
                            onChange={handleEditChange}
                            placeholder="Category"
                          />
                          <input
                            name="calories"
                            type="number"
                            min="0"
                            value={editForm.calories}
                            onChange={handleEditChange}
                            placeholder="Calories"
                          />
                          <input
                            name="protein"
                            type="number"
                            min="0"
                            value={editForm.protein}
                            onChange={handleEditChange}
                            placeholder="Protein"
                          />
                          <input
                            name="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={editForm.rating}
                            onChange={handleEditChange}
                            placeholder="Rating"
                          />
                        </div>

                        <label className="file-field">
                          <span>Replace image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                          />
                        </label>

                        <div className="food-card-actions">
                          <button
                            type="button"
                            className="primary"
                            onClick={() => handleUpdate(food._id)}
                            disabled={isSaving}
                          >
                            {isSaving ? "Saving..." : "Update"}
                          </button>
                          <button type="button" className="ghost" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="food-card-top">
                          <div>
                            <h3>{food.name}</h3>
                            <p>{food.description || "No description added yet."}</p>
                          </div>
                          <strong>Rs. {food.price}</strong>
                        </div>

                        <div className="food-meta">
                          <span>{food.category || "Uncategorized"}</span>
                          <span>{food.calories || 0} kcal</span>
                          <span>{food.protein || 0} g protein</span>
                          <span>{food.rating || 0} rating</span>
                        </div>

                        <div className="food-card-actions">
                          <button type="button" className="primary" onClick={() => startEdit(food)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDelete(food._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default MyFood;
