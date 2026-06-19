import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import registerBg from "../assets/images/user-reg-img.jpg";
import "../CSS-pages/ClientReg.css";

function ClientReg() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setForm((prev) => ({ ...prev, phone: value }));
      }
      return;
    }

    if (name === "pincode") {
      if (/^\d{0,6}$/.test(value)) {
        setForm((prev) => ({ ...prev, pincode: value }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.phone.length !== 10) {
      alert("Phone must be exactly 10 digits.");
      return;
    }
    if (form.pincode.length !== 6) {
      alert("Pincode must be exactly 6 digits.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      alert("Enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.post("/api/clients", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        dob: form.dob,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
      });

      alert("Registration successful.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response ? err.response.data : err);
      alert(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="clientreg-page" style={{ backgroundImage: `url(${registerBg})` }}>
      <div className="clientreg-overlay" />

      <div className="clientreg-shell">
        <section
          className="clientreg-showcase"
          style={{
            backgroundImage: `linear-gradient(155deg, rgba(12, 83, 60, 0.82), rgba(10, 34, 29, 0.64)), url(${registerBg})`,
          }}
        >
          <p className="clientreg-kicker">Client Registration</p>
          <h1>Create your client account in a quick and clean way.</h1>
          <p className="clientreg-copy">
            Add your details once so ordering, delivery, and login feel simple every time.
          </p>

          <div className="clientreg-badges">
            <span>Personal details</span>
            <span>Address setup</span>
            <span>Fast checkout start</span>
          </div>

          <div className="clientreg-note-card">
            <strong>What you get</strong>
            <p>Save your address, log in faster, and start exploring meals from home.</p>
          </div>
        </section>

        <div className="clientreg-card">
          <div className="clientreg-head">
            <h2>Create Account</h2>
            <p>Enter your personal and delivery details below.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="clientreg-grid">
              <div className="input-group span-2">
                <label htmlFor="client-name">Full Name</label>
                <input
                  id="client-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="input-group span-2">
                <label htmlFor="client-email">Email</label>
                <input
                  id="client-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="client-phone">Phone Number</label>
                <input
                  id="client-phone"
                  type="text"
                  name="phone"
                  value={form.phone}
                  maxLength="10"
                  onChange={handleChange}
                  placeholder="10 digit number"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="client-password">Password</label>
                <input
                  id="client-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="input-group span-2">
                <label htmlFor="client-dob">Date of Birth</label>
                <input
                  id="client-dob"
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group span-2 section-label">
                <span>Delivery Address</span>
              </div>

              <div className="input-group span-2">
                <label htmlFor="client-street">Street / House</label>
                <input
                  id="client-street"
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="House no, street, landmark"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="client-city">City</label>
                <input
                  id="client-city"
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="client-state">State</label>
                <input
                  id="client-state"
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
              </div>

              <div className="input-group span-2">
                <label htmlFor="client-pincode">Pincode</label>
                <input
                  id="client-pincode"
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  maxLength="6"
                  onChange={handleChange}
                  placeholder="6 digit pincode"
                  required
                />
              </div>
            </div>

            <button type="submit" className="clientreg-primary-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="clientreg-footer">
            <span>Already registered?</span>
            <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientReg;
