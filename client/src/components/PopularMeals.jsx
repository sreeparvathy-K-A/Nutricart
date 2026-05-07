import React from "react";
import "./App.css"; // use same CSS for simplicity

const meals = [
  { name: "Vegan Salad", calories: 120, image: "vegan-salad.jpg" },
  { name: "Protein Smoothie", calories: 250, image: "protein-smoothie.jpg" },
  { name: "Quinoa Bowl", calories: 180, image: "quinoa-bowl.jpg" },
];

const PopularMeals = () => (
  <div className="section">
    <h2>Popular Healthy Meals</h2>
    <div className="grid">
      {meals.map((meal, i) => (
        <div className="card" key={i}>
          <img src={meal.image} alt={meal.name} />
          <div className="card-content">
            <h4>{meal.name}</h4>
            <p>{meal.calories} kcal</p>
            <button>Add to Cart</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PopularMeals;