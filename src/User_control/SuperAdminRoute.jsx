// src/User_control/SuperAdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/** Only allow access if logged-in user is super admin. */
export default function SuperAdminRoute() {
  const token = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) return <Navigate to="/login" replace />;
  if (!user?.is_superuser) return <Navigate to="/" replace />;

  return <Outlet />;
}
