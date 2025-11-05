import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function SuperAdminRoute() {
  const token = localStorage.getItem("access");
  if (!token) return <Navigate to="/login" replace />;

  const userLevel = localStorage.getItem("user_level") || "User";
  const canAccessControl = JSON.parse(
    localStorage.getItem("can_access_control_panel") || "false"
  );

  // Allow if Super Admin, Admin, or has user_control menu access
  if (
    userLevel === "Super Admin" || 
    userLevel === "Admin" || 
    canAccessControl
  ) {
    return <Outlet />;
  }

  return <Navigate to="/not-authorized" replace />;
}