import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS-pages/OwnerReg.css";
import ownerBg from "../assets/images/OwnerReg.jpg";

function OwnerReg() {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    fssaiNumber: "",
  });
  const [files, setFiles] = useState({
    ownerPhoto: null,
    shopImage: null,
    licenseImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[A-Za-z ]{2,}$/.test(form.ownerName)) {
      alert("Owner name must be at least 2 letters");
      return;
    }

    if (!/^[A-Za-z ]{2,}$/.test(form.businessName)) {
      alert("Hotel name must be at least 2 letters");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pincode)) {
      alert("Pincode must be exactly 6 digits");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (!form.fssaiNumber || form.fssaiNumber.length < 5) {
      alert("Enter valid FSSAI number");
      return;
    }

    if (!files.ownerPhoto) {
      alert("Owner photo required");
      return;
    }

    if (!files.shopImage) {
      alert("Shop image required");
      return;
    }

    if (!files.licenseImage) {
      alert("License image required");
      return;
    }

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    formData.append("ownerPhoto", files.ownerPhoto);
    formData.append("shopImage", files.shopImage);
    formData.append("licenseImage", files.licenseImage);

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:5000/api/registerOwner", {
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
        street: "",
        city: "",
        state: "",
        pincode: "",
        fssaiNumber: "",
      });

      setFiles({
        ownerPhoto: null,
        shopImage: null,
        licenseImage: null,
      });

      navigate("/restaurant/login");
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setIsSubmitting(false);
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
                <span>Business Details</span>
              </div>

              <div className="owner-field">
                <label htmlFor="businessName">Hotel Name</label>
                <input
                  id="businessName"
                  name="businessName"
                  placeholder="Enter hotel name"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="owner-field">
                <label htmlFor="ownerName">Owner Name</label>
                <input
                  id="ownerName"
                  name="ownerName"
                  placeholder="Enter owner name"
                  value={form.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="owner-field">
                <label htmlFor="ownerEmail">Email</label>
                <input
                  id="ownerEmail"
                  type="email"
                  name="email"
                  placeholder="business@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="owner-field">
                <label htmlFor="ownerPhone">Phone</label>
                <input
                  id="ownerPhone"
                  name="phone"
                  placeholder="10 digit phone"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setForm({ ...form, phone: value });
                  }}
                  maxLength="10"
                  required
                />
              </div>

              <div className="owner-field">
                <label htmlFor="ownerPassword">Password</label>
                <input
                  id="ownerPassword"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="owner-field">
                <label htmlFor="fssaiNumber">FSSAI Number</label>
                <input
                  id="fssaiNumber"
                  name="fssaiNumber"
                  placeholder="Enter FSSAI number"
                  value={form.fssaiNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="owner-section-title full">
                <span>Location</span>
              </div>

              <div className="owner-field">
                <label htmlFor="ownerStreet">Street Address</label>
                <input
                  id="ownerStreet"
                  name="street"
                  placeholder="Street and landmark"
                  value={form.street}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="owner-field">
                <label htmlFor="ownerCity">City</label>
                <input
                  id="ownerCity"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="owner-field">
                <label htmlFor="ownerState">State</label>
                <input
                  id="ownerState"
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="owner-field full">
                <label htmlFor="ownerPincode">Pincode</label>
                <input
                  id="ownerPincode"
                  name="pincode"
                  placeholder="6 digit pincode"
                  value={form.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setForm({ ...form, pincode: value });
                  }}
                  maxLength="6"
                  required
                />
              </div>

              <div className="owner-section-title full">
                <span>Documents</span>
              </div>

              <div className="owner-field file-field">
                <label htmlFor="ownerPhoto">Owner Photo</label>
                <input id="ownerPhoto" type="file" name="ownerPhoto" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="owner-field file-field">
                <label htmlFor="shopImage">Shop Image</label>
                <input id="shopImage" type="file" name="shopImage" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="owner-field full file-field">
                <label htmlFor="licenseImage">License Image</label>
                <input
                  id="licenseImage"
                  type="file"
                  name="licenseImage"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <button type="submit" className="full owner-primary-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Register"}
            </button>
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
