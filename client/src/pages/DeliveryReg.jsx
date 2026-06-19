import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS-pages/DeliveryboyReg.css";
import deliveryBg from "../assets/images/deliveryreg.jpg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

function DeliveryBoyReg() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (!/^[A-Za-z ]{2,}$/.test(form.name)) err.name = "Name must be at least 2 letters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
    if (!/^[0-9]{10}$/.test(form.phone)) err.phone = "Phone must be 10 digits";
    if (form.password.length < 6) err.password = "Password must be at least 6 characters";
    if (!form.address.trim()) err.address = "Address required";
    if (!form.vehicleType) err.vehicleType = "Select vehicle type";
    if (!form.vehicleNumber.trim()) err.vehicleNumber = "Vehicle number required";
    if (!form.licenseNumber.trim()) err.licenseNumber = "License number required";
    if (!photo) err.photo = "Photo required";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    formData.append("photo", photo);

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/api/delivery/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registered successfully. Wait for admin approval.");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        vehicleType: "",
        vehicleNumber: "",
        licenseNumber: "",
      });
      setPhoto(null);
      setErrors({});
      navigate("/delivery/login");
    } catch (err) {
      console.error("Delivery registration error:", err);
      alert("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="deliveryreg-page" style={{ backgroundImage: `url(${deliveryBg})` }}>
      <div className="deliveryreg-overlay" />

      <div className="deliveryreg-shell">
        <section
          className="deliveryreg-showcase"
          style={{
            backgroundImage: `linear-gradient(155deg, rgba(16, 93, 99, 0.82), rgba(10, 37, 40, 0.64)), url(${deliveryBg})`,
          }}
        >
          <p className="deliveryreg-kicker">Delivery Registration</p>
          <h1>Join delivery with a shorter setup made for quick approval.</h1>
          <p className="deliveryreg-copy">
            Add rider info, vehicle details, and a photo in one simple registration flow.
          </p>
          <div className="deliveryreg-badges">
            <span>Rider profile</span>
            <span>Vehicle info</span>
            <span>Photo check</span>
          </div>

          <div className="deliveryreg-note-card">
            <strong>Ready to move faster</strong>
            <p>Complete data helps the team verify your account and activate delivery access.</p>
          </div>
        </section>

        <form className="delivery-form" onSubmit={handleSubmit}>
          <div className="deliveryreg-head">
            <h2>Create Delivery Account</h2>
            <p>Fill in the required details below.</p>
          </div>

          <div className="delivery-grid">
            <div className="delivery-section-title span-2">
              <span>Partner Details</span>
            </div>

            <div className="delivery-field">
              <label htmlFor="delivery-name">Full Name</label>
              <input
                id="delivery-name"
                name="name"
                value={form.name}
                placeholder="Enter full name"
                onChange={handleChange}
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </div>

            <div className="delivery-field">
              <label htmlFor="delivery-email">Email</label>
              <input
                id="delivery-email"
                type="email"
                name="email"
                value={form.email}
                placeholder="name@example.com"
                onChange={handleChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="delivery-field">
              <label htmlFor="delivery-phone">Phone</label>
              <input
                id="delivery-phone"
                name="phone"
                value={form.phone}
                placeholder="10 digit phone"
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                maxLength="10"
              />
              {errors.phone && <p className="error">{errors.phone}</p>}
            </div>

            <div className="delivery-field">
              <label htmlFor="delivery-password">Password</label>
              <input
                id="delivery-password"
                type="password"
                name="password"
                value={form.password}
                placeholder="Create a password"
                onChange={handleChange}
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <div className="delivery-field span-2">
              <label htmlFor="delivery-address">Address</label>
              <input
                id="delivery-address"
                name="address"
                value={form.address}
                placeholder="Current address"
                onChange={handleChange}
              />
              {errors.address && <p className="error">{errors.address}</p>}
            </div>

            <div className="delivery-section-title span-2">
              <span>Vehicle Details</span>
            </div>

            <div className="delivery-field">
              <label htmlFor="vehicleType">Vehicle Type</label>
              <select id="vehicleType" name="vehicleType" value={form.vehicleType} onChange={handleChange}>
                <option value="">Select Vehicle</option>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
              </select>
              {errors.vehicleType && <p className="error">{errors.vehicleType}</p>}
            </div>

            <div className="delivery-field">
              <label htmlFor="vehicleNumber">Vehicle Number</label>
              <input
                id="vehicleNumber"
                name="vehicleNumber"
                value={form.vehicleNumber}
                placeholder="Enter vehicle number"
                onChange={handleChange}
              />
              {errors.vehicleNumber && <p className="error">{errors.vehicleNumber}</p>}
            </div>

            <div className="delivery-field span-2">
              <label htmlFor="licenseNumber">License Number</label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                value={form.licenseNumber}
                placeholder="Enter license number"
                onChange={handleChange}
              />
              {errors.licenseNumber && <p className="error">{errors.licenseNumber}</p>}
            </div>

            <div className="delivery-field span-2 file-field">
              <label htmlFor="delivery-photo">Upload Photo</label>
              <input id="delivery-photo" type="file" onChange={(e) => setPhoto(e.target.files[0])} />
              {errors.photo && <p className="error">{errors.photo}</p>}
            </div>
          </div>

          <button type="submit" className="delivery-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Register"}
          </button>

          <div className="deliveryreg-footer">
            <span>Already have access?</span>
            <Link to="/delivery/login">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeliveryBoyReg;
