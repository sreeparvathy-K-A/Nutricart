import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../CSS-pages/Navbar.css";
import logoImg from "../assets/images/logo.png";

function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const role = user?.role?.toLowerCase?.() || "";
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register-client" ||
    location.pathname === "/register-owner" ||
    location.pathname === "/register-delivery";
  const showGuestNav = !user || isAuthPage;

  const moduleLinks = {
    admin: [{ to: "/admin-dashboard", label: "Admin Dashboard" }],
    client: [{ to: "/client-dashboard", label: "Client Dashboard" }],
    owner: [
      { to: "/owner", label: "Owner Dashboard" },
      { to: "/owner/my-foods", label: "My Foods" },
      { to: "/owner/add-food", label: "Add Food" },
    ],
    delivery: [{ to: "/delivery-dashboard", label: "Delivery Dashboard" }],
  };

  useEffect(() => {
    const syncUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("userInfo") || "null");
        setUser(storedUser);
      } catch {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("user-auth-changed", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("user-auth-changed", syncUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("user-auth-changed"));
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-left">
          <img src={logoImg} alt="Nutricart logo" className="logo-img" />
          <h2 className="logo-text">Nutricart</h2>
        </div>

        <div className="nav-right" ref={dropdownRef}>
          <Link to="/" className="nav-item">
            Home
          </Link>
          <Link to="/menu" className="nav-item">
            Menu
          </Link>

          {showGuestNav ? (
            <>
              <Link to="/login" className="nav-item nav-item-outline">
                Login
              </Link>

              <div className="dropdown">
                <span className="nav-item nav-item-solid" onClick={() => setOpen(!open)}>
                  Register
                </span>
                <ul className={`dropdown-menu ${open ? "show" : ""}`}>
                  <li>
                    <Link to="/register-client">Client</Link>
                  </li>
                  <li>
                    <Link to="/register-owner">Owner</Link>
                  </li>
                  <li>
                    <Link to="/register-delivery">Delivery Boy</Link>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="dropdown">
              <span className="nav-item nav-item-solid" onClick={() => setProfileOpen(!profileOpen)}>
                {user.name || "Profile"}
              </span>

              <ul className={`dropdown-menu ${profileOpen ? "show" : ""}`}>
                <li>
                  <Link to="/">Home</Link>
                </li>
                {(moduleLinks[role] || []).map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
                <li>
                  <span onClick={handleLogout}>Logout</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
