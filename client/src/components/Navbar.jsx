import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaSignInAlt, FaUserCircle, FaUserPlus } from "react-icons/fa";
import "../CSS-pages/Navbar.css";
import logoImg from "../assets/images/logo.png";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const role = user?.role?.toLowerCase?.() || "";
  const showGuestNav = !user;

  const moduleLinks = {
    admin: [{ to: "/admin/dashboard", label: "Admin Dashboard" }],
    client: [{ to: "/client-dashboard", label: "Client Dashboard" }],
    owner: [
      { to: "/restaurant/dashboard", label: "Restaurant Dashboard" },
      { to: "/owner/my-foods", label: "My Foods" },
      { to: "/owner/add-food", label: "Add Food" },
    ],
    delivery: [{ to: "/delivery/dashboard", label: "Delivery Dashboard" }],
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
            Food Items
          </Link>
          
          <Link to="/cart" className="nav-icon-link nav-cart-link" aria-label="Cart">
            <FaShoppingCart />
            <span>Cart</span>
          </Link>

          {showGuestNav ? (
            <div className="dropdown auth-dropdown">
              <button
                type="button"
                className="account-icon-btn"
                onClick={() => setOpen(!open)}
                aria-label="Open login and registration menu"
                aria-expanded={open}
              >
                <FaUserCircle />
              </button>

              <ul className={`dropdown-menu auth-menu ${open ? "show" : ""}`}>
                <li>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <FaSignInAlt />
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <FaUserPlus />
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <div className="dropdown profile-dropdown">
              <button
                type="button"
                className="profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Open account menu"
                aria-expanded={profileOpen}
              >
                <FaUserCircle className="profile-trigger-icon" />
                <span className="profile-trigger-text">
                  <small>{role === "admin" ? "Admin" : role || "User"}</small>
                  <strong>{user.name || (role === "admin" ? "Admin" : "User")}</strong>
                </span>
              </button>

              <ul className={`dropdown-menu ${profileOpen ? "show" : ""}`}>
                <li>
                  <Link to="/">Home</Link>
                </li>
                {(moduleLinks[role] || []).map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
