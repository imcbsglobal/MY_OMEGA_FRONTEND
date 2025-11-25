import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserFriends, FaHome, FaUserCircle, FaTable } from "react-icons/fa";
import api from "../api/client";

export default function UserDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch user leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await api.get("user-controll/my-leads/");
        setLeads(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      {/* 🔹 Navbar */}
      <header style={styles.navbar}>
        <div style={styles.navInner}>
          {/* Logo */}
          <div style={styles.logoSection}>
            <img src="/assets/omega-logo.png" alt="Omega" style={styles.logo} />
            <span style={styles.logoText}>Omega</span>
          </div>

          {/* Navigation Links */}
          <nav style={styles.navLinks}>
            {[
              { path: "/user-dashboard", label: "Dashboard", icon: <FaHome /> },
              { path: "/user-hr", label: "HR Management", icon: <FaUserFriends /> },
              { path: "/user-leads", label: "My Leads", icon: <FaTable /> },
              { path: "/user-profile", label: "My Profile", icon: <FaUserCircle /> },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  color: isActive ? "#b91c1c" : "#1e293b",
                  borderBottom: isActive
                    ? "2px solid #b91c1c"
                    : "2px solid transparent",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Profile & Logout */}
          <div style={styles.profile}>
            <div style={styles.userInfo}>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                alt="User"
                style={styles.avatar}
              />
              <span style={styles.username}>
                {user?.email ? user.email : "User"}
              </span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* 🔹 Main Content */}
      <main style={styles.main}>
        <h2 style={styles.pageTitle}>My Leads</h2>

        <div style={styles.card}>
          {loading ? (
            <p style={styles.loading}>Loading leads...</p>
          ) : leads.length === 0 ? (
            <p style={styles.noData}>No leads found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Firm Name</th>
                  <th>Customer Name</th>
                  <th>Contact Number</th>
                  <th>Location</th>
                  <th>District</th>
                  <th>Business Nature</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={lead.id}>
                    <td>{index + 1}</td>
                    <td>{lead.firm_name}</td>
                    <td>{lead.customer_name}</td>
                    <td>{lead.contact_number}</td>
                    <td>{lead.location}</td>
                    <td>{lead.district}</td>
                    <td>{lead.business_nature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

/* 🎨 Clean Omega Admin-Style Design */
const styles = {
  wrapper: {
    fontFamily: "Poppins, sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#1e293b",
  },

  // 🔸 Navbar (exact admin look)
  navbar: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
    padding: "0 40px",
    height: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  navInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "1300px",
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logo: {
    width: "42px",
    height: "42px",
  },

  logoText: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#dc2626",
    fontStyle: "italic",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },

  navLink: {
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14.5px",
    transition: "color 0.2s ease",
    paddingBottom: "3px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },

  username: {
    fontWeight: "600",
    fontSize: "13.5px",
  },

  logoutBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },

  main: {
    padding: "35px 100px 50px",
  },

  pageTitle: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "25px",
    color: "#1e293b",
  },

  card: {
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    padding: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  th: {
    background: "#f9fafb",
    padding: "12px 10px",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: "10px 10px",
    borderBottom: "1px solid #e5e7eb",
  },

  loading: {
    textAlign: "center",
    padding: "25px",
    color: "#475569",
  },

  noData: {
    textAlign: "center",
    padding: "30px",
    color: "#6b7280",
  },
};
