import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OwnerSidebar from "../components/OwnerSidebar";
import "../CSS-pages/OwnerDashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const RESTAURANT_ACTIONS = {
  Pending: { label: "Accept Order", next: "Accepted" },
  Accepted: { label: "Start Preparing", next: "Preparing" },
  Preparing: { label: "Ready for Pickup", next: "Ready for Pickup" },
};

function OwnerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState("");
  const owner = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("userInfo") || "{}"); } catch { return {}; }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/owner`, {
        params: {
          ownerId: owner.id,
          ownerEmail: owner.email,
          ownerName: owner.hotel || owner.businessName || owner.name,
        },
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Owner orders error:", error.response?.data || error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    if (owner.role !== "owner") { navigate("/restaurant/login"); return undefined; }
    fetchOrders();
    const timer = window.setInterval(fetchOrders, 30000);
    return () => window.clearInterval(timer);
  }, [fetchOrders, navigate, owner.role]);

  const updateRestaurantOrder = async (order) => {
    const action = RESTAURANT_ACTIONS[order.restaurantStatus || "Pending"];
    if (!action) return;
    try {
      setUpdatingOrder(order._id);
      await axios.put(`${API_BASE_URL}/api/orders/restaurant-status`, {
        orderId: order._id,
        restaurantStatus: action.next,
      });
      setOrders((prev) => prev.map((item) => item._id === order._id
        ? { ...item, restaurantStatus: action.next }
        : item));
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update order");
    } finally {
      setUpdatingOrder("");
    }
  };

  return <div className="owner-dashboard">
    <OwnerSidebar />
    <main className="owner-main">
      <section className="owner-hero"><div className="hero-copy hero-copy-main"><div><p className="hero-kicker">Restaurant Orders</p><h1>Client order details</h1><p className="hero-text">Accept orders, update food preparation, and follow delivery progress.</p></div></div></section>
      <section className="owner-orders-panel standalone">
        <div className="panel-heading"><div><p className="panel-kicker">Orders</p><h2>Order management</h2></div><span>{orders.length} orders</span></div>
        {loading ? <div className="empty-inline">Loading orders...</div> : orders.length === 0 ? <div className="empty-inline">No client orders yet.</div> : <div className="owner-table-scroll"><table className="owner-orders-table">
          <thead><tr><th>Order</th><th>Client Details</th><th>Food Items</th><th>Total</th><th>Preparation</th><th>Delivery Details</th><th>Action</th></tr></thead>
          <tbody>{orders.map((order) => {
            const restaurantStatus = order.restaurantStatus || "Pending";
            const action = RESTAURANT_ACTIONS[restaurantStatus];
            return <tr key={order._id}>
              <td><strong>#{order._id.slice(-6).toUpperCase()}</strong><small>{new Date(order.createdAt).toLocaleString()}</small></td>
              <td><strong>{order.clientName || "Client"}</strong><small>{order.clientPhone || "No phone"}</small><small>{order.address || "No address"}</small></td>
              <td>{order.items.map((item) => <span className="owner-table-item" key={item._id}>{item.foodId?.name || "Food"} × {item.quantity}</span>)}</td>
              <td><strong>Rs. {order.ownerTotalAmount || 0}</strong></td>
              <td><span className="owner-table-status preparation">{restaurantStatus}</span></td>
              <td><span className="owner-table-status">{order.status}</span><small>{order.deliveryBoyId?.name || order.deliveryBoyName || "Not assigned"}</small><small>{order.deliveryBoyId?.phone || ""}</small></td>
              <td>{action ? <button type="button" className="owner-table-action" disabled={updatingOrder === order._id} onClick={() => updateRestaurantOrder(order)}>{updatingOrder === order._id ? "Updating..." : action.label}</button> : <span className="owner-ready-label">Ready for pickup</span>}</td>
            </tr>;
          })}</tbody>
        </table></div>}
      </section>
    </main>
  </div>;
}

export default OwnerOrders;
