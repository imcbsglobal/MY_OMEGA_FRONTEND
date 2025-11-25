// src/pages/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const authed = localStorage.getItem("isAuthenticated") === "true";
  return authed ? children : <Navigate to="/login" replace />;
}
