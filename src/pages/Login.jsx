// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await api.post("/login/", { email, password });
    const data = res.data;

   localStorage.setItem("accessToken", data.access);  
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("isAuthenticated", "true");

    if (data.menu_tree) {
  localStorage.setItem("menuTree", JSON.stringify(data.menu_tree));
}
if (data.allowed_menus) {
  // if your login returns allowed_menus instead, still save it
  localStorage.setItem("menuTree", JSON.stringify(data.allowed_menus));
}
    // redirect everyone to same dashboard
    navigate("/");
  } catch (err) {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.detail ||
      "Login failed";
    setError(msg);
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Left Section (Logo) */}
        <div style={styles.left}>
          <img src="/assets/omega-logo.png" alt="Logo" style={styles.logo} />
        </div>

        {/* Right Section (Form) */}
        <div style={styles.right}>
          <h2 style={styles.title}>Administration Management</h2>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f8f6",
  },
  card: {
    display: "flex",
    width: "800px",
    height: "400px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  left: {
    backgroundColor: "#F5F5F5",
    width: "45%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  logo: { width: "180px" },
  right: {
    backgroundColor: "#fff",
    width: "55%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "25px",
  },
  errorBox: {
    width: "80%",
    background: "#ffe6e6",
    color: "#b30000",
    border: "1px solid #ffcccc",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  form: { display: "flex", flexDirection: "column", width: "80%" },
  input: {
    padding: "10px 15px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "25px",
    outline: "none",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#14213D",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    padding: "10px 15px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
};
