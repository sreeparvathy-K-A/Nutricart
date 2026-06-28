import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import App from "./App";

// Relative /api requests use the local proxy in development and same-origin
// server routes in production. Cross-origin pages provide their own API URL.
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || "";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
