import React from "react";
const user = JSON.parse(localStorage.getItem("user"));
<h2>Welcome back, {user?.name || user?.email} ({user?.user_level})</h2>

export default function Dashboard() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2
        style={{
          fontSize: "2.2rem",
          color: "#2d3748",
          marginBottom: "20px",
          fontWeight: "bold",
          letterSpacing: "1px",
        }}
      >
        Welcome to the Dashboard!
      </h2>
      <p
        style={{
          fontSize: "1.1rem",
          color: "#4a5568",
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        You have successfully logged in. Use the navigation above to manage your administration tasks.
      </p>
    </div>
  );
}
