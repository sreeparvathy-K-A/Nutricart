import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaStore, FaUserCircle, FaUtensils } from "react-icons/fa";
import OwnerSidebar from "../components/OwnerSidebar";
import "../CSS-pages/OwnerDashboard.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch {
      return {};
    }
  }, []);

  const ownerName = storedUser?.name || "Owner";
  const ownerId = storedUser?.id || "";
  const ownerEmail = storedUser?.email || "";
  const businessName = storedUser?.hotel || storedUser?.businessName || ownerName;

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
      if (!ownerName || ownerName === "Owner") return;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/foods/owner/${encodeURIComponent(ownerName)}`,
          {
            params: {
              ownerId,
              ownerEmail,
            },
          }
        );
        setFoods(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.log(err.response?.data || err.message);
        setFoods([]);
      }
    };

    fetchOwnerFoods();
  }, [ownerEmail, ownerId, ownerName]);

  const actions = [
    {
      title: "Add Food",
      text: "Create a new menu item with image, price, category, calories, and protein.",
      path: "/owner/add-food",
      icon: FaPlusCircle,
    },
    {
      title: "My Foods",
      text: "View, update, replace images, or remove existing menu items.",
      path: "/owner/my-foods",
      icon: FaUtensils,
    },
    {
      title: "Profile",
      text: "Check your restaurant account details used across the platform.",
      path: "/owner/profile",
      icon: FaUserCircle,
    },
  ];

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
                Manage your restaurant menu and account from one simple owner panel.
              </p>
            </div>
          </div>
        </section>

        <section className="owner-account-strip">
          <div>
            <FaStore />
            <span>Restaurant</span>
            <strong>{businessName}</strong>
          </div>
          <div>
            <FaUserCircle />
            <span>Owner Email</span>
            <strong>{ownerEmail || "Not available"}</strong>
          </div>
        </section>

        <section className="owner-latest-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Latest Item</p>
              <h2>Recently Added Foods</h2>
            </div>
          </div>

          {foods.length === 0 ? (
            <div className="empty-inline">No food added yet.</div>
          ) : (
            <div className="owner-latest-list">
              {foods.slice(0, 4).map((food) => (
                <div className="owner-latest-row" key={food._id}>
                  <strong>{food.name}</strong>
                  <span>Rs. {food.price}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="owner-action-grid">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                type="button"
                className="owner-action-card"
                key={action.title}
                onClick={() => navigate(action.path)}
              >
                <Icon />
                <span>{action.title}</span>
                <p>{action.text}</p>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export default OwnerDashboard;
