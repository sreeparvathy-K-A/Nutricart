import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/images/login-img.jpg";
import "../CSS-pages/admin-Login.css";

const API_BASE_URL = "";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (!storedUser || storedUser === "undefined") return;

    try {
      const user = JSON.parse(storedUser);
      if (user?.role?.toLowerCase?.().trim?.() === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter admin email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/api/users/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.user?.role === "admin") {
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        localStorage.setItem("token", data.token || "");
        window.dispatchEvent(new Event("user-auth-changed"));
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      alert(data.message || "Admin login failed.");
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Backend server is not running. Please start the server and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-auth-page" style={{ backgroundImage: `url(${loginBg})` }}>
      <div className="admin-auth-overlay" />

      <section className="admin-auth-shell">
        <aside className="admin-auth-panel">
          <p className="admin-auth-kicker">Nutricart Admin</p>
          <div>
            <h1>Control Center</h1>
            <p>Approve partners, manage users, track orders, and keep Nutricart running smoothly.</p>
          </div>
          <div className="admin-auth-metrics">
            <span>Approvals</span>
            <span>Orders</span>
            <span>Analytics</span>
          </div>
        </aside>

        <form className="admin-auth-card" onSubmit={handleLogin}>
          <div className="admin-auth-head">
            <p>Secure Access</p>
            <h2>Admin login</h2>
            <span>Enter your authorized administrator credentials to continue.</span>
          </div>

          <div className="admin-auth-field">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@nutricart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-auth-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="admin-auth-btn" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Login to Admin Panel"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
