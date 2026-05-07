// src/components/FoodCard.jsx
import React from "react";

const FoodCard = ({ image, name, calories }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 text-center">
      <img src={image} alt={name} className="w-full h-40 object-cover rounded-md" />
      <h3 className="mt-3 font-bold text-lg">{name}</h3>
      <p className="text-gray-500">{calories} kcal</p>
      <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        Add to Cart
      </button>
    </div>
  );
};

export default FoodCard;