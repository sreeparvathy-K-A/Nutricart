import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaBowlFood, FaCartShopping, FaLeaf, FaMagnifyingGlass, FaStore } from "react-icons/fa6";
import "../CSS-pages/Home.css";
import heroImg from "../assets/images/background.jpg";

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const categories = [
    {
      name: "Bowls",
      searchTerm: "bowl",
      note: "Balanced meals with grains, greens, and protein.",
    },
    {
      name: "Smoothies",
      searchTerm: "smoothie",
      note: "Fresh blended drinks for energy and recovery.",
    },
    {
      name: "Salads",
      searchTerm: "salad",
      note: "Light and colorful choices with crisp ingredients.",
    },
    {
      name: "Vegan",
      searchTerm: "vegan",
      note: "Plant-based dishes packed with flavor and nutrition.",
    },
    {
      name: "High Protein",
      searchTerm: "protein",
      note: "Stronger meal picks for fitness-focused customers.",
    },
  ];

  const handleCategoryClick = (category) => {
    navigate(`/menu?category=${encodeURIComponent(category.searchTerm || category.name)}`);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/menu?search=${encodeURIComponent(query)}` : "/menu");
  };

  return (
    <div className="home-page">
      <section className="home-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="home-shell hero-shell">
          <div className="hero-copy">
            <p className="hero-tag">Healthy food delivery</p>
            <h1>Order balanced, nutritious meals from trusted local restaurants in just a few clicks.</h1>
            <p className="hero-subtext">
              Search fresh bowls, smoothies, salads, and protein-rich meals from
              NutriCart restaurant partners.
            </p>
            <form className="home-search" onSubmit={handleSearch}>
              <FaMagnifyingGlass />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search salad, bowl, smoothie..."
              />
              <button type="submit">Search</button>
            </form>
            <div className="hero-actions">
              <button type="button" onClick={() => navigate("/menu")}>
                <FaBowlFood /> Explore Menu
              </button>
             
            </div>
          </div>
        </div>
      </section>

      <section className="home-shell category-card-section">
        <div className="category-section-head">
          <p className="section-kicker">Browse Categories</p>
          <h2>Start with the food style you want today</h2>
        </div>

        <div className="category-card-grid">
          {categories.map((category) => (
            <button
              type="button"
              className="category-home-card"
              key={category.name}
              onClick={() => handleCategoryClick(category)}
            >
              <span><FaLeaf /> {category.name}</span>
              <p>{category.note}</p>
              <strong>View meals <FaArrowRight /></strong>
            </button>
          ))}
        </div>
      </section>

      <section className="home-shell home-flow-section">
        <div className="home-flow-card">
          <FaStore />
          <h3>Restaurants add food</h3>
          <p>Owners upload menu items with real photos, prices, calories, protein, and location.</p>
        </div>
        <div className="home-flow-card">
          <FaBowlFood />
          <h3>Customers browse meals</h3>
          <p>Menu and restaurant pages show live items directly from the backend.</p>
        </div>
        <div className="home-flow-card">
          <FaCartShopping />
          <h3>Orders move to cart</h3>
          <p>Customers choose quantity, add items, and continue to checkout without noise.</p>
        </div>
      </section>

      <section className="home-shell home-cta-section">
        <div className="home-cta-block">
          <div>
            <p className="section-kicker">Ready to Order</p>
            <h2>Go straight to meals that can be added to cart</h2>
            <p>
              The menu page shows live food items from the system, so customers can
              browse, choose, and complete the order from one place.
            </p>
          </div>
          <button type="button" onClick={() => navigate("/menu")}>
            Open Menu <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
