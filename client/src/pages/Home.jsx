import React from "react";
import { useNavigate } from "react-router-dom";
import "../CSS-pages/Home.css";
import heroImg from "../assets/images/background.jpg";

function Home() {
  const navigate = useNavigate();

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

  const steps = [
    {
      title: "Browse healthy choices",
      text: "Open the menu and filter meals by the style you want.",
    },
    {
      title: "Add real menu items",
      text: "Choose food from registered partners and add it to your cart.",
    },
    {
      title: "Order with confidence",
      text: "Checkout, track your order, and keep your healthy routine simple.",
    },
  ];

  const handleCategoryClick = (category) => {
    navigate(`/menu?search=${encodeURIComponent(category.searchTerm || category.name)}`);
  };

  return (
    <div className="home-page">
      <section className="home-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="home-shell hero-shell">
          <div className="hero-copy">
            <p className="hero-tag">Healthy food ordering</p>
            <h1>Nutricart makes healthy food feel fresh, easy, and worth choosing</h1>
            <p className="hero-subtext">
              Discover bowls, smoothies, salads, and balanced meals designed to
              attract customers with clean presentation and feel-good food.
            </p>
            <div className="hero-actions">
              <button type="button" onClick={() => navigate("/menu")}>
                Explore Menu
              </button>
              <button type="button" className="hero-secondary" onClick={() => navigate("/restaurant/register-request")}>
                Register Business
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-shell category-card-section">
        <div className="category-section-head">
          <p className="section-kicker">Browse Categories</p>
          <h2>Choose the food style customers want to see first</h2>
        </div>

        <div className="category-card-grid">
          {categories.map((category) => (
            <article
              className="category-home-card"
              key={category.name}
              onClick={() => handleCategoryClick(category)}
            >
              <span>{category.name}</span>
              <p>{category.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-shell intro-strip">
        <div className="intro-left">
          <p className="section-kicker">Simple Flow</p>
          <h2>Healthy ordering without confusing preview items</h2>
        </div>
        <p className="intro-right">
          Home now guides customers into the real menu, where every food card can be opened,
          added to cart, and ordered properly.
        </p>
      </section>

      <section className="home-shell home-flow-section">
        {steps.map((step, index) => (
          <article className="home-flow-card" key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
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
            Open Menu
          </button>
        </div>
      </section>

      <section className="home-shell taste-section">
        <div className="taste-block">
          <p className="section-kicker">Why Nutricart</p>
          <h2>Healthy food ordering that feels modern and inviting</h2>
          <p className="taste-copy">
            Built to attract customers with a clean green brand, healthier meal
            choices, and a simpler way to discover what to eat.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
