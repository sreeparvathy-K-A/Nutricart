import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../CSS-pages/Orders.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

const DELIVERY_STEPS = [
  { key: "confirmed", label: "Order confirmed", detail: "Your order was sent to the kitchen." },
  { key: "assigned", label: "Delivery assigned", detail: "A delivery partner is being arranged." },
  { key: "collected", label: "Order collected", detail: "Your meal has been collected from the kitchen." },
  { key: "delivered", label: "Delivered", detail: "Your meal has arrived." },
];

const getStepIndex = (status) => {
  const value = String(status || "Pending").toLowerCase();
  if (value === "delivered") return 3;
  if (["collected", "out for delivery"].includes(value)) return 2;
  if (["assigned", "accepted"].includes(value)) return 1;
  return 0;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null");
    } catch {
      return null;
    }
  }, []);

  const getStatusClass = (status) =>
    `status-${String(status || "pending")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;

  useEffect(() => {
    if (!storedUser || storedUser.role !== "client") {
      navigate("/login");
      return;
    }

    let active = true;
    const fetchOrders = async (showLoading = false) => {
      try {
        if (showLoading) setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/orders/user/${storedUser.id}`);
        if (active) setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log("Fetch orders error:", error.response?.data || error.message);
        if (active && showLoading) setOrders([]);
      } finally {
        if (active && showLoading) setIsLoading(false);
      }
    };

    fetchOrders(true);
    const refreshTimer = window.setInterval(() => fetchOrders(false), 30000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [navigate, storedUser]);

  if (!storedUser || storedUser.role !== "client") {
    return null;
  }

  return (
    <div className="orders-page">
      <div className="orders-shell">
        <div className="orders-topbar">
          <button type="button" className="orders-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <section className="orders-hero">
          <p className="orders-kicker">My Orders</p>
          <h1>Your placed food orders</h1>
          <p>Track healthy meals you already ordered and check their current status.</p>
        </section>

        {location.state?.confirmedOrderId ? (
          <div className="order-confirmed-banner" role="status">
            <strong>Order confirmed!</strong>
            <span>We are preparing your meal. Estimated delivery is about 30 minutes.</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="orders-empty">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <h2>No orders yet</h2>
            <p>Place your first order from the menu to see it here.</p>
            <button type="button" className="orders-primary-btn" onClick={() => navigate("/menu")}>
              Browse Menu
            </button>
          </div>
        ) : (
          <section className="orders-list">
            {orders.map((order) => {
              const activeStep = getStepIndex(order.status);
              const estimatedDelivery = new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000);
              return (
              <article className={`order-card ${location.state?.confirmedOrderId === order._id ? "new-order" : ""}`} key={order._id}>
                <div className="order-card-head">
                  <div>
                    <p className="order-id">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <h3>{order.items?.length || 0} item(s)</h3>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="delivery-tracker" aria-label="Delivery progress">
                  <div className="delivery-estimate">
                    <span>{activeStep === 3 ? "Delivered on" : "Estimated delivery"}</span>
                    <strong>{activeStep === 3 ? formatDateTime(order.deliveredAt || order.updatedAt) : formatDateTime(estimatedDelivery)}</strong>
                    <span className="ordered-time">Ordered on</span>
                    <strong className="ordered-time-value">{formatDateTime(order.createdAt)}</strong>
                  </div>
                  <ol className="delivery-steps">
                    {DELIVERY_STEPS.map((step, index) => (
                      <li className={index <= activeStep ? "complete" : ""} key={step.key}>
                        <span className="step-dot">{index < activeStep ? "✓" : index + 1}</span>
                        <div><strong>{step.label}</strong><small>{step.detail}</small></div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="order-items">
                  {(order.items || []).map((item, index) => (
                    <div className="order-item-row" key={`${order._id}-${index}`}>
                      <div>
                        <strong>{item.foodId?.name || "Food item"}</strong>
                        <span>
                          Qty {item.quantity} {item.foodId?.hotelName ? `| ${item.foodId.hotelName}` : ""}
                        </span>
                      </div>
                      <b>Rs. {Number(item.foodId?.price || 0) * Number(item.quantity || 0)}</b>
                    </div>
                  ))}
                </div>

                <div className="order-summary-row">
                  <span>Delivery Address</span>
                  <strong>{order.address || "Address not saved"}</strong>
                </div>
                {order.preparationInstructions ? (
                  <div className="order-summary-row">
                    <span>Preparation note</span>
                    <strong>{order.preparationInstructions}</strong>
                  </div>
                ) : null}
                <div className="order-summary-row">
                  <span>Restaurant preparation</span>
                  <strong>{order.restaurantStatus || "Pending"}</strong>
                </div>
                {order.restaurantStatus === "Ready for Pickup" ? (
                  <div className="client-ready-notice">Your food is ready. The delivery partner has been informed for pickup.</div>
                ) : null}
                <div className="order-summary-row">
                  <span>Delivery Partner</span>
                  <strong>
                    {order.deliveryBoyId?.name || order.deliveryBoyName || "Waiting for assignment"}
                  </strong>
                </div>
                <div className="order-summary-row total">
                  <span>Total Amount</span>
                  <strong>Rs. {order.totalAmount || 0}</strong>
                </div>
              </article>
            );})}
          </section>
        )}
      </div>
    </div>
  );
}

export default Orders;
