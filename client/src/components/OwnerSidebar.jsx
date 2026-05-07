import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
    { label: "Dashboard", path: "/owner" },
    { label: "My Foods", path: "/owner/my-foods" },
    { label: "Add Food", path: "/owner/add-food" },
    { label: "Profile", path: "/owner/profile" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="owner-sidebar">
      <div className="owner-brand">
        <span className="brand-badge">NC</span>
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

          return (
            <button
              key={item.path}
              type="button"
              className={`owner-nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <button className="logout-button" type="button" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default OwnerSidebar;
