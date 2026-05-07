import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../CSS-pages/DeliveryDashboard.css";

const API_BASE_URL = "http://localhost:5000";

const initialProfile = {
  name: "",
  phone: "",
  address: "",
  vehicleType: "Bike",
  vehicleNumber: "",
  licenseNumber: "",
  availability: "available",
};

function DeliveryDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState("assigned");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null");
    } catch {
      return null;
    }
  }, []);

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/delivery/${user.id}`);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Delivery orders error:", error.response?.data || error.message);
      setOrders([]);
    }
  };

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/delivery/profile/${user.id}`);
      const data = response.data || {};
      setProfile({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        vehicleType: data.vehicleType || "Bike",
        vehicleNumber: data.vehicleNumber || "",
        licenseNumber: data.licenseNumber || "",
        availability: data.availability || "available",
      });
    } catch (error) {
      console.log("Delivery profile error:", error.response?.data || error.message);
    }
  };

  const refreshDashboard = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchProfile()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "delivery") {
      navigate("/login");
      return;
    }

    refreshDashboard();
  }, [navigate]);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/status`, { orderId, status });
      fetchOrders();
    } catch (error) {
      console.log("Delivery status update error:", error.response?.data || error.message);
      alert("Unable to update order status");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const response = await axios.put(`${API_BASE_URL}/api/delivery/profile/${user.id}`, profile);
      const updated = response.data?.deliveryBoy;

      if (updated) {
        setProfile({
          name: updated.name || "",
          phone: updated.phone || "",
          address: updated.address || "",
          vehicleType: updated.vehicleType || "Bike",
          vehicleNumber: updated.vehicleNumber || "",
          licenseNumber: updated.licenseNumber || "",
          availability: updated.availability || "available",
        });

        const nextUser = {
          ...user,
          name: updated.name || user.name,
          phone: updated.phone || user.phone,
          address: updated.address || user.address,
        };
        localStorage.setItem("userInfo", JSON.stringify(nextUser));
      }

      alert("Profile updated");
    } catch (error) {
      console.log("Save delivery profile error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changeAvailability = async (availability) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/delivery/availability/${user.id}`, {
        availability,
      });
      const updated = response.data?.deliveryBoy;
      setProfile((prev) => ({
        ...prev,
        availability: updated?.availability || availability,
      }));
    } catch (error) {
      console.log("Availability update error:", error.response?.data || error.message);
      alert("Unable to update availability");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user || user.role !== "delivery") {
    return null;
  }

  const activeOrders = orders.filter(
    (order) => !["Delivered", "Cancelled"].includes(String(order.status || ""))
  );
  const historyOrders = orders.filter((order) =>
    ["Delivered", "Cancelled"].includes(String(order.status || ""))
  );

  const renderOrderCard = (order, showActions) => (
    <article className="delivery-order-card" key={order._id}>
      <div className="delivery-order-head">
        <div>
          <p className="delivery-order-id">Order #{order._id.slice(-6).toUpperCase()}</p>
          <h3>{order.items?.length || 0} item(s)</h3>
        </div>
        <span className="delivery-order-status">{order.status}</span>
      </div>

      <div className="delivery-order-items">
        {(order.items || []).map((item, index) => (
          <div key={`${order._id}-${index}`} className="delivery-item-row">
            <div>
              <strong>{item.foodId?.name || "Food item"}</strong>
              <span>
                Qty {item.quantity}
                {item.foodId?.hotelName ? ` | ${item.foodId.hotelName}` : ""}
              </span>
            </div>
            <b>Rs. {Number(item.foodId?.price || 0) * Number(item.quantity || 0)}</b>
          </div>
        ))}
      </div>

      <p className="delivery-address">
        <b>Delivery Address:</b> {order.address || "Address not provided"}
      </p>
      <div className="delivery-client-box">
        <p><b>Client:</b> {order.clientName || "Client details unavailable"}</p>
        <p><b>Phone:</b> {order.clientPhone || "Phone not available"}</p>
      </div>

      {showActions ? (
        <div className="delivery-status-actions">
          <button type="button" onClick={() => updateStatus(order._id, "Accepted")}>
            Accept
          </button>
          <button type="button" onClick={() => updateStatus(order._id, "Out for Delivery")}>
            Out for Delivery
          </button>
          <button type="button" onClick={() => updateStatus(order._id, "Delivered")}>
            Delivered
          </button>
        </div>
      ) : null}
    </article>
  );

  return (
    <div className="delivery-dashboard-page">
      <div className="delivery-dashboard-shell">
        <section className="delivery-dashboard-hero">
          <div>
            <p className="delivery-kicker">Delivery Dashboard</p>
            <h1>Hello, {profile.name || user.name}</h1>
            <p>Manage assigned orders, review delivery history, and keep your profile updated.</p>
          </div>

          <div className="delivery-hero-side">
            <span className={`delivery-availability-pill ${profile.availability}`}>
              {profile.availability}
            </span>
            <button type="button" className="delivery-logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </section>

        <section className="delivery-summary-grid">
          <div className="delivery-summary-card">
            <span>Assigned Orders</span>
            <strong>{activeOrders.length}</strong>
          </div>
          <div className="delivery-summary-card">
            <span>Completed</span>
            <strong>{historyOrders.length}</strong>
          </div>
          <div className="delivery-summary-card">
            <span>Name</span>
            <strong>{profile.name || user.name || "Not added"}</strong>
          </div>
          <div className="delivery-summary-card">
            <span>Phone</span>
            <strong>{profile.phone || "Not added"}</strong>
          </div>
        </section>

        <section className="delivery-tabbar">
          <button
            type="button"
            className={activeTab === "assigned" ? "active" : ""}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned
          </button>
          <button
            type="button"
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
          <button
            type="button"
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
        </section>

        {loading ? (
          <div className="delivery-empty">Loading delivery dashboard...</div>
        ) : activeTab === "assigned" ? (
          activeOrders.length === 0 ? (
            <div className="delivery-empty">
              <h2>No assigned orders</h2>
              <p>Orders assigned by admin will appear here.</p>
            </div>
          ) : (
            <section className="delivery-orders-list">
              {activeOrders.map((order) => renderOrderCard(order, true))}
            </section>
          )
        ) : activeTab === "history" ? (
          historyOrders.length === 0 ? (
            <div className="delivery-empty">
              <h2>No delivery history yet</h2>
              <p>Delivered or cancelled orders will appear here.</p>
            </div>
          ) : (
            <section className="delivery-orders-list">
              {historyOrders.map((order) => renderOrderCard(order, false))}
            </section>
          )
        ) : (
          <section className="delivery-profile-card">
            <div className="delivery-profile-head">
              <div>
                <p className="delivery-kicker">My Profile</p>
                <h2>Delivery details</h2>
              </div>
            </div>

            <div className="delivery-profile-grid">
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Full name"
              />
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="Phone number"
              />
              <input
                name="address"
                value={profile.address}
                onChange={handleProfileChange}
                placeholder="Address"
              />
            </div>

            <div className="delivery-availability-block">
              <span>Availability</span>
              <div className="delivery-availability-actions">
                <button type="button" onClick={() => changeAvailability("available")}>
                  Available
                </button>
                <button type="button" onClick={() => changeAvailability("busy")}>
                  Busy
                </button>
                <button type="button" onClick={() => changeAvailability("offline")}>
                  Offline
                </button>
              </div>
            </div>

            <button
              type="button"
              className="delivery-save-btn"
              onClick={saveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default DeliveryDashboard;
