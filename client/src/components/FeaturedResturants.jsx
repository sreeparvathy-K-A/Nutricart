// src/components/FeaturedRestaurants.jsx
import React from "react";
import FoodCard from "./FoodCard";

import restaurant1 from "../assets/restaurant1.jpg";
import restaurant2 from "../assets/restaurant2.jpg";
import restaurant3 from "../assets/restaurant3.jpg";

const restaurants = [
  { name: "Healthy Bites", image: restaurant1, calories: 120, rating: 4, buttonText: "View Menu" },
  { name: "Green Leaf", image: restaurant2, calories: 150, rating: 4.5, buttonText: "View Menu" },
  { name: "Fit Meals", image: restaurant3, calories: 180, rating: 3.5, buttonText: "View Menu" },
];

const FeaturedRestaurants = () => (
  <div className="section">
    <h2>Featured Healthy Restaurants</h2>
    <div className="popular-scroll">
      {restaurants.map((res, i) => (
        <FoodCard
          key={i}
          name={res.name}
          image={res.image}
          calories={res.calories}
          rating={res.rating}
          buttonText={res.buttonText}
        />
      ))}
    </div>
  </div>
);

export default FeaturedRestaurants;