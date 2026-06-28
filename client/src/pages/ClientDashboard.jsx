import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiCamera, FiEdit3, FiGrid, FiLogOut, FiPackage, FiSave, FiShoppingCart, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../CSS-pages/ClientDashboard.css";

import cartImg from "../assets/images/cartimg.jpg";
import menuImg from "../assets/images/menuimg.jpg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

const getFoodImageUrl = (image, fallback) => {
  if (!image) return fallback;

  const normalizedImage = String(image).replace(/\\/g, "/");

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/uploads\//i.test(normalizedImage)) {
    const uploadPath = new URL(normalizedImage).pathname;
    return encodeURI(`${API_BASE_URL}${uploadPath}`);
  }

  if (/^https?:\/\//i.test(normalizedImage) || normalizedImage.startsWith("data:")) {
    return normalizedImage;
  }

  if (normalizedImage.startsWith("/uploads")) {
    return encodeURI(`${API_BASE_URL}${normalizedImage}`);
  }

  if (normalizedImage.startsWith("uploads/")) {
    return encodeURI(`${API_BASE_URL}/${normalizedImage}`);
  }

  const uploadsIndex = normalizedImage.indexOf("uploads/");
  if (uploadsIndex >= 0) {
    return encodeURI(`${API_BASE_URL}/${normalizedImage.slice(uploadsIndex)}`);
  }

  return encodeURI(normalizedImage);
};

const emptyProfile = {
  name: "",
  phone: "",
  dob: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  profileImage: "",
};

const resizeProfileImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 360;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeView, setActiveView] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);

  const sidebarItems = useMemo(
    () => [
      { label: "Dashboard", value: "dashboard", icon: <FiGrid /> },
      { label: "Account", value: "account", icon: <FiUser /> },
      { label: "Cart", value: "cart", icon: <FiShoppingCart /> },
      { label: "My Order", value: "orders", icon: <FiPackage /> },
    ],
    []
  );

  const syncProfileForm = (client) => {
    const address = client?.address || {};
    setProfileForm({
      name: client?.name || "",
      phone: client?.phone || "",
      dob: client?.dob ? String(client.dob).slice(0, 10) : "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      profileImage: client?.profileImage || "",
    });
  };

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
      syncProfileForm(parsed);
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

        const nextCartItems = Array.isArray(cartRes.data) ? cartRes.data : [];
        const nextOrders = Array.isArray(orderRes.data) ? orderRes.data : [];

        setCartItems(nextCartItems);
        setOrders(nextOrders);
        setCartCount(nextCartItems.length);
        setOrderCount(nextOrders.length);
      } catch (error) {
        console.log("Client dashboard fetch error:", error.response?.data || error.message);
        setCartItems([]);
        setOrders([]);
        setCartCount(0);
        setOrderCount(0);
      }
    };

    fetchClientData();
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageData = await resizeProfileImage(file);
      setProfileForm((prev) => ({ ...prev, profileImage: imageData }));
      setIsEditing(true);
    } catch (error) {
      console.log("Profile image error:", error);
      alert("Unable to load this image. Please choose another image.");
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        profileImage: profileForm.profileImage,
        dob: profileForm.dob,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode,
        },
      };

      const response = await axios.put(`${API_BASE_URL}/api/clients/${user.id}`, payload);
      const updatedClient = response.data?.client;
      const nextUser = {
        ...user,
        ...updatedClient,
        id: updatedClient?._id || user.id,
        role: "client",
      };

      localStorage.setItem("userInfo", JSON.stringify(nextUser));
      window.dispatchEvent(new Event("user-auth-changed"));
      setUser(nextUser);
      syncProfileForm(nextUser);
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (error) {
      console.log("Profile update error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Unable to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("user-auth-changed"));
    navigate("/login");
  };

  if (!user) return <h2 className="client-loading">Loading...</h2>;

  const activeTitle = sidebarItems.find((item) => item.value === activeView)?.label || "Account";
  const orderedItems = orders.flatMap((order) =>
    (order.items || []).filter((item) => item.foodId).map((item, index) => {
      const food = item.foodId || {};
      const quantity = Number(item.quantity || 1);
      const price = Number(food.price || 0);

      return {
        id: `${order._id}-${food._id || index}`,
        orderCode: String(order._id || "").slice(-6).toUpperCase(),
        image: getFoodImageUrl(food.image, menuImg),
        foodName: food.name || "Food item",
        quantity,
        price,
        total: price * quantity,
        status: order.status || "Pending",
        orderedAt: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "Recent",
      };
    })
  );
  const groupedOrderedItems = Array.from(
    orderedItems
      .reduce((map, item) => {
        const key = [
          item.foodName,
          item.price,
          item.status,
          item.orderedAt,
        ].join("|");
        const existing = map.get(key);

        if (existing) {
          existing.quantity += item.quantity;
          existing.total += item.total;
          existing.orderCodes.add(item.orderCode);
        } else {
          map.set(key, {
            ...item,
            orderCodes: new Set([item.orderCode]),
          });
        }

        return map;
      }, new Map())
      .values()
  ).map((item) => ({
    ...item,
    orderCode: Array.from(item.orderCodes).join(", "),
  }));

  return (
    <div className="client-dashboard">
      <div className="client-shell client-side-layout">
        <aside className="client-sidebar">
          <div className="client-sidebar-brand">
            <span className="client-sidebar-badge">N</span>
            <div>
              <p className="client-kicker">Nutricart</p>
              <h2>Client Panel</h2>
            </div>
          </div>

          <div className="client-sidebar-profile">
            <p>Signed in as</p>
            <h3>{user.name}</h3>
            <span>{user.email}</span>
          </div>

          <nav className="client-sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                type="button"
                key={item.label}
                className={`client-sidebar-link ${activeView === item.value ? "active" : ""}`}
                onClick={() => setActiveView(item.value)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button className="client-sidebar-logout" type="button" onClick={logout}>
            <FiLogOut /> Logout
          </button>
        </aside>

        <main className="client-content">
          <section className="client-top">
            <div>
              <p className="client-kicker">Client Dashboard</p>
              <h1>{activeTitle}</h1>
              <p>Hello, {user.name}. Manage your Nutricart activity from this dashboard.</p>
            </div>
          </section>

          <section className="client-dashboard-panel">
            {activeView === "dashboard" ? (
              <div className="client-section-view">
                <section className="dashboard-overview-grid">
                  <button type="button" className="dashboard-overview-card" onClick={() => setActiveView("cart")}>
                    <FiShoppingCart />
                    <span>Cart Items</span>
                    <strong>{cartCount}</strong>
                  </button>
                  <button type="button" className="dashboard-overview-card" onClick={() => setActiveView("orders")}>
                    <FiPackage />
                    <span>Total Orders</span>
                    <strong>{orderCount}</strong>
                  </button>
                </section>
              </div>
            ) : null}

            {activeView === "account" ? (
              <div className="client-account-layout">
                <aside className="client-account-photo">
                  <div className="account-avatar">
                    {profileForm.profileImage ? (
                      <img src={profileForm.profileImage} alt={user.name} />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <span className="account-status">Client account</span>
                  <label className="account-image-upload">
                    <FiCamera /> Change photo
                    <input type="file" accept="image/*" onChange={handleProfileImageChange} />
                  </label>
                </aside>

                <section className="client-profile-panel">
                  <div className="profile-panel-head">
                    <div>
                      <p className="client-kicker">Account</p>
                      <h2>Profile details</h2>
                      <span>Manage your personal information and delivery address.</span>
                    </div>
                    <button className={isEditing ? "is-cancel" : ""} type="button" onClick={() => setIsEditing((value) => !value)}>
                      <FiEdit3 /> {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <form className="client-profile-form" onSubmit={saveProfile}>
                    <fieldset className="profile-field-group">
                      <legend>Personal information</legend>
                      <div className="profile-form-grid">
                        <label>
                          <span>Name</span>
                          <input name="name" value={profileForm.name} onChange={handleProfileChange} disabled={!isEditing} />
                        </label>
                        <label>
                          <span>Phone</span>
                          <input name="phone" value={profileForm.phone} onChange={handleProfileChange} disabled={!isEditing} />
                        </label>
                      </div>
                      <label>
                        <span>Date of birth</span>
                        <input name="dob" type="date" value={profileForm.dob} onChange={handleProfileChange} disabled={!isEditing} />
                      </label>
                    </fieldset>
                    <fieldset className="profile-field-group">
                      <legend>Delivery address</legend>
                      <label>
                        <span>Street</span>
                        <input name="street" value={profileForm.street} onChange={handleProfileChange} disabled={!isEditing} />
                      </label>
                      <div className="profile-form-grid">
                        <label>
                          <span>City</span>
                          <input name="city" value={profileForm.city} onChange={handleProfileChange} disabled={!isEditing} />
                        </label>
                        <label>
                          <span>State</span>
                          <input name="state" value={profileForm.state} onChange={handleProfileChange} disabled={!isEditing} />
                        </label>
                        <label>
                          <span>Pincode</span>
                          <input name="pincode" value={profileForm.pincode} onChange={handleProfileChange} disabled={!isEditing} />
                        </label>
                      </div>
                    </fieldset>

                    {isEditing ? (
                      <button className="profile-save-btn" type="submit" disabled={isSaving}>
                        <FiSave /> {isSaving ? "Saving..." : "Save Profile"}
                      </button>
                    ) : null}
                  </form>
                </section>

              </div>
            ) : null}

            {activeView === "cart" ? (
              <div className="client-section-view">
                <div className="client-section-head">
                  <div>
                    <p className="client-kicker">Cart</p>
                    <h2>Cart Items</h2>
                    <span>{cartCount} item{cartCount === 1 ? "" : "s"} selected</span>
                  </div>
                </div>

                {cartItems.length === 0 ? (
                  <div className="client-empty-box">
                    <h3>Your cart is empty</h3>
                    <p>Add foods from the menu to start an order.</p>
                  </div>
                ) : (
                  <div className="dashboard-cart-list">
                    {cartItems.map((item) => {
                      const food = item.foodId || {};
                      const imageUrl = getFoodImageUrl(food.image, cartImg);

                      return (
                        <button
                          type="button"
                          className="dashboard-cart-card"
                          key={item._id}
                          onClick={() => navigate("/cart")}
                        >
                          <img
                            src={imageUrl}
                            alt={food.name || "Cart item"}
                            onError={(e) => {
                              e.currentTarget.src = cartImg;
                            }}
                          />
                          <div>
                            <h3>{food.name || "Food item"}</h3>
                            <p>{food.hotelName || "Nutricart partner"}</p>
                            <span>Qty: {item.quantity || 1}</span>
                          </div>
                          <strong>Rs. {Number(food.price || 0) * Number(item.quantity || 1)}</strong>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {activeView === "orders" ? (
              <div className="client-section-view">
                <div className="client-section-head">
                  <div>
                    <p className="client-kicker">My Order</p>
                    <h2>Ordered Items</h2>
                    <span>{groupedOrderedItems.length} food item{groupedOrderedItems.length === 1 ? "" : "s"} ordered</span>
                  </div>
                  <button type="button" className="client-primary-action" onClick={() => navigate("/orders")}>
                    View Orders
                  </button>
                </div>

                {groupedOrderedItems.length === 0 ? (
                  <div className="client-empty-box">
                    <h3>No orders yet</h3>
                    <p>Your ordered food items will appear here.</p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrap">
                    <table className="dashboard-order-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Food Item</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedOrderedItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <img
                                className="order-food-image"
                                src={item.image}
                                alt=""
                                aria-label={item.foodName}
                                onError={(e) => {
                                  e.currentTarget.src = menuImg;
                                }}
                              />
                            </td>
                            <td>
                              <strong>{item.foodName}</strong>
                              <span className="order-code">Order #{item.orderCode}</span>
                            </td>
                            <td>{item.quantity}</td>
                            <td>Rs. {item.total}</td>
                            <td><span className="table-status">{item.status}</span></td>
                            <td>{item.orderedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

          </section>

        </main>
      </div>
    </div>
  );
}

export default ClientDashboard;
