import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import "../CSS-pages/AdminDashboard.css";

const API_BASE_URL = "";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;
  const [dashboardCounts, setDashboardCounts] = useState({
    clients: 0,
    owners: 0,
    delivery: 0,
    orders: 0,
  });

  const approvedDeliveryBoys = useMemo(
    () =>
      deliveryBoys.filter(
        (item) => item?.status === "approved" || item?.isApproved === true
      ),
    [deliveryBoys]
  );

  const tabLabels = {
    dashboard: "Overview of clients, owners, delivery registrations, and orders.",
    clients: "View registered client accounts.",
    owners: "Review owner registrations and approval status.",
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
    setSearchTerm("");
    setCurrentPage(1);
    setActiveTab(tab);
  };

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return data;

    return data.filter((item) => {
      const searchableText = [
        item._id,
        item.name,
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
  }, [data, searchTerm]);

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
        axios.get(`${API_BASE_URL}/api/orders/list?assignable=true`),
      ]);

      setDashboardCounts({
        clients: clientsRes.data.length,
        owners: ownersRes.data.length,
        delivery: deliveryRes.data.length,
        orders: ordersRes.data.length,
      });
    } catch (err) {
      console.error(err);
      setDashboardCounts({
        clients: 0,
        owners: 0,
        delivery: 0,
        orders: 0,
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
          axios.get(`${API_BASE_URL}/api/orders/list?assignable=true`),
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
  }, [activeTab]);

  const getItemRole = (item) =>
    item.role ||
    (activeTab === "delivery"
      ? "delivery"
      : activeTab === "owners"
        ? "owner"
        : activeTab === "clients"
          ? "client"
          : "user");

  const getItemStatus = (item) =>
    item.status || (item.isApproved ? "approved" : "pending");

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

  const renderTable = () => (
    <div className="table-container order-management-box">
      <div className="order-management-head">
        <div>
          <h2>{activeTab.toUpperCase()} MANAGEMENT</h2>
          <p className="admin-section-note">{tabLabels[activeTab]}</p>
        </div>
        <span>{data.length} records</span>
      </div>

      {renderSearch(`Search ${activeTab}`)}

      <div className="admin-record-list">
        {filteredData.length === 0 ? (
          <div className="order-admin-empty">
            {searchTerm
              ? "No matching records found."
              : activeTab === "delivery"
              ? "No delivery registrations found. Register a delivery boy first."
              : "No records found"}
          </div>
        ) : (
          paginatedData.map((item, index) => {
            const status = getItemStatus(item);
            const canReview =
              (activeTab === "owners" || activeTab === "delivery") &&
              status === "pending";
            const name = item.name || item.username || item.ownerName || "Unknown user";

            return (
              <article className="admin-record-card" key={item._id}>
                <div className="admin-record-head">
                  <div>
                    <span>{getItemRole(item)} record</span>
                    <h3>{String(pageStart + index + 1).padStart(2, "0")}. {name}</h3>
                  </div>
                  <span className={`admin-status admin-status-${status}`}>{status}</span>
                </div>

                <div className="admin-record-id">
                  <span>RECORD ID</span>
                  <strong>#{item._id?.slice(-6).toUpperCase()}</strong>
                </div>

                <div className="admin-record-details">
                  <div>
                    <span>Email</span>
                    <strong>{item.email || "Not provided"}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{item.phone || item.mobile || "Not provided"}</strong>
                  </div>
                  <div>
                    <span>Role</span>
                    <strong>{getItemRole(item)}</strong>
                  </div>
                </div>

                <div className="admin-record-actions">
                  <button
                    className="view"
                    onClick={() => handleAction(activeTab, "View", item._id)}
                  >
                    View Details
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
                  ) : activeTab === "owners" || activeTab === "delivery" ? (
                    <span className="admin-action-note">Review completed</span>
                  ) : null}
                </div>
              </article>
            );
          })
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
            Showing only orders waiting for delivery assignment. Assigned orders move to the delivery dashboard.
          </p>
        </div>
        <span>{data.length} pending</span>
      </div>

      {renderSearch("Search order ID, status, delivery, or address")}

      <div className="order-admin-list">
        {filteredData.length === 0 ? (
          <div className="order-admin-empty">
            {searchTerm ? "No matching orders found." : "No orders waiting for assignment"}
          </div>
        ) : (
          paginatedData.map((order, index) => (
            <div className="order-admin-card" key={order._id}>
              <div className="order-admin-head">
                <div className="order-admin-identity">
                  <div>
                    <span className="order-admin-label">Pending assignment</span>
                    <strong className="order-admin-title">
                      ORDER {String(pageStart + index + 1).padStart(2, "0")}
                    </strong>
                  </div>
                </div>
                <div className="order-admin-summary">
                  <span className="order-admin-status">{order.status}</span>
                </div>
              </div>

              <div className="order-admin-id-strip">
                <span>ORDER ID</span>
                <strong>#{order._id.slice(-6).toUpperCase()}</strong>
              </div>

              <div className="order-admin-quick-info">
                <div>
                  <span>Items</span>
                  <strong>{order.items?.length || 0}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>Rs. {order.totalAmount || 0}</strong>
                </div>
                <div>
                  <span>Delivery</span>
                  <strong>{order.deliveryBoyName || order.deliveryBoyId?.name || "Unassigned"}</strong>
                </div>
              </div>

              <div className="order-admin-items">
                <strong>Items</strong>
                {(order.items || []).map((item, index) => (
                  <p key={`${order._id}-${index}`}>
                    {item.foodId?.name || "Food item"} x {item.quantity}
                  </p>
                ))}
              </div>

              <div className="order-admin-details">
                <div>
                  <span>Address</span>
                  <strong>{order.address || "Not provided"}</strong>
                </div>
                <div>
                  <span>Total Amount</span>
                  <strong>Rs. {order.totalAmount || 0}</strong>
                </div>
                <div>
                  <span>Assigned Delivery</span>
                  <strong>{order.deliveryBoyName || order.deliveryBoyId?.name || "Not assigned"}</strong>
                </div>
              </div>

              <div className="order-admin-actions">
                <div>
                  <span>Assign Delivery Partner</span>
                <select
                  value={assignments[order._id] || ""}
                  onChange={(e) =>
                    setAssignments((prev) => ({ ...prev, [order._id]: e.target.value }))
                  }
                >
                  <option value="">Select delivery boy</option>
                  {approvedDeliveryBoys.map((deliveryBoy) => (
                    <option key={deliveryBoy._id} value={deliveryBoy._id}>
                      {deliveryBoy.name}
                    </option>
                  ))}
                </select>
                </div>
                <button
                  className="approve"
                  onClick={() => handleAssignDelivery(order._id)}
                  disabled={approvedDeliveryBoys.length === 0}
                >
                  {order.deliveryBoyId ? "Reassign" : "Assign"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {renderViewMore()}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <p className="admin-sidebar-note">Manage approvals, users, and delivery workflow.</p>
        <ul>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => openTab("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activeTab === "clients" ? "active" : ""}
            onClick={() => openTab("clients")}
          >
            Clients
          </li>
          <li
            className={activeTab === "owners" ? "active" : ""}
            onClick={() => openTab("owners")}
          >
            Owners
          </li>
          <li
            className={activeTab === "delivery" ? "active" : ""}
            onClick={() => openTab("delivery")}
          >
            Delivery
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => openTab("orders")}
          >
            Orders
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main-content">
        <section className="admin-header-card">
          <p className="admin-kicker">Nutricart Admin</p>
          <h1>
            {activeTab === "dashboard"
              ? "Admin Dashboard"
              : `${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)} Management`}
          </h1>
          <p className="admin-header-text">{tabLabels[activeTab]}</p>
        </section>

        {activeTab === "dashboard" ? (
          <>
            {isLoading ? (
              <div className="admin-empty-state">Loading dashboard...</div>
            ) : (
            <div className="cards">
              <div className="card">
                <h3>Clients</h3>
                <p>{dashboardCounts.clients}</p>
              </div>
              <div className="card">
                <h3>Owners</h3>
                <p>{dashboardCounts.owners}</p>
              </div>
              <div className="card">
                <h3>Delivery</h3>
                <p>{dashboardCounts.delivery}</p>
              </div>
              <div className="card">
                <h3>Orders</h3>
                <p>{dashboardCounts.orders}</p>
              </div>
            </div>
            )}
          </>
        ) : activeTab === "orders" ? (
          isLoading ? <div className="admin-empty-state">Loading orders...</div> : renderOrders()
        ) : (
          isLoading ? <div className="admin-empty-state">Loading data...</div> : renderTable()
        )}
      </main>

      {selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>User Details</h2>
            <p><b>No:</b> #{selectedUser._id?.slice(-6).toUpperCase()}</p>
            <p><b>Name:</b> {selectedUser.name || selectedUser.ownerName}</p>
            <p><b>Email:</b> {selectedUser.email}</p>
            <p><b>Phone:</b> {selectedUser.phone || "-"}</p>
            {formatAddress(selectedUser.address) ? (
              <p><b>Address:</b> {formatAddress(selectedUser.address)}</p>
            ) : null}
            {selectedUser.vehicleType ? <p><b>Vehicle:</b> {selectedUser.vehicleType}</p> : null}
            {selectedUser.licenseNumber ? <p><b>License:</b> {selectedUser.licenseNumber}</p> : null}
            <p><b>Role:</b> {selectedUser.role || "user"}</p>
            <p><b>Status:</b> {selectedUser.status || (selectedUser.isApproved ? "approved" : "pending")}</p>
            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
