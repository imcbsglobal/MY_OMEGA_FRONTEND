// src/components/UserManagement/UserControl.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client"; // ✅ axios client with token interceptor

export default function UserControl() {
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const styles = {
    page: {
      padding: "25px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "Inter, sans-serif",
    },
    topButton: {
      background: "#1d4ed8",
      color: "white",
      border: "none",
      padding: "8px 18px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "20px",
      cursor: "pointer",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      transition: "background 0.2s ease",
    },
    card: {
      width: "50%",
      margin: "0 auto",
      background: "#ffffff",
      borderRadius: "10px",
      padding: "20px 25px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
      border: "1px solid #e5e7eb",
    },
    header: {
      background: "#1d4ed8",
      color: "white",
      padding: "10px 15px",
      fontWeight: "600",
      borderRadius: "6px 6px 0 0",
      marginBottom: "15px",
      fontSize: "14px",
      letterSpacing: "0.3px",
    },
    label: {
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "6px",
      display: "block",
      color: "#374151",
    },
    select: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      marginBottom: "18px",
      fontSize: "14px",
      cursor: "pointer",
      background: "#fff",
      outline: "none",
      color: "#111827",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      appearance: "none",
      backgroundImage:
        "linear-gradient(45deg, transparent 50%, #1d4ed8 50%), linear-gradient(135deg, #1d4ed8 50%, transparent 50%)",
      backgroundPosition:
        "calc(100% - 18px) calc(1em + 2px), calc(100% - 13px) calc(1em + 2px)",
      backgroundSize: "5px 5px, 5px 5px",
      backgroundRepeat: "no-repeat",
    },
    actionBtn: {
      width: "100%",
      background: "#1d4ed8",
      border: "none",
      color: "#fff",
      fontWeight: "600",
      padding: "10px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      boxShadow: "0px 3px 6px rgba(0,0,0,0.15)",
      transition: "background 0.2s ease",
    },
  };

  // ✅ Fetch user list from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/user-controll/admin/users/"); // ✅ Fixed endpoint
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading users...</p>;

  return (
    <div style={styles.page}>
      <button
        style={styles.topButton}
        onClick={() => navigate("/configure-access/default")}
      >
        Set Default Menus
      </button>

      <div style={styles.card}>
        <div style={styles.header}>Select User for Menu Control</div>

        <label style={styles.label}>Select User</label>
        <select
          style={styles.select}
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.username} ({u.email})
            </option>
          ))}
        </select>

        <button
          style={styles.actionBtn}
          disabled={!selectedUser}
          onClick={() => navigate(`/configure-access/${selectedUser}`)}
        >
          ⚙ Configure Menu Access
        </button>
      </div>
    </div>
  );
}
