


// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";
// import ClientReg from "./pages/ClientReg";
// import Login from "./pages/Login";
// import Cart from "./pages/Cart";
// import OwnerReg from "./pages/OwnerReg";
// import DeliveryBoyReg from "./pages/DeliveryReg";
// import Menu from "./pages/Menu";
// import AdminDashboard from "./pages/AdminDashboard";
// import ClientDashboard from "./pages/ClientDashboard";
// import OwnerDashboard from "./pages/OwnerDashboard";
// import AddFood from "./pages/AddFood";
// import OwnerMyFoods from "./pages/MyFoods";


// function App() {
//   const [userInfo, setUserInfo] = useState(null);

//   // ✅ FIX: re-read localStorage properly
//   useEffect(() => {
//     const data = localStorage.getItem("userInfo");

//     try {
//       setUserInfo(data ? JSON.parse(data) : null);
//     } catch (err) {
//       console.log("Invalid userInfo");
//       setUserInfo(null);
//     }
//   }, []);

//   // ✅ SAFE ROLE
//   const role = userInfo?.role?.toLowerCase()?.trim();

//   return (
//     <>
//       <Navbar />

//       <Routes>
//         {/* ================= HOME ================= */}
//         <Route path="/" element={<Home />} />

//         {/* ================= LOGIN ================= */}
//         <Route path="/login" element={<Login />} />

//         {/* ================= REGISTER ================= */}
//         <Route path="/register-client" element={<ClientReg />} />
//         <Route path="/register-owner" element={<OwnerReg />} />
//         <Route path="/register-delivery" element={<DeliveryBoyReg />} />

//         {/* ================= ADMIN ================= */}
//         <Route
//           path="/admin-dashboard"
//           element={
//             role === "admin" ? (
//               <AdminDashboard />
//             ) : (
//               <Navigate to="/login" />
//             )
//           }
//         />

//         {/* ================= CLIENT ================= */}
//         <Route
//           path="/client-dashboard"
//           element={
//             role === "client" ? (
//               <ClientDashboard />
//             ) : (
//               <Navigate to="/login" />
//             )
//           }
//         />

//         {/* ================= OWNER ================= */}
//         <Route
//           path="/owner"
//           element={
//             role === "owner" ? (
//               <OwnerDashboard />
//             ) : (
//               <Navigate to="/login" />
//             )
//           }
//         />

//         {/* ================= ADD FOOD (OWNER ONLY) ================= */}
//         <Route
//           path="/owner/add-food"
//           element={
//             role === "owner" ? (
//               <AddFood />
//             ) : (
//               <Navigate to="/login" />
//             )
//           }
//         />

//         {/* ================= COMMON ================= */}
//         <Route path="/cart" element={<Cart />} />
//         <Route path="/menu" element={<Menu />} />

//         {/* ================= FALLBACK ================= */}
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ClientReg from "./pages/ClientReg";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Cart from "./pages/Cart";
import OwnerReg from "./pages/OwnerReg";
import DeliveryBoyReg from "./pages/DeliveryReg";
import Menu from "./pages/Menu";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddFood from "./pages/AddFood";
import OwnerMyFood from "./pages/MyFood";
import OwnerProfile from "./pages/OwnerProfile";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import StaticPage from "./pages/StaticPage";

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const location = useLocation();

  // 🔥 FIX: auto update when login changes
  useEffect(() => {
    const syncUser = () => {
      const data = localStorage.getItem("userInfo");
      try {
        setUserInfo(data ? JSON.parse(data) : null);
      } catch {
        setUserInfo(null);
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

  const role = userInfo?.role?.toLowerCase()?.trim();
  const showFooter = !location.pathname.startsWith("/admin");

  return (
    <>
      <Navbar />

      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Menu />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login mode="client" />} />
        <Route path="/client-login" element={<Navigate to="/login" replace />} />
        <Route path="/restaurant/login" element={<Login mode="owner" />} />
        <Route path="/delivery/login" element={<Login mode="delivery" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />

        {/* REGISTER */}
        <Route path="/register" element={<ClientReg />} />
        <Route path="/register-client" element={<Navigate to="/register" replace />} />
        <Route path="/restaurant/register-request" element={<OwnerReg />} />
        <Route path="/register-owner" element={<Navigate to="/restaurant/register-request" replace />} />
        <Route path="/delivery/register-request" element={<DeliveryBoyReg />} />
        <Route path="/register-delivery" element={<Navigate to="/delivery/register-request" replace />} />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            role === "admin" ? <AdminDashboard /> : <Navigate to="/admin/login" />
          }
        />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* CLIENT */}
        <Route
          path="/client-dashboard"
          element={
            role === "client" ? <ClientDashboard /> : <Navigate to="/login" />
          }
        />

        {/* OWNER DASHBOARD */}
        <Route
          path="/restaurant/dashboard"
          element={
            role === "owner" ? <OwnerDashboard /> : <Navigate to="/restaurant/login" />
          }
        />
        <Route path="/owner" element={<Navigate to="/restaurant/dashboard" replace />} />
        <Route
          path="/delivery/dashboard"
          element={
            role === "delivery" ? <DeliveryDashboard /> : <Navigate to="/delivery/login" />
          }
        />
        <Route path="/delivery-dashboard" element={<Navigate to="/delivery/dashboard" replace />} />

        {/* ADD FOOD */}
        <Route
          path="/owner/add-food"
          element={
            role === "owner" ? <AddFood /> : <Navigate to="/restaurant/login" />
          }
        />

        {/* ⭐ MY FOODS (IMPORTANT FIX) */}
        <Route
          path="/owner/my-foods"
          element={
            role === "owner" ? <OwnerMyFood /> : <Navigate to="/restaurant/login" />
          }
        />
        <Route
  path="/owner/profile"
  element={
    role === "owner" ? <OwnerProfile /> : <Navigate to="/restaurant/login" />
  }
/>

        {/* COMMON */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/orders"
          element={role === "client" ? <Orders /> : <Navigate to="/login" />}
        />
        <Route path="/about" element={<StaticPage type="about" />} />
        <Route path="/contact" element={<StaticPage type="contact" />} />
        <Route path="/privacy" element={<StaticPage type="privacy" />} />
        <Route path="/terms" element={<StaticPage type="terms" />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {showFooter ? <Footer /> : null}
    </>
  );
}

export default App;
