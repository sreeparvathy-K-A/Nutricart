import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import loginBg from "../assets/images/login-img.jpg";
import "../CSS-pages/Login.css";

const roleRoutes = {
  admin: "/admin/dashboard",
  client: "/client-dashboard",
  owner: "/restaurant/dashboard",
  delivery: "/delivery/dashboard",
};

function Login({ mode = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLogin = mode === "admin" || location.pathname === "/admin/login";
  const isOwnerLogin = mode === "owner" || location.pathname === "/restaurant/login";
  const isDeliveryLogin = mode === "delivery" || location.pathname === "/delivery/login";
  const isClientLogin = mode === "client" || location.pathname === "/login" || location.pathname === "/client-login";

  const expectedRole = isAdminLogin
    ? "admin"
    : isOwnerLogin
      ? "owner"
      : isDeliveryLogin
        ? "delivery"
        : isClientLogin
          ? "client"
          : "";

  const loginEndpoint = isAdminLogin ? "admin-login" : isClientLogin ? "client-login" : "login";

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (!storedUser || storedUser === "undefined") return;

    try {
      const user = JSON.parse(storedUser);
      const role = user?.role?.toLowerCase?.().trim?.();

      if ((!expectedRole || role === expectedRole) && roleRoutes[role]) {
        navigate(roleRoutes[role], { replace: true });
      }
    } catch {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    }
  }, [expectedRole, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`http://localhost:5000/api/users/${loginEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        const role = data.user?.role?.toLowerCase?.().trim?.();

        if (expectedRole && role !== expectedRole) {
          alert("Please use the correct login page for this account.");
          return;
        }

        localStorage.setItem("userInfo", JSON.stringify(data.user));
        localStorage.setItem("token", data.token || "");
        window.dispatchEvent(new Event("user-auth-changed"));
        navigate(roleRoutes[role] || "/", { replace: true });
        return;
      }

      alert(data.message || "Login failed.");
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to login right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageLabel = isAdminLogin
    ? "Nutricart Admin"
    : isOwnerLogin
      ? "Restaurant Owner"
      : isDeliveryLogin
        ? "Delivery Partner"
        : "Nutricart Customer";

  const title = isAdminLogin
    ? "Admin Login"
    : isOwnerLogin
      ? "Owner Login"
      : isDeliveryLogin
        ? "Delivery Login"
        : "Customer Login";

  const headline = isAdminLogin
    ? "Sign in to manage Nutricart operations."
    : isOwnerLogin
      ? "Sign in to manage your restaurant."
      : isDeliveryLogin
        ? "Sign in to manage assigned deliveries."
        : "Sign in to order healthy meals.";

  const description = isAdminLogin
    ? "Use your admin account to review users, approvals, orders, and delivery work."
    : isOwnerLogin
      ? "Use your approved restaurant account to manage food items, orders, and earnings."
      : isDeliveryLogin
        ? "Use your approved delivery account to view assigned orders and update status."
        : "Use your customer account to manage your cart, checkout, and order history.";

  const statItems = isAdminLogin
    ? ["Approvals", "Orders", "Analytics"]
    : isOwnerLogin
      ? ["Menu", "Orders", "Earnings"]
      : isDeliveryLogin
        ? ["Assigned", "Picked", "Delivered"]
        : ["Browse", "Cart", "Orders"];

  const pageClassName = [
    "auth-page",
    "login-page",
    isAdminLogin ? "admin-login-page" : "",
    isOwnerLogin ? "restaurant-login-page" : "",
    isDeliveryLogin ? "delivery-login-page" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={pageClassName} style={{ backgroundImage: `url(${loginBg})` }}>
      <div className="auth-overlay" />

      <div className="auth-shell">
        <section
          className="auth-showcase"
          style={{
            backgroundImage: `linear-gradient(155deg, rgba(9, 73, 58, 0.82), rgba(11, 35, 30, 0.64)), url(${loginBg})`,
          }}
        >
          <p className="auth-kicker">{pageLabel}</p>
          <div>
            <h1>{headline}</h1>
            <p className="auth-copy">{description}</p>
          </div>
          <div className="auth-stat-row">
            {statItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-card-head">
            <p className="auth-eyebrow">Welcome back</p>
            <h2>{title}</h2>
            <span>Enter your account credentials to continue.</span>
          </div>

          <div className="auth-field">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>

          <div className="auth-footer-links">
            {isOwnerLogin ? (
              <>
                <span>Need restaurant access?</span>
                <Link to="/restaurant/register-request">Become a Restaurant Partner</Link>
              </>
            ) : isDeliveryLogin ? (
              <>
                <span>Need delivery access?</span>
                <Link to="/delivery/register-request">Become a Delivery Partner</Link>
              </>
            ) : isAdminLogin ? (
              <>
                <span>Signing in as a customer?</span>
                <Link to="/login">Customer Login</Link>
              </>
            ) : (
              <>
                <span>Don't have an account?</span>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>

          {!isAdminLogin && !isOwnerLogin ? (
            <div className="auth-footer-links auth-secondary-links">
              {isClientLogin ? (
                <>
                  <Link to="/restaurant/login">Restaurant Login</Link>
                  <Link to="/delivery/login">Delivery Login</Link>
                </>
              ) : (
                <Link to="/login">Customer Login</Link>
              )}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

export default Login;
