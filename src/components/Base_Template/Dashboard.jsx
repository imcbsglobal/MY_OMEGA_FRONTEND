// src/components/Base_Template/Dashboard.jsx

import React from "react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ color: "#dc2626", marginBottom: "6px" }}>
          Welcome To Dashboard
        </h1>
        <p style={{ color: "#64748b" }}>
          Welcome back! Here's your workforce overview
        </p>
      </div>

      {/* Cards / Content will align correctly */}
      {/* Your existing dashboard cards & charts go here */}
    </div>
  );
}
