import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaBowlFood, FaMagnifyingGlass, FaStar } from "react-icons/fa6";
import "../CSS-pages/ResturantDetails.css";
import menuImg from "../assets/images/menuimg.jpg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

const getImageUrl = (imagePath) => {
  if (!imagePath) return menuImg;
  const normalizedImage = String(imagePath).replace(/\\/g, "/");
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

const getRestaurantKey = (food) =>
  food.ownerId || food.ownerEmail || food.hotelName || "NutriCart Partner";

function ResturantDetails() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/foods/list`);
        const foodData = response.data?.foods || response.data || [];
        setFoods(Array.isArray(foodData) ? foodData : []);
      } catch (error) {
        console.log("Error loading restaurants:", error.response?.data || error.message);
        setFoods([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoods();
  }, []);

  const restaurants = useMemo(() => {
    const restaurantMap = new Map();

    foods.forEach((food) => {
      const key = getRestaurantKey(food);
      const existing = restaurantMap.get(key);
      const imageUrl = getImageUrl(food.image);
      const rating = Number(food.rating || 0);

      if (!existing) {
        restaurantMap.set(key, {
          key,
          name: food.hotelName || "NutriCart Partner",
          location: food.location || "Location not added",
          image: imageUrl,
          rating,
          categories: new Set(food.category ? [food.category] : []),
          foods: [food],
          prices: [Number(food.price || 0)].filter(Boolean),
        });
        return;
      }

      existing.foods.push(food);
      if (!existing.image && imageUrl) existing.image = imageUrl;
      if (rating > existing.rating) existing.rating = rating;
      if (food.category) existing.categories.add(food.category);
      if (Number(food.price || 0)) existing.prices.push(Number(food.price));
    });

    return Array.from(restaurantMap.values()).map((restaurant) => {
      const prices = restaurant.prices;
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const newestFood = restaurant.foods[0];

      return {
        ...restaurant,
        minPrice,
        categories: Array.from(restaurant.categories).slice(0, 4),
        newestFood,
      };
    });
  }, [foods]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return restaurants;

    return restaurants.filter((restaurant) => {
      const categoryText = restaurant.categories.join(" ").toLowerCase();
      const foodText = restaurant.foods.map((food) => food.name).join(" ").toLowerCase();

      return (
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.location.toLowerCase().includes(query) ||
        categoryText.includes(query) ||
        foodText.includes(query)
      );
    });
  }, [restaurants, search]);

  const openRestaurantMenu = (restaurant) => {
    navigate(`/menu?search=${encodeURIComponent(restaurant.name)}`);
  };

  return (
    <main className="restaurants-page">
      <section className="restaurants-hero">
        <div className="restaurants-hero-copy">
          <div className="restaurants-search">
            <FaMagnifyingGlass />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search restaurants, foods, or categories"
            />
          </div>
        </div>
      </section>

      <section className="restaurants-list-section">
        <div className="restaurants-section-head">
          <div>
            <p className="restaurants-kicker">Available now</p>
            <h2>Restaurant partners</h2>
          </div>
          <span>{filteredRestaurants.length} shown</span>
        </div>

        {isLoading ? (
          <div className="restaurants-empty">Loading restaurants...</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="restaurants-empty">
            No restaurants found. Try another search or explore the full menu.
          </div>
        ) : (
          <div className="restaurants-grid">
            {filteredRestaurants.map((restaurant) => (
              <article className="restaurant-card" key={restaurant.key}>
                <div className="restaurant-card-image">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      onError={(e) => {
                        e.currentTarget.src = menuImg;
                      }}
                    />
                  ) : (
                    <div className="restaurant-image-fallback">
                      <FaBowlFood />
                    </div>
                  )}
                  <span>
                    <FaStar /> {restaurant.rating ? restaurant.rating.toFixed(1) : "New"}
                  </span>
                </div>

                <div className="restaurant-card-body">
                  <div className="restaurant-card-title">
                    <div>
                      <h3>{restaurant.name}</h3>
                    </div>
                  </div>

                  {restaurant.newestFood ? (
                    <div className="restaurant-food-preview single-food-preview">
                      <p>
                        <span>{restaurant.newestFood.name}</span>
                        <strong>Rs. {restaurant.newestFood.price}</strong>
                      </p>
                    </div>
                  ) : null}

                  <div className="restaurant-card-footer">
                    <button type="button" onClick={() => openRestaurantMenu(restaurant)}>
                      View menu <FaArrowRight />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ResturantDetails;
