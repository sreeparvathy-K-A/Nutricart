import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaUtensils } from "react-icons/fa";
import OwnerSidebar from "../components/OwnerSidebar";
import "../CSS-pages/OwnerDashboard.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);

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

  useEffect(() => {
    if (!ownerId && !ownerEmail) return undefined;
    let active = true;
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/orders/owner`, {
          params: { ownerId, ownerEmail, ownerName: businessName },
        });
        if (active) setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log("Owner orders error:", error.response?.data || error.message);
        if (active) setOrders([]);
      }
    };
    fetchOrders();
    const timer = window.setInterval(fetchOrders, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [businessName, ownerEmail, ownerId]);

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

        <section className="owner-count-grid">
          <div><FaUtensils /><span>Total Foods</span><strong>{foods.length}</strong></div>
          <div><FaClipboardList /><span>Total Orders</span><strong>{orders.length}</strong></div>
        </section>

      </main>
    </div>
  );
}

export default OwnerDashboard;
