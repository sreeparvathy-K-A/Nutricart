import React, { useEffect, useState } from "react";
import axios from "axios";
import OwnerSidebar from "../components/OwnerSidebar";
import "../CSS-pages/OwnerDashboard.css";
import "../CSS-pages/OwnerProfile.css";

function OwnerProfile() {
  const [user, setUser] = useState({});
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("userInfo") || "null");
    if (data) {
      setUser(data);
    }
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.post("/api/users/update", user);
      const updatedUser = response.data?.user || user;

      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));

      alert("Profile updated");
      setEdit(false);
    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  return (
    <div className="owner-dashboard profile-page">
      <OwnerSidebar />

      <main className="owner-main profile-main">
        <div className="profile-card">
          <div className="profile-card-head">
            <div className="profile-avatar">
              {(user.name || "O").charAt(0).toUpperCase()}
            </div>
            <div>
              <p>Account details</p>
              <h2>Owner Profile</h2>
              <span>Keep your restaurant information accurate and up to date.</span>
            </div>
          </div>

          <div className="profile-fields">
            <label>
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={user.name || ""}
                disabled={!edit}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>Email</span>
              <input type="email" name="email" value={user.email || ""} disabled />
            </label>

            <label>
              <span>Phone</span>
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={user.phone || ""}
                disabled={!edit}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>Restaurant Name</span>
              <input
                type="text"
                name="hotel"
                placeholder="Restaurant name"
                value={user.hotel || ""}
                disabled={!edit}
                onChange={handleChange}
              />
            </label>

            <label className="profile-field-wide">
              <span>Address</span>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={user.address || ""}
                disabled={!edit}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="profile-actions">
            {!edit ? (
              <button onClick={() => setEdit(true)}>Edit Profile</button>
            ) : (
              <>
                <button className="save" onClick={handleUpdate}>Save Changes</button>
                <button className="cancel" onClick={() => setEdit(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OwnerProfile;
