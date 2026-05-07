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
      const response = await axios.post("http://localhost:5000/api/users/update", user);
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
          <h2>Owner Profile</h2>

          <input
            type="text"
            name="name"
            value={user.name || ""}
            disabled={!edit}
            onChange={handleChange}
          />

          <input type="email" name="email" value={user.email || ""} disabled />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={user.phone || ""}
            disabled={!edit}
            onChange={handleChange}
          />

          <input
            type="text"
            name="hotel"
            placeholder="Hotel Name"
            value={user.hotel || ""}
            disabled={!edit}
            onChange={handleChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={user.address || ""}
            disabled={!edit}
            onChange={handleChange}
          />

          {!edit ? (
            <button onClick={() => setEdit(true)}>Edit</button>
          ) : (
            <>
              <button className="save" onClick={handleUpdate}>
                Save
              </button>
              <button className="cancel" onClick={() => setEdit(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerProfile;
