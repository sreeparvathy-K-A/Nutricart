import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaChartPie,
  FaPlusCircle,
  FaSignOutAlt,
  FaStore,
  FaUserCircle,
  FaUtensils,
} from "react-icons/fa";

function OwnerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch {
      return {};
    }
  }, []);

  const ownerName = storedUser?.name || "Owner";
  const ownerEmail = storedUser?.email || "owner@nutricart.com";

  const navItems = [
    { label: "Dashboard", path: "/restaurant/dashboard", icon: FaChartPie },
    { label: "My Foods", path: "/owner/my-foods", icon: FaUtensils },
    { label: "Add Food", path: "/owner/add-food", icon: FaPlusCircle },
    { label: "Profile", path: "/owner/profile", icon: FaUserCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("user-auth-changed"));
    navigate("/restaurant/login");
  };

  return (
    <aside className="owner-sidebar">
      <div className="owner-brand">
        <span className="brand-badge"><FaStore /></span>
        <div>
          <p className="brand-kicker">Nutricart</p>
          <h2>Owner Panel</h2>
        </div>
      </div>

      <div className="owner-profile-card">
        <p className="profile-label">Signed in as</p>
        <h3>{ownerName}</h3>
        <span>{ownerEmail}</span>
      </div>

      <nav className="owner-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              className={`owner-nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button className="logout-button" type="button" onClick={handleLogout}>
        <FaSignOutAlt aria-hidden="true" />
        Logout
      </button>
    </aside>
  );
}

export default OwnerSidebar;
