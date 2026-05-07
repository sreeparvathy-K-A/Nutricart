// src/data/foodData.js
import veganSalad from "../assets/images/chickenbowl.jpg";
import proteinSmoothie from "../assets/images/protein-smoothie.jpg";
import lowCalorieSoup from "../assets/images/low-caloriesoup.jpg";
import quinoaBowl from "../assets/images/veg sald.jpg";
import grilledTofu from "../assets/images/grilled.jpg";

export const foodData = [
  { id: 1, name: "Vegan Salad", category: "Vegan", calories: 120, image: veganSalad },
  { id: 2, name: "Protein Smoothie", category: "Muscle Gain", calories: 250, image: proteinSmoothie },
  { id: 3, name: "Low-Calorie Soup", category: "Weight Loss", calories: 90, image: lowCalorieSoup },
  { id: 4, name: "Quinoa Bowl", category: "Balanced Diet", calories: 180, image: quinoaBowl },
  { id: 5, name: "Grilled Tofu", category: "Vegan", calories: 200, image: grilledTofu }
];