import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../CSS-pages/Orders.css";

const API_BASE_URL = "http://localhost:5000";

function Orders() {
  const navigate = useNavigate();
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

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/orders/user/${storedUser.id}`);
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log("Fetch orders error:", error.response?.data || error.message);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
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
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card-head">
                  <div>
                    <p className="order-id">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <h3>{order.items?.length || 0} item(s)</h3>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status || "Pending"}
                  </span>
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
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default Orders;
