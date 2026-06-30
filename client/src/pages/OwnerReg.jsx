import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS-pages/OwnerReg.css";
import ownerBg from "../assets/images/OwnerReg.jpg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

const createLegacyShopPlaceholder = () => {
  const binary = atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: "image/png" });
};

function OwnerReg() {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    restaurantAddress: "",
    city: "",
    restaurantType: "Both",
    deliveryRadius: "",
    fssaiNumber: "",
  });
  const [files, setFiles] = useState({
    ownerPhoto: null,
    licenseImage: null,
  });
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.ownerName.trim().length < 2) {
      alert("Owner name must be at least 2 characters");
      return;
    }

    if (form.businessName.trim().length < 2) {
      alert("Restaurant name must be at least 2 characters");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      setStep(1);
      return;
    }

    if (!form.fssaiNumber || form.fssaiNumber.length < 5) {
      alert("Enter valid FSSAI number");
      return;
    }

    if (!form.restaurantAddress || !form.city || !form.deliveryRadius) {
      alert("Complete all restaurant details");
      return;
    }

    if (!files.licenseImage) {
      alert("License image required");
      return;
    }

    if (!files.ownerPhoto) {
      alert("Owner photo required");
      setStep(1);
      return;
    }

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key !== "confirmPassword") formData.append(key, form[key]);
    });

    formData.append("street", form.restaurantAddress);
    if (files.ownerPhoto) {
      formData.append("ownerPhoto", files.ownerPhoto);
      // Backward compatibility for the currently deployed API, which still
      // expects a shopImage. Use a tiny placeholder instead of uploading the
      // full owner photo twice.
      formData.append("shopImage", createLegacyShopPlaceholder(), "shop-placeholder.png");
    }
    formData.append("licenseImage", files.licenseImage);

    try {
      setIsSubmitting(true);
      setSubmitMessage("Uploading documents and creating your account...");

      const response = await fetch(`${API_BASE_URL}/api/registerOwner`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registered successfully. Wait for admin approval.");

      setForm({
        businessName: "",
        ownerName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        restaurantAddress: "",
        city: "",
        restaurantType: "Both",
        deliveryRadius: "",
        fssaiNumber: "",
      });

      setFiles({
        ownerPhoto: null,
        licenseImage: null,
      });

      navigate("/restaurant/login");
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setIsSubmitting(false);
      setSubmitMessage("");
    }
  };

  return (
    <div className="ownerreg-page" style={{ backgroundImage: `url(${ownerBg})` }}>
      <div className="ownerreg-overlay" />

      <div className="ownerreg-shell">
        <div className="owner-form">
          <div className="ownerreg-head">
            <p className="ownerreg-kicker">Restaurant Partner</p>
            <h2>Owner Registration</h2>
            <p>Enter your business details and documents for admin approval.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="owner-section-title full">
                <span>Step {step} of 2 — {step === 1 ? "Owner Details" : "Restaurant Details"}</span>
              </div>
              {step === 1 ? <>
                <div className="owner-field"><label>Full Name *</label><input name="ownerName" value={form.ownerName} onChange={handleChange} required /></div>
                <div className="owner-field"><label>Email Address *</label><input type="email" name="email" value={form.email} onChange={handleChange} required /></div>
                <div className="owner-field"><label>Mobile Number *</label><input name="phone" maxLength="10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} required /></div>
                <div className="owner-field"><label>Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} required /></div>
                <div className="owner-field"><label>Confirm Password *</label><input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required /></div>
                <div className="owner-field file-field"><label>Owner Photo *</label><input type="file" name="ownerPhoto" accept="image/*" onChange={handleFileChange} required /></div>
              </> : <>
                <div className="owner-field"><label>Restaurant Name *</label><input name="businessName" value={form.businessName} onChange={handleChange} required /></div>
                <div className="owner-field"><label>City *</label><input name="city" value={form.city} onChange={handleChange} required /></div>
                <div className="owner-field full"><label>Restaurant Address *</label><input name="restaurantAddress" value={form.restaurantAddress} onChange={handleChange} required /></div>
                <div className="owner-field"><label>Restaurant Type *</label><select name="restaurantType" value={form.restaurantType} onChange={handleChange}><option>Veg</option><option>Non-Veg</option><option>Both</option></select></div>
                <div className="owner-field"><label>Delivery Radius *</label><input name="deliveryRadius" placeholder="e.g., 5 km" value={form.deliveryRadius} onChange={handleChange} required /></div>
                <div className="owner-field"><label>FSSAI License Number *</label><input name="fssaiNumber" value={form.fssaiNumber} onChange={handleChange} required /></div>
                <div className="owner-field file-field"><label>FSSAI License Document *</label><input type="file" name="licenseImage" accept="image/*,.pdf,application/pdf" onChange={handleFileChange} required /></div>
              </>}
            </div>
            <div className="owner-step-actions">
              {step === 2 && <button type="button" className="owner-secondary-btn" onClick={() => setStep(1)}>Back</button>}
              {step === 1 ? <button type="button" className="owner-primary-btn" onClick={() => {
                if (!form.ownerName || !form.email || form.phone.length !== 10 || form.password.length < 6 || form.password !== form.confirmPassword || !files.ownerPhoto) return alert("Complete the owner details, upload an owner photo, and ensure passwords match");
                setStep(2);
              }}>Next</button> : <button type="submit" className="owner-primary-btn" disabled={isSubmitting}>{isSubmitting ? "Uploading..." : "Register"}</button>}
            </div>
            {submitMessage ? <p className="owner-submit-message" role="status">{submitMessage}</p> : null}
          </form>

          <div className="ownerreg-footer">
            <span>Already have access?</span>
            <Link to="/restaurant/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerReg;
