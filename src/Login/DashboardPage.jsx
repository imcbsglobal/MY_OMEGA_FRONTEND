// src/Pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.scss";

const API_BASE = "http://127.0.0.1:8000/api";

export default function DashboardPage({ onLogout }) {
  const [user, setUser] = useState(null);
  const [protectedData, setProtectedData] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // if no user data, go back to login
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const fetchProtectedData = async () => {
    setLoading(true);
    const token = localStorage.getItem("access");

    try {
      const response = await fetch(`${API_BASE}/protected/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProtectedData(data.message);
      } else {
        setProtectedData(`Error: ${data.error}`);
      }
    } catch (err) {
      setProtectedData("Failed to fetch protected data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    if (onLogout) onLogout();

    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="dashboard-title">Dashboard</h2>

        {user && (
          <div className="user-info">
            <h3>Welcome, {user.username}!</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        )}

        <div className="protected-section">
          <button
            onClick={fetchProtectedData}
            className="fetch-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "Fetch Protected Data"}
          </button>

          {protectedData && (
            <div className="protected-data">
              <h4>Protected Endpoint Response:</h4>
              <p>{protectedData}</p>
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Log
        </button>
      </div>
    </div>
  );
}
