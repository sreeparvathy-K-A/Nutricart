import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCartPlus, FaMagnifyingGlass, FaStar, FaXmark } from "react-icons/fa6";
import "../CSS-pages/Menu.css";
import menuImg from "../assets/images/menuimg.jpg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

const getFoodImageUrl = (image) => {
  if (!image) return menuImg;

  const normalizedImage = String(image).replace(/\\/g, "/");

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/uploads\//i.test(normalizedImage)) {
    const uploadPath = new URL(normalizedImage).pathname;
    return encodeURI(`${API_BASE_URL}${uploadPath}`);
  }

  if (/^https?:\/\//i.test(normalizedImage) || normalizedImage.startsWith("data:")) {
    return normalizedImage;
  }

  if (normalizedImage.startsWith("/uploads")) {
    return encodeURI(`${API_BASE_URL}${normalizedImage}`);
  }

  if (normalizedImage.startsWith("uploads/")) {
    return encodeURI(`${API_BASE_URL}/${normalizedImage}`);
  }

  const uploadsIndex = normalizedImage.indexOf("uploads/");
  if (uploadsIndex >= 0) {
    return encodeURI(`${API_BASE_URL}/${normalizedImage.slice(uploadsIndex)}`);
  }

  return encodeURI(normalizedImage);
};

function Menu() {
  const location = useLocation();
  const initialSearch = new URLSearchParams(location.search).get("search") || "";
  const [foods, setFoods] = useState([]);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [quantities, setQuantities] = useState({});
  const [selectedFood, setSelectedFood] = useState(null);
  const navigate = useNavigate();
  const selectedCategory = new URLSearchParams(location.search).get("category") || "";

  useEffect(() => {
    const nextSearch = new URLSearchParams(location.search).get("search") || "";
    setSearchInput(nextSearch);
    setSearchQuery(nextSearch);
  }, [location.search]);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/foods/list`);
      const foodData = res.data?.foods || res.data || [];

      if (Array.isArray(foodData)) {
        setFoods(foodData);
      } else {
        setFoods([]);
      }
    } catch (err) {
      console.log("Error fetching foods:", err);
      setFoods([]);
    }
  };

  const filteredFoods = useMemo(() => {
    const normalizedCategory = selectedCategory.trim().toLowerCase();
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return foods.filter((item) => {
      const category = item.category?.trim().toLowerCase() || "";
      const name = item.name?.trim().toLowerCase() || "";
      const description = item.description?.trim().toLowerCase() || "";
      const hotelName = item.hotelName?.trim().toLowerCase() || "";

      const matchesCategory = !normalizedCategory ||
        category.includes(normalizedCategory) ||
        name.includes(normalizedCategory) ||
        description.includes(normalizedCategory);

      const matchesSearch = !normalizedSearch ||
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        hotelName.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [foods, searchQuery, selectedCategory]);

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    navigate("/menu");
  };

  const getRatingLabel = (rating) => {
    const numericRating = Number(rating || 0);
    return numericRating > 0 ? `Rating ${numericRating}` : "No reviews yet";
  };

  const getFoodQuantity = (foodId) => Number(quantities[foodId] || 1);

  const updateFoodQuantity = (foodId, nextQuantity) => {
    const safeQuantity = Math.min(20, Math.max(1, Number(nextQuantity) || 1));
    setQuantities((prev) => ({ ...prev, [foodId]: safeQuantity }));
  };

  const handleAddToCart = async (foodId) => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo") || "null");
    const quantity = getFoodQuantity(foodId);

    if (!storedUser || storedUser.role !== "client") {
      alert("Please login as client to add items to cart.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/carts/add`, {
        userId: storedUser.id,
        foodId,
        quantity,
      });

      alert(response.data?.message || `Added ${quantity} item(s) to cart`);
      navigate("/cart");
    } catch (err) {
      console.log("Add to cart error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Unable to add item to cart");
    }
  };

  return (
    <div className="menu-container">
      <section className="menu-hero">
        <div className="menu-hero-top">
          <button type="button" className="menu-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="menu-hero-content">
          <div>
            <p className="menu-kicker">Healthy selections</p>
            <h1 className="title">Menu</h1>
            <p className="menu-subtitle">
              Explore fresh meals, drinks, and balanced foods from registered hotel partners.
            </p>

            <div className="menu-search-bar">
              <FaMagnifyingGlass />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search food items"
              />
              <button type="button" className="menu-search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>

          <div className="menu-stats">
            <span>{filteredFoods.length} items</span>
            <span>{selectedCategory || "All categories"}</span>
            <span>{searchQuery || "All foods"}</span>
          </div>
        </div>
      </section>

      {selectedCategory || searchQuery ? (
        <div className="menu-filter-bar">
          <p>
            {selectedCategory && searchQuery ? (
              <>Showing foods for <strong>{selectedCategory}</strong> matching <strong>{searchQuery}</strong></>
            ) : selectedCategory ? (
              <>Showing foods for <strong>{selectedCategory}</strong></>
            ) : (
              <>Showing search results for <strong>{searchQuery}</strong></>
            )}
          </p>
          <button type="button" className="clear-filter-btn" onClick={clearAllFilters}>
            View all foods
          </button>
        </div>
      ) : null}

      <div className="menu-grid">
        {filteredFoods.length === 0 ? (
          <p className="menu-empty">
            {selectedCategory || searchQuery
              ? `No foods found${selectedCategory ? ` for ${selectedCategory}` : ""}${searchQuery ? ` matching "${searchQuery}"` : ""}.`
              : "No food available"}
          </p>
        ) : (
          filteredFoods.map((item) => {
            const isAvailable = item.isAvailable !== false;
            const imageUrl = getFoodImageUrl(item.image);

            return (
              <div className="food-card" key={item._id}>
                <div className="food-card-media">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = menuImg;
                    }}
                  />
                  <span className={`availability-badge ${isAvailable ? "live" : "off"}`}>
                    {isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="food-card-body">
                  <div className="food-card-head">
                    <div>
                      <h3>{item.name}</h3>
                      {item.hotelName ? <p className="hotel">{item.hotelName}</p> : null}
                      {item.location ? <p className="location">{item.location}</p> : null}
                    </div>
                    <p className="price">Rs. {item.price}</p>
                  </div>

                  <p className="desc">{item.description || "Freshly prepared food item."}</p>

                  <button type="button" className="food-details-btn" onClick={() => setSelectedFood(item)}>
                    View More
                  </button>

                  <div className="food-tags">
                    <span className="tag">{item.category || "General"}</span>
                    <span className="tag">{item.calories || 0} cal</span>
                    <span className="tag">{item.protein || 0}g protein</span>
                  </div>

                  <div className="food-card-footer">
                    <p className="rating"><FaStar /> {getRatingLabel(item.rating)}</p>
                    <div className="menu-cart-actions">
                      <div className="menu-qty-control" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          onClick={() => updateFoodQuantity(item._id, getFoodQuantity(item._id) - 1)}
                          disabled={!isAvailable}
                        >
                          -
                        </button>
                        <span>{getFoodQuantity(item._id)}</span>
                        <button
                          type="button"
                          onClick={() => updateFoodQuantity(item._id, getFoodQuantity(item._id) + 1)}
                          disabled={!isAvailable}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-btn"
                        onClick={() => handleAddToCart(item._id)}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? <><FaCartPlus /> Add</> : "Unavailable"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedFood ? (
        <div className="food-details-backdrop" role="presentation" onMouseDown={() => setSelectedFood(null)}>
          <section
            className="food-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="food-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className="food-details-close" aria-label="Close food details" onClick={() => setSelectedFood(null)}>
              <FaXmark />
            </button>
            <img
              src={getFoodImageUrl(selectedFood.image)}
              alt={selectedFood.name}
              onError={(event) => {
                event.currentTarget.src = menuImg;
              }}
            />
            <div className="food-details-content">
              <div className="food-details-heading">
                <div>
                  <span>{selectedFood.category || "General"}</span>
                  <h2 id="food-details-title">{selectedFood.name}</h2>
                  <p>{selectedFood.hotelName || "Nutricart partner"}</p>
                </div>
                <strong>Rs. {selectedFood.price}</strong>
              </div>
              <p className="food-details-description">
                {selectedFood.description || "Freshly prepared food item."}
              </p>
              <div className="food-details-meta">
                <span>{selectedFood.calories || 0} calories</span>
                <span>{selectedFood.protein || 0}g protein</span>
                <span><FaStar /> {getRatingLabel(selectedFood.rating)}</span>
              </div>
              <button
                type="button"
                className="cart-btn food-details-cart"
                onClick={() => handleAddToCart(selectedFood._id)}
                disabled={selectedFood.isAvailable === false}
              >
                <FaCartPlus /> {selectedFood.isAvailable === false ? "Unavailable" : "Add to cart"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default Menu;
