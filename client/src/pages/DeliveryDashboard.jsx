import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiBox, FiCheckCircle, FiClock, FiHome, FiMapPin, FiTruck, FiUser } from "react-icons/fi";
import "../CSS-pages/DeliveryDashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  vehicleType: "Bike",
  vehicleNumber: "",
  licenseNumber: "",
  availability: "available",
  photo: "",
};

const DELIVERY_ACTIONS = [
  { label: "Food Collected", status: "Collected" },
  { label: "Out for Delivery", status: "Out for Delivery" },
  { label: "Delivered", status: "Delivered" },
];

function DeliveryDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null");
    } catch {
      return null;
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/delivery/${user.id}`);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Delivery orders error:", error.response?.data || error.message);
      setOrders([]);
    }
  }, [user?.id]);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/delivery/profile/${user.id}`);
      const data = response.data || {};
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        vehicleType: data.vehicleType || "Bike",
        vehicleNumber: data.vehicleNumber || "",
        licenseNumber: data.licenseNumber || "",
        availability: data.availability || "available",
        photo: data.photo || "",
      });
    } catch (error) {
      console.log("Delivery profile error:", error.response?.data || error.message);
    }
  }, [user?.id]);

  const refreshDashboard = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchProfile()]);
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, fetchProfile, user?.id]);

  useEffect(() => {
    if (!user || user.role !== "delivery") {
      navigate("/delivery/login");
      return;
    }

    refreshDashboard();
    const refreshTimer = window.setInterval(fetchOrders, 15000);
    return () => window.clearInterval(refreshTimer);
  }, [fetchOrders, navigate, refreshDashboard, user]);

  useEffect(() => {
    if (!selectedOrder) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedOrder(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedOrder]);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await axios.put(`${API_BASE_URL}/api/orders/status`, { orderId, status });
      setOrders((prev) => prev.map((order) => (
        order._id === orderId ? { ...order, status } : order
      )));
      setSelectedOrder((prev) => (
        prev?._id === orderId ? { ...prev, status } : prev
      ));
      await fetchOrders();
    } catch (error) {
      console.log("Delivery status update error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Unable to update order status");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const formData = new FormData();
      ["name", "phone", "address", "vehicleType", "vehicleNumber", "licenseNumber", "availability"].forEach((field) => {
        formData.append(field, profile[field] || "");
      });
      if (profilePhotoFile) formData.append("photo", profilePhotoFile);
      const response = await axios.put(`${API_BASE_URL}/api/delivery/profile/${user.id}`, formData);
      const updated = response.data?.deliveryBoy;

      if (updated) {
        setProfile({
          name: updated.name || "",
          email: updated.email || profile.email || "",
          phone: updated.phone || "",
          address: updated.address || "",
          vehicleType: updated.vehicleType || "Bike",
          vehicleNumber: updated.vehicleNumber || "",
          licenseNumber: updated.licenseNumber || "",
          availability: updated.availability || "available",
          photo: updated.photo || profile.photo || "",
        });

        const nextUser = {
          ...user,
          name: updated.name || user.name,
          phone: updated.phone || user.phone,
          address: updated.address || user.address,
        };
        localStorage.setItem("userInfo", JSON.stringify(nextUser));
        setProfilePhotoFile(null);
        setProfilePhotoPreview("");
      }

      alert("Profile updated");
    } catch (error) {
      console.log("Save delivery profile error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfilePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file");
      return;
    }
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const profilePhotoUrl = profilePhotoPreview || (
    profile.photo?.startsWith("http") ? profile.photo : profile.photo ? `${API_BASE_URL}${profile.photo}` : ""
  );

  const handlePhotoLoadError = () => {
    if (!profilePhotoPreview) setProfile((prev) => ({ ...prev, photo: "" }));
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
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("user-auth-changed"));
    navigate("/delivery/login");
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

  const renderOrderCard = (order, showActions) => {
    const completedStep = DELIVERY_ACTIONS.findIndex((action) => action.status === order.status);
    const nextStep = ["Pending", "Assigned", "Accepted"].includes(order.status) ? 0 : completedStep + 1;
    const foodReady = order.restaurantStatus === "Ready for Pickup";

    return (
    <article className="delivery-order-card" key={order._id}>
      <div className="delivery-order-head">
        <div>
          <p className="delivery-order-id">Order #{order._id.slice(-6).toUpperCase()}</p>
          <h3>{order.items?.length || 0} item(s)</h3>
        </div>
        <span className="delivery-order-status">{order.status}</span>
      </div>

      <div className="delivery-route-strip">
        <div><FiClock /><span>Assigned</span><strong>{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></div>
        <div><FiMapPin /><span>Destination</span><strong>{order.address?.split(",")[0] || "Address"}</strong></div>
        <div><FiBox /><span>Order value</span><strong>Rs. {order.totalAmount || 0}</strong></div>
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
          {DELIVERY_ACTIONS.map((action, index) => (
            <button
              type="button"
              key={action.status}
              className={index <= completedStep ? "completed" : index === nextStep ? "next" : ""}
              disabled={index !== nextStep || updatingOrderId === order._id || (index === 0 && !foodReady)}
              onClick={() => updateStatus(order._id, action.status)}
            >
              {updatingOrderId === order._id && index === nextStep ? "Updating..." : action.label}
            </button>
          ))}
        </div>
      ) : null}
      {showActions && !foodReady ? <p className="delivery-waiting-note">Restaurant is preparing this order. Pickup activates when food is ready.</p> : null}
      {showActions && foodReady && ["Pending", "Assigned", "Accepted"].includes(order.status) ? <p className="delivery-ready-alert">Food is ready for pickup. Collect it from the restaurant.</p> : null}
    </article>
    );
  };

  return (
    <div className="delivery-dashboard-page">
      <div className="delivery-app-shell">
        <aside className="delivery-sidebar">
          <div className="delivery-side-brand"><FiTruck /><div><strong>Nutricart</strong><span>Delivery Partner</span></div></div>
          <div className="delivery-side-user">
            <div className="delivery-side-avatar">{profilePhotoUrl ? <img src={profilePhotoUrl} alt="" onError={handlePhotoLoadError} /> : <FiUser />}</div>
            <div><strong>{profile.name || user.name}</strong><span className={profile.availability}>{profile.availability}</span></div>
          </div>
          <nav>
            <button type="button" className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}><FiHome /> Dashboard</button>
            <button type="button" className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}><FiBox /> Orders <b>{orders.length}</b></button>
            <button type="button" className={activeTab === "account" ? "active" : ""} onClick={() => setActiveTab("account")}><FiUser /> Account</button>
          </nav>
          <button type="button" className="delivery-side-logout" onClick={logout}>Logout</button>
        </aside>

        <main className="delivery-dashboard-shell">
        <section className="delivery-dashboard-hero">
          <div>
            <p className="delivery-kicker">Delivery Dashboard</p>
            <h1>Hello, {profile.name || user.name}</h1>
            <p>Manage assigned orders, review delivery history, and keep your profile updated.</p>
          </div>

          <span className={`delivery-availability-pill ${profile.availability}`}>{profile.availability}</span>
        </section>

        {activeTab === "dashboard" ? (
          <section className="delivery-minimal-home">
            <div className="delivery-home-welcome">
              <div className="delivery-home-icon"><FiTruck /></div>
              <div><p>Ready for the road?</p><h2>Have a safe and productive day.</h2><span>Set your availability so the team knows when you can deliver.</span></div>
            </div>
            <div className="delivery-home-availability">
              <span>Current availability</span>
              <strong className={profile.availability}>{profile.availability}</strong>
              <div>
                <button type="button" className={profile.availability === "available" ? "active" : ""} onClick={() => changeAvailability("available")}>Available</button>
                <button type="button" className={profile.availability === "busy" ? "active" : ""} onClick={() => changeAvailability("busy")}>Busy</button>
                <button type="button" className={profile.availability === "offline" ? "active" : ""} onClick={() => changeAvailability("offline")}>Offline</button>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "dashboard" ? <section className="delivery-summary-grid compact-home">
          <div className="delivery-summary-card">
            <FiTruck /><div><span>Active deliveries</span><strong>{activeOrders.length}</strong></div>
          </div>
          <div className="delivery-summary-card">
            <FiCheckCircle /><div><span>Completed</span><strong>{historyOrders.length}</strong></div>
          </div>
        </section> : null}

        {loading ? (
          <div className="delivery-empty">Loading delivery dashboard...</div>
        ) : activeTab === "dashboard" ? null : activeTab === "orders" ? (
          orders.length === 0 ? (
            <div className="delivery-empty">
              <h2>No orders</h2>
              <p>Orders assigned by admin will appear here.</p>
            </div>
          ) : (
            <section className="delivery-orders-table-card">
              <div className="delivery-table-head"><div><p className="delivery-kicker">Order Management</p><h2>Assigned orders</h2></div><span>{activeOrders.length} active</span></div>
              <div className="delivery-table-scroll">
                <table className="delivery-orders-table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Food Prep</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>{orders.map((order) => (
                    <tr key={order._id}>
                      <td><strong>#{order._id.slice(-6).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleDateString()}</span></td>
                      <td><strong>{order.clientName || "Client"}</strong><span>{order.clientPhone || "No phone"}</span></td>
                      <td>{order.items?.length || 0}</td>
                      <td><span className={`delivery-food-status ${order.restaurantStatus === "Ready for Pickup" ? "ready" : ""}`}>{order.restaurantStatus || "Pending"}</span></td>
                      <td>Rs. {order.totalAmount || 0}</td>
                      <td><span className="delivery-table-status">{order.status}</span></td>
                      <td><button type="button" className="delivery-view-btn" onClick={(event) => { event.stopPropagation(); setSelectedOrder(order); }}>View More</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          )
        ) : (
          <section className="delivery-profile-card account-single-card">
            <div className="delivery-profile-head">
              <div className="delivery-profile-photo-editor">
                <div className="delivery-avatar">
                  {profilePhotoUrl ? <img src={profilePhotoUrl} alt={profile.name || "Delivery partner"} onError={handlePhotoLoadError} /> : <FiUser />}
                </div>
                <label className="delivery-photo-edit-btn">Edit Photo<input type="file" accept="image/*" onChange={handleProfilePhoto} /></label>
              </div>
              <div className="delivery-profile-heading">
                <p className="delivery-kicker">Account Profile</p>
                <h2>{profile.name || "Personal details"}</h2>
                <span>{profile.email || "Keep your personal and vehicle details updated."}</span>
              </div>
              <span className={`delivery-account-status ${profile.availability}`}>{profile.availability}</span>
            </div>

            <div className="delivery-profile-grid">
              <label><span>Full name</span><input name="name" value={profile.name} onChange={handleProfileChange} placeholder="Full name" /></label>
              <label><span>Phone number</span><input name="phone" value={profile.phone} onChange={handleProfileChange} placeholder="Phone number" /></label>
              <label className="full"><span>Address</span><input name="address" value={profile.address} onChange={handleProfileChange} placeholder="Address" /></label>
              <label><span>Vehicle type</span><select name="vehicleType" value={profile.vehicleType} onChange={handleProfileChange}><option>Bike</option><option>Scooter</option><option>Bicycle</option><option>Car</option></select></label>
              <label><span>Vehicle number</span><input name="vehicleNumber" value={profile.vehicleNumber} onChange={handleProfileChange} placeholder="Vehicle registration" /></label>
              <label className="full"><span>Licence number</span><input name="licenseNumber" value={profile.licenseNumber} onChange={handleProfileChange} placeholder="Driving licence number" /></label>
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
        </main>
      </div>

      {selectedOrder ? createPortal((
        <div className="delivery-modal-backdrop" role="presentation" onMouseDown={() => setSelectedOrder(null)}>
          <div className="delivery-order-modal" role="dialog" aria-modal="true" aria-label="Order details" onMouseDown={(event) => event.stopPropagation()}>
            <div className="delivery-modal-head"><div><p>Order details</p><h2>#{selectedOrder._id.slice(-6).toUpperCase()}</h2></div><button type="button" onClick={() => setSelectedOrder(null)}>×</button></div>
            {renderOrderCard(selectedOrder, !["Delivered", "Cancelled"].includes(selectedOrder.status))}
          </div>
        </div>
      ), document.body) : null}
    </div>
  );
}

export default DeliveryDashboard;
