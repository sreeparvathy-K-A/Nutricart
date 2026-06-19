import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiLogOut, FiMenu, FiShoppingCart, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../CSS-pages/ClientDashboard.css";

import menuImg from "../assets/images/menuimg.jpg";
import cartImg from "../assets/images/cartimg.jpg";
import ordersImg from "../assets/images/orderimg.jpg";

const API_BASE_URL = "";

function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const cards = useMemo(
    () => [
      {
        title: "Menu",
        text: "Browse healthy foods from hotels near you.",
        image: menuImg,
        icon: <FiMenu />,
        action: () => navigate("/menu"),
      },
      {
        title: "Cart",
        text: "Review selected items and continue to checkout.",
        image: cartImg,
        icon: <FiShoppingCart />,
        action: () => navigate("/cart"),
      },
      {
        title: "Orders",
        text: "View placed orders and track current order status.",
        image: ordersImg,
        icon: <FiPackage />,
        action: () => navigate("/orders"),
      },
    ],
    [navigate]
  );

  useEffect(() => {
    const data = localStorage.getItem("userInfo");

    if (!data) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(data);
      if (!parsed || parsed.role !== "client") {
        navigate("/login");
        return;
      }
      setUser(parsed);
    } catch {
      localStorage.removeItem("userInfo");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user?.id) return;

      try {
        const [cartRes, orderRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/carts/${user.id}`),
          axios.get(`${API_BASE_URL}/api/orders/user/${user.id}`),
        ]);

        setCartCount(Array.isArray(cartRes.data) ? cartRes.data.length : 0);
        setOrderCount(Array.isArray(orderRes.data) ? orderRes.data.length : 0);
      } catch (error) {
        console.log("Client dashboard fetch error:", error.response?.data || error.message);
        setCartCount(0);
        setOrderCount(0);
      }
    };

    fetchClientData();
  }, [user]);

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("user-auth-changed"));
    navigate("/login");
  };

  if (!user) return <h2 className="client-loading">Loading...</h2>;

  return (
    <div className="client-dashboard">
      <section className="client-hero">
        <div className="client-hero-copy">
          <p className="client-kicker">Client Dashboard</p>
          <h1>Hello, {user.name}</h1>
          <p className="client-hero-text">
            Explore healthy meals, manage your cart, and keep track of your orders in one place.
          </p>
        </div>

        <div className="client-hero-side">
          <div className="client-highlight-grid">
            <div className="client-highlight-card">
              <span>Cart Items</span>
              <strong>{cartCount}</strong>
            </div>
            <div className="client-highlight-card">
              <span>Total Orders</span>
              <strong>{orderCount}</strong>
            </div>
          </div>

          <button className="client-logout-btn" type="button" onClick={logout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </section>

      <section className="client-action-grid">
        {cards.map((card) => (
          <article
            className="client-action-card"
            key={card.title}
            onClick={card.action}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                card.action();
              }
            }}
          >
            <img src={card.image} alt={card.title} />
            <div className="client-action-body">
              <div className="client-action-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default ClientDashboard;
