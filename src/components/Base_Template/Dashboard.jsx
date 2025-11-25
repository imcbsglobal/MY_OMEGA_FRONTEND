// src/components/Base_Template/Dashboard.jsx
import React from "react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  return (
    <div style={{ padding: 24 }}>
      <h2>Welcome {user?.name || user?.email || "User"} 👋</h2>
      <p>This is your dashboard.</p>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
}
