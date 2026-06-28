import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaChevronLeft, FaChevronRight, FaClock, FaSearch, FaTimesCircle, FaUserPlus } from "react-icons/fa";
import { LuActivity, LuClipboardList, LuEye, LuHash, LuIndianRupee, LuLayoutDashboard, LuLogOut, LuShieldCheck, LuStore, LuTruck, LuUser, LuUsers, LuUtensils } from "react-icons/lu";
import "../CSS-pages/AdminDashboard.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [dashboardCounts, setDashboardCounts] = useState({
    clients: 0,
    owners: 0,
    delivery: 0,
    orders: 0,
  });
  const [reviewCounts, setReviewCounts] = useState({
    clientsNew: 0,
    ownersPending: 0,
    deliveryPending: 0,
    totalPending: 0,
  });

  const approvedDeliveryBoys = useMemo(
    () =>
      deliveryBoys.filter(
        (item) => item?.status === "approved" || item?.isApproved === true
      ),
    [deliveryBoys]
  );

  const tabLabels = {
    dashboard: "Overview of clients, restaurants, delivery registrations, and orders.",
    clients: "View registered client accounts.",
    owners: "Review restaurant registrations and approval status.",
    delivery: "Approve delivery registrations before delivery login.",
    orders: "Track orders and assign approved delivery partners.",
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("user-auth-changed"));
    navigate("/admin/login");
  };

  const openTab = (tab) => {
    setSelectedUser(null);
    setSelectedOrder(null);
    setSearchTerm("");
    setCurrentPage(1);
    setActiveTab(tab);
  };

  const getItemStatus = (item) =>
    item.status || (item.isApproved ? "approved" : "pending");

  const isNewRecord = (item) => {
    if (!item.createdAt) return false;
    const createdTime = new Date(item.createdAt).getTime();
    if (Number.isNaN(createdTime)) return false;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - createdTime <= sevenDays;
  };

  const getDisplayName = (item) =>
    item.businessName ||
    item.name ||
    item.username ||
    item.ownerName ||
    item.deliveryBoyName ||
    "Unknown user";

  const formatDate = (value) => {
    if (!value) return "Not available";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aPending = getItemStatus(a) === "pending" ? 1 : 0;
      const bPending = getItemStatus(b) === "pending" ? 1 : 0;

      if (aPending !== bPending) {
        return bPending - aPending;
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [data]);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sortedData;

    return sortedData.filter((item) => {
      const searchableText = [
        item._id,
        item.name,
        item.businessName,
        item.username,
        item.ownerName,
        item.email,
        item.phone,
        item.mobile,
        item.role,
        item.status,
        item.address,
        item.deliveryBoyName,
        item.deliveryBoyId?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [sortedData, searchTerm]);

  const renderSearch = (placeholder) => (
    <label className="admin-search">
      <FaSearch aria-hidden="true" />
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value);
          setCurrentPage(1);
        }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / recordsPerPage));
  const pageStart = (currentPage - 1) * recordsPerPage;
  const paginatedData = filteredData.slice(pageStart, pageStart + recordsPerPage);

  const renderViewMore = () =>
    filteredData.length > recordsPerPage ? (
      <div className="admin-pagination">
        <button
          type="button"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
        >
          <FaChevronLeft aria-hidden="true" />
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          type="button"
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage === totalPages}
        >
          View More
          <FaChevronRight aria-hidden="true" />
        </button>
      </div>
    ) : null;

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo") || "null");
      if (!storedUser || storedUser.role !== "admin") {
        navigate("/admin/login");
      }
    } catch {
      localStorage.removeItem("userInfo");
      navigate("/admin/login");
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [clientsRes, ownersRes, deliveryRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/clients`),
        axios.get(`${API_BASE_URL}/api/admin/owners`),
        axios.get(`${API_BASE_URL}/api/admin/delivery`),
        axios.get(`${API_BASE_URL}/api/orders/list`),
      ]);

      setDashboardCounts({
        clients: clientsRes.data.length,
        owners: ownersRes.data.length,
        delivery: deliveryRes.data.length,
        orders: ordersRes.data.length,
      });
      setReviewCounts({
        clientsNew: clientsRes.data.filter(isNewRecord).length,
        ownersPending: ownersRes.data.filter((item) => getItemStatus(item) === "pending").length,
        deliveryPending: deliveryRes.data.filter((item) => getItemStatus(item) === "pending").length,
        totalPending:
          ownersRes.data.filter((item) => getItemStatus(item) === "pending").length +
          deliveryRes.data.filter((item) => getItemStatus(item) === "pending").length,
      });
    } catch (err) {
      console.error(err);
      setDashboardCounts({
        clients: 0,
        owners: 0,
        delivery: 0,
        orders: 0,
      });
      setReviewCounts({
        clientsNew: 0,
        ownersPending: 0,
        deliveryPending: 0,
        totalPending: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async (type) => {
    try {
      setIsLoading(true);
      if (type === "orders") {
        const [ordersRes, deliveryRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/orders/list`),
          axios.get(`${API_BASE_URL}/api/admin/delivery`),
        ]);

        setData(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setDeliveryBoys(Array.isArray(deliveryRes.data) ? deliveryRes.data : []);
        setAssignments(
          (Array.isArray(ordersRes.data) ? ordersRes.data : []).reduce((acc, order) => {
            acc[order._id] = order.deliveryBoyId?._id || "";
            return acc;
          }, {})
        );
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/admin/${type}`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setData([]);
      if (type === "orders") {
        setDeliveryBoys([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (type, action, id) => {
    try {
      if (action === "View") {
        const res = await axios.get(`${API_BASE_URL}/api/admin/user/${id}`);
        if (!res.data) {
          alert("User details not found");
          return;
        }

        setSelectedUser({
          ...res.data,
          role: res.data.role || getRoleFromTab(type),
        });
        return;
      }

      if (action === "Approve" || action === "Reject") {
        await axios.post(
          `${API_BASE_URL}/api/admin/${type}/${action.toLowerCase()}/${id}`
        );
        alert(`${action} successful`);
        fetchDashboardData();
        fetchData(type);
      }
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  const handleAssignDelivery = async (orderId) => {
    const deliveryBoyId = assignments[orderId];

    if (!deliveryBoyId) {
      alert("Please select a delivery boy");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/orders/assign-delivery`, {
        orderId,
        deliveryBoyId,
      });
      alert("Delivery boy assigned successfully");
      fetchData("orders");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to assign delivery boy");
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData();
      setData([]);
    } else {
      fetchData(activeTab);
    }
    const refreshTimer = activeTab === "orders"
      ? window.setInterval(() => fetchData("orders"), 15000)
      : null;
    return () => {
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
    // Fetching is intentionally tied to tab changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const getItemRole = (item) =>
    item.role ||
    (activeTab === "delivery"
      ? "delivery "
      : activeTab === "owners"
        ? "owner"
        : activeTab === "clients"
          ? "client"
          : "user");

  const getRoleFromTab = (tab) =>
    tab === "delivery"
      ? "delivery"
      : tab === "owners"
        ? "owner"
        : tab === "clients"
          ? "client"
          : "user";

  const formatAddress = (address) => {
    if (!address) {
      return "";
    }

    if (typeof address === "string") {
      return address;
    }

    return [address.street, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(", ");
  };

  const getUploadUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    if (filePath.startsWith("/uploads")) {
      return `${API_BASE_URL}${filePath}`;
    }
    return `${API_BASE_URL}/uploads/${filePath.replace(/^\/+/, "")}`;
  };

  const ownerAddress = (owner) =>
    [owner.street, owner.city, owner.state, owner.pincode].filter(Boolean).join(", ");

  const renderDetailField = (label, value) => (
    <div className="admin-detail-field">
      <span>{label}</span>
      <strong>
        {typeof value === "object" && value !== null
          ? formatAddress(value)
          : value || "Not provided"}
      </strong>
    </div>
  );

  const renderOwnerImages = (owner) => {
    const images = [
      { label: "Restaurant Owner Photo", value: owner.ownerPhoto },
      { label: "Shop Image", value: owner.shopImage },
      { label: "License Image", value: owner.licenseImage },
    ];

    return (
      <div className="admin-owner-documents">
        {images.map((image) => {
          const imageUrl = getUploadUrl(image.value);

          return (
            <div className="admin-owner-document" key={image.label}>
              <span>{image.label}</span>
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt={image.label} />
                  <a href={imageUrl} target="_blank" rel="noreferrer">
                    Open image
                  </a>
                </>
              ) : (
                <div className="admin-document-empty">No image uploaded</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDeliveryPhoto = (deliveryPartner) => {
    const imageUrl = getUploadUrl(deliveryPartner.photo);

    return (
      <div className="admin-owner-doc-section">
        <h3>Uploaded Photo</h3>
        <div className="admin-owner-documents delivery-documents">
          <div className="admin-owner-document">
            <span>Delivery Partner Photo</span>
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="Delivery partner" />
                <a href={imageUrl} target="_blank" rel="noreferrer">
                  Open image
                </a>
              </>
            ) : (
              <div className="admin-document-empty">No photo uploaded</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => (
    <div className="table-container order-management-box">
      <div className="order-management-head">
        <span>{data.length} records</span>
      </div>

      {renderSearch(`Search ${activeTab}`)}

      <div className="admin-table-wrap admin-record-table-wrap">
        {filteredData.length === 0 ? (
          <div className="order-admin-empty">
            {searchTerm
              ? "No matching records found."
              : activeTab === "delivery"
              ? "No delivery registrations found. Register a delivery boy first."
              : "No records found"}
          </div>
        ) : (
          <table className="admin-record-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Member</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => {
                const status = getItemStatus(item);
                const canReview =
                  (activeTab === "owners" || activeTab === "delivery") &&
                  status === "pending";
                const name = getDisplayName(item);

                return (
                  <tr className={status === "pending" ? "needs-review-row" : ""} key={item._id}>
                    <td>
                      <span className="admin-row-number">
                        {String(pageStart + index + 1).padStart(2, "0")}
                      </span>
                    </td>
                    <td>
                      <div className="admin-member-cell">
                        <strong>{name}</strong>
                        <span>#{item._id?.slice(-6).toUpperCase()}</span>
                        {isNewRecord(item) ? (
                          <em><FaUserPlus /> New</em>
                        ) : null}
                      </div>
                    </td>
                    <td>{item.email || "Not provided"}</td>
                    <td>{item.phone || item.mobile || "Not provided"}</td>
                    <td className="admin-role-cell">{getItemRole(item)}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <span className={`admin-status admin-status-${status}`}>
                        {status === "pending" ? <FaClock /> : status === "approved" ? <FaCheckCircle /> : <FaTimesCircle />}
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="view"
                          onClick={() => handleAction(activeTab, "View", item._id)}
                        >
                          View
                        </button>

                        {canReview ? (
                          <>
                            <button
                              className="approve"
                              onClick={() => handleAction(activeTab, "Approve", item._id)}
                            >
                              Approve
                            </button>
                            <button
                              className="reject"
                              onClick={() => handleAction(activeTab, "Reject", item._id)}
                            >
                              Reject
                            </button>
                          </>
                        ) : activeTab === "clients" && isNewRecord(item) ? (
                          <span className="admin-action-note new-client-note">New</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {renderViewMore()}
    </div>
  );

  const renderOrders = () => (
    <div className="table-container order-management-box">
      <div className="order-management-head">
        <div>
          <h2>ORDER MANAGEMENT</h2>
          <p className="admin-section-note">
            View all client orders and assign delivery partners to active orders.
          </p>
        </div>
        <span>{data.length} orders</span>
      </div>

      {renderSearch("Search order ID, status, delivery, or address")}

      <div className="admin-order-table-scroll">
        {filteredData.length === 0 ? (
          <div className="order-admin-empty">
            {searchTerm ? "No matching orders found." : "No orders found"}
          </div>
        ) : (
          <table className="admin-order-table">
            <thead><tr><th><LuHash /> Order</th><th><LuUser /> Client</th><th><LuStore /> Restaurant</th><th><LuIndianRupee /> Total</th><th><LuActivity /> Status</th><th><LuTruck /> Assign Delivery</th><th><LuEye /> Details</th></tr></thead>
            <tbody>{paginatedData.map((order) => (
              <tr key={order._id}>
                <td><strong>#{order._id.slice(-6).toUpperCase()}</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></td>
                <td><strong>{order.clientName || "Client"}</strong><small>{order.clientPhone || "No phone"}</small></td>
                <td><span className="admin-order-restaurant">{[...new Set((order.items || []).map((item) => item.foodId?.hotelName).filter(Boolean))].join(", ") || "Not available"}</span></td>
                <td><strong>Rs. {order.totalAmount || 0}</strong></td>
                <td><span className="admin-order-pill">{order.status}</span></td>
                <td>{["Delivered", "Cancelled"].includes(order.status) ? <span className="admin-order-complete">Completed</span> : <div className="admin-table-assignment"><select value={assignments[order._id] || ""} onChange={(e) => setAssignments((prev) => ({ ...prev, [order._id]: e.target.value }))}><option value="">Select partner</option>{approvedDeliveryBoys.map((deliveryBoy) => <option key={deliveryBoy._id} value={deliveryBoy._id}>{deliveryBoy.name}</option>)}</select><button className="approve" onClick={() => handleAssignDelivery(order._id)} disabled={approvedDeliveryBoys.length === 0}>{order.deliveryBoyId ? "Reassign" : "Assign"}</button></div>}</td>
                <td><button type="button" className="admin-order-view" onClick={() => setSelectedOrder(order)}>View More</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {renderViewMore()}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h2><LuShieldCheck /> Admin Panel</h2>
        <p className="admin-sidebar-note">Manage approvals, users, and delivery workflow.</p>
        <ul>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => openTab("dashboard")}
          >
            <LuLayoutDashboard /> Dashboard
          </li>
          <li
            className={activeTab === "clients" ? "active" : ""}
            onClick={() => openTab("clients")}
          >
            <LuUsers /> Clients
          </li>
          <li
            className={activeTab === "owners" ? "active" : ""}
            onClick={() => openTab("owners")}
          >
            <LuStore /> Restaurants
          </li>
          <li
            className={activeTab === "delivery" ? "active" : ""}
            onClick={() => openTab("delivery")}
          >
            <LuTruck /> Delivery
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => openTab("orders")}
          >
            <LuClipboardList /> Orders
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}><LuLogOut /> Logout</button>
      </aside>

      <main className="main-content">
        <section className="admin-header-card">
          <p className="admin-kicker">Nutricart Admin</p>
          <h1>
            {activeTab === "dashboard"
              ? "Admin Dashboard"
              : activeTab === "owners"
                ? "Restaurant Management"
                : `${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)} Management`}
          </h1>
          <p className="admin-header-text">{tabLabels[activeTab]}</p>
        </section>

        {activeTab === "dashboard" ? (
          <>
            {isLoading ? (
              <div className="admin-empty-state">Loading dashboard...</div>
            ) : (
            <>
              <div className="cards">
                <button type="button" className="card" onClick={() => openTab("clients")}>
                  <LuUsers className="admin-card-icon" />
                  <span>New this week: {reviewCounts.clientsNew}</span>
                  <h3>Clients</h3>
                  <p>{dashboardCounts.clients}</p>
                </button>
                <button type="button" className="card review-card" onClick={() => openTab("owners")}>
                  <LuStore className="admin-card-icon" />
                  <span>Pending: {reviewCounts.ownersPending}</span>
                  <h3>Restaurants</h3>
                  <p>{dashboardCounts.owners}</p>
                </button>
                <button type="button" className="card review-card" onClick={() => openTab("delivery")}>
                  <LuTruck className="admin-card-icon" />
                  <span>Pending: {reviewCounts.deliveryPending}</span>
                  <h3>Delivery</h3>
                  <p>{dashboardCounts.delivery}</p>
                </button>
                <button type="button" className="card" onClick={() => openTab("orders")}>
                  <LuClipboardList className="admin-card-icon" />
                  <span>All client orders</span>
                  <h3>Orders</h3>
                  <p>{dashboardCounts.orders}</p>
                </button>
              </div>
            </>
            )}
          </>
        ) : activeTab === "orders" ? (
          isLoading ? <div className="admin-empty-state">Loading orders...</div> : renderOrders()
        ) : (
          isLoading ? <div className="admin-empty-state">Loading data...</div> : renderTable()
        )}
      </main>

      {selectedOrder ? (
        <div className="modal" onMouseDown={() => setSelectedOrder(null)}>
          <div className="modal-content admin-order-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="admin-modal-head"><div><p className="admin-kicker">Order Details</p><h2>#{selectedOrder._id.slice(-6).toUpperCase()}</h2></div><span className="admin-order-pill">{selectedOrder.status}</span></div>
            <div className="admin-detail-grid">
              {renderDetailField("Client", selectedOrder.clientName || "Client")}
              {renderDetailField("Phone", selectedOrder.clientPhone || "Not available")}
              {renderDetailField("Address", formatAddress(selectedOrder.address) || "Not available")}
              {renderDetailField("Total Amount", `Rs. ${selectedOrder.totalAmount || 0}`)}
              {renderDetailField("Restaurant Update", selectedOrder.restaurantStatus || "Pending")}
              {renderDetailField("Delivery Status", selectedOrder.status || "Pending")}
              {renderDetailField("Delivery Partner", selectedOrder.deliveryBoyId?.name || selectedOrder.deliveryBoyName || "Not assigned")}
              {renderDetailField("Partner Phone", selectedOrder.deliveryBoyId?.phone || "Not available")}
            </div>
            <div className="admin-order-food-details"><h3><LuUtensils /> Hotel & Food Items</h3>{(selectedOrder.items || []).map((item, index) => <div key={`${selectedOrder._id}-${index}`}><div><span><LuStore /> Hotel Name</span><strong>{item.foodId?.hotelName || "Restaurant"}</strong></div><div><span><LuUtensils /> Food Item</span><strong>{item.foodId?.name || "Food"}</strong></div><div><span>Quantity</span><strong>{item.quantity || 1}</strong></div><div><span>Item Total</span><strong>Rs. {Number(item.foodId?.price || 0) * Number(item.quantity || 0)}</strong></div></div>)}</div>
            <button type="button" onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      ) : null}

      {selectedUser && (
        <div className="modal">
          <div className={`modal-content ${selectedUser.role === "owner" || selectedUser.role === "delivery" ? "owner-detail-modal" : ""}`}>
            <div className="admin-modal-head">
              <div>
                <p className="admin-kicker">{selectedUser.role === "owner" ? "Restaurant" : selectedUser.role || "User"} Details</p>
                <h2>
                  {selectedUser.role === "owner"
                    ? selectedUser.businessName || selectedUser.ownerName
                    : selectedUser.name || selectedUser.ownerName}
                </h2>
              </div>
              <span className={`admin-status admin-status-${selectedUser.status || (selectedUser.isApproved ? "approved" : "pending")}`}>
                {selectedUser.status || (selectedUser.isApproved ? "approved" : "pending")}
              </span>
            </div>

            {selectedUser.role === "owner" ? (
              <>
                <div className="admin-detail-grid">
                  {renderDetailField("Record No", `#${selectedUser._id?.slice(-6).toUpperCase()}`)}
                  {renderDetailField("Hotel Name", selectedUser.businessName)}
                  {renderDetailField("Restaurant Owner", selectedUser.ownerName)}
                  {renderDetailField("Email", selectedUser.email)}
                  {renderDetailField("Phone", selectedUser.phone)}
                  {renderDetailField("FSSAI Number", selectedUser.fssaiNumber)}
                  {renderDetailField("Street", selectedUser.street)}
                  {renderDetailField("City", selectedUser.city)}
                  {renderDetailField("State", selectedUser.state)}
                  {renderDetailField("Pincode", selectedUser.pincode)}
                  {renderDetailField("Full Address", ownerAddress(selectedUser))}
                  {renderDetailField("Registered", formatDate(selectedUser.createdAt))}
                </div>

                <div className="admin-owner-doc-section">
                  <h3>Uploaded Images</h3>
                  {renderOwnerImages(selectedUser)}
                </div>
              </>
            ) : selectedUser.role === "delivery" ? (
              <>
                <div className="admin-detail-grid">
                  {renderDetailField("Record No", `#${selectedUser._id?.slice(-6).toUpperCase()}`)}
                  {renderDetailField("Full Name", selectedUser.name)}
                  {renderDetailField("Email", selectedUser.email)}
                  {renderDetailField("Phone", selectedUser.phone)}
                  {renderDetailField("Address", selectedUser.address)}
                  {renderDetailField("Vehicle Type", selectedUser.vehicleType)}
                  {renderDetailField("Vehicle Number", selectedUser.vehicleNumber)}
                  {renderDetailField("License Number", selectedUser.licenseNumber)}
                  {renderDetailField("Availability", selectedUser.availability)}
                  {renderDetailField("Registered", formatDate(selectedUser.createdAt))}
                </div>

                {renderDeliveryPhoto(selectedUser)}
              </>
            ) : (
              <div className="admin-detail-grid">
                {renderDetailField("Record No", `#${selectedUser._id?.slice(-6).toUpperCase()}`)}
                {renderDetailField("Name", selectedUser.name || selectedUser.ownerName)}
                {renderDetailField("Email", selectedUser.email)}
                {renderDetailField("Phone", selectedUser.phone || "-")}
                {formatAddress(selectedUser.address)
                  ? renderDetailField("Address", formatAddress(selectedUser.address))
                  : null}
                {selectedUser.vehicleType ? renderDetailField("Vehicle", selectedUser.vehicleType) : null}
                {selectedUser.licenseNumber ? renderDetailField("License", selectedUser.licenseNumber) : null}
                {renderDetailField("Role", selectedUser.role || "user")}
                {renderDetailField("Registered", formatDate(selectedUser.createdAt))}
              </div>
            )}

            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
