import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OwnerSidebar from "../components/OwnerSidebar";
import "../CSS-pages/OwnerDashboard.css";

const API_BASE_URL = "http://localhost:5000";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch {
      return {};
    }
  }, []);

  const ownerName = storedUser?.name || "Owner";
  const ownerId = storedUser?.id || "";
  const ownerEmail = storedUser?.email || "owner@nutricart.com";

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");

    if (!stored) {
      navigate("/restaurant/login");
      return;
    }

    try {
      const user = JSON.parse(stored);

      if (!user || user.role !== "owner") {
        navigate("/restaurant/login");
      }
    } catch (err) {
      console.error("Error parsing user:", err);
      localStorage.removeItem("userInfo");
      navigate("/restaurant/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOwnerFoods = async () => {
      if (!ownerName || ownerName === "Owner") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
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
        setFoods([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnerFoods();
  }, [ownerEmail, ownerId, ownerName]);

  const totalFoods = foods.length;
  const totalCategories = new Set(
    foods.map((food) => (food.category || "Uncategorized").trim()).filter(Boolean)
  ).size;
  const avgProtein =
    totalFoods > 0
      ? Math.round(
          foods.reduce((sum, food) => sum + Number(food.protein || 0), 0) / totalFoods
        )
      : 0;

  const stats = [
    { label: "Foods", value: isLoading ? "..." : totalFoods },
    { label: "Categories", value: isLoading ? "..." : totalCategories },
    { label: "Avg Protein", value: isLoading ? "..." : `${avgProtein}g` },
  ];

  const recentFoods = foods.slice(0, 4);
  const latestFood = foods[0]?.name || "No food added yet";

  return (
    <div className="owner-dashboard">
      <OwnerSidebar />

      <main className="owner-main">
        <section className="owner-hero">
          <div className="hero-copy hero-copy-main">
            <div>
              <p className="hero-kicker">Welcome Dashboard</p>
              <h1>Hello, {ownerName}</h1>
              <p className="hero-text">
                Keep your healthy menu clean, updated, and ready for customers.
              </p>
            </div>

            <div className="hero-highlight-row">
              <div className="hero-highlight-card">
                <span>Latest Item</span>
                <strong>{latestFood}</strong>
              </div>
              <div className="hero-highlight-card">
                <span>Menu Status</span>
                <strong>{totalFoods > 0 ? "Active" : "Needs Items"}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="owner-stats">
          {stats.map((item) => (
            <article className="stat-card" key={item.label}>
              <span className="stat-label">{item.label}</span>
              <h3>{item.value}</h3>
            </article>
          ))}
        </section>

        <section className="owner-grid owner-grid-single">
          <div className="dashboard-panel recent-menu-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Recent Foods</p>
                <h2>Recently Added Menu Items</h2>
              </div>
            </div>

            {recentFoods.length === 0 ? (
              <div className="empty-inline">No foods added yet.</div>
            ) : (
              <div className="food-list">
                {recentFoods.map((food) => (
                  <div className="food-row" key={food._id}>
                    <div>
                      <strong>{food.name}</strong>
                      <span>{food.category || "Uncategorized"}</span>
                    </div>
                    <b>Rs. {food.price}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default OwnerDashboard;
