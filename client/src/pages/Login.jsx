import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBg from "../assets/images/login-img.jpg";
import "../CSS-pages/Login.css";

const roleRoutes = {
  admin: "/admin-dashboard",
  client: "/client-dashboard",
  owner: "/owner",
  delivery: "/delivery-dashboard",
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");

    if (!storedUser || storedUser === "undefined") return;

    try {
      const user = JSON.parse(storedUser);
      const role = user?.role?.toLowerCase?.().trim?.();

      if (roleRoutes[role]) {
        navigate(roleRoutes[role], { replace: true });
      }
    } catch {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        localStorage.setItem("token", data.token || "");
        window.dispatchEvent(new Event("user-auth-changed"));
        const role = data.user?.role?.toLowerCase?.().trim?.();
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

  return (
    <div className="auth-page login-page" style={{ backgroundImage: `url(${loginBg})` }}>
      <div className="auth-overlay" />

      <div className="auth-shell">
        <section
          className="auth-showcase"
          style={{
            backgroundImage: `linear-gradient(155deg, rgba(9, 73, 58, 0.82), rgba(11, 35, 30, 0.64)), url(${loginBg})`,
          }}
        >
          <p className="auth-kicker">Nutricart Access</p>
          <h1>Sign in to continue to your Nutricart dashboard.</h1>
          <p className="auth-copy">Access your role dashboard and manage your work in one place.</p>
        </section>

        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-card-head">
            <p className="auth-eyebrow">Welcome back</p>
            <h2>Login</h2>
            <span>Use your registered account to continue.</span>
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
            <span>New to Nutricart?</span>
            <Link to="/register-client">Create client account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
