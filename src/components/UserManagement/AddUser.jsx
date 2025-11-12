// src/components/UserManagement/AddUser.jsx
import React, { useEffect, useState } from "react";
import AddUserForm from "./AddUser-Form";
import api from "../../api/client";

export default function AddUser() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get("/api/users/"); // ✅ fixed
      setUsers(res.data);
    } catch (e) {
      console.error("Error fetching users:", e.response?.data || e.message);
    }
  }

  const saveUser = async (form) => {
    const isEditing = !!editingUser;

    const payload = {
      name: form.fullName?.trim(),
      email: form.userId?.trim(),
      branch: form.branch,
      user_level: form.userLevel,
      phone_number: form.phoneNumber,
      is_active: form.status === "Active",
    };

    if (!isEditing) {
      if (!form.password?.trim()) {
        alert("⚠️ Password is required for new users.");
        return;
      }
      payload.password = form.password;
      payload.confirm_password = form.password;
    }

    if (isEditing && form.password?.trim()) {
      payload.password = form.password;
      payload.confirm_password = form.password;
    }

    try {
      if (isEditing) {
        const res = await api.patch(`/api/users/${editingUser.id}/`, payload); // ✅ fixed
        alert("✅ User updated successfully!");
      } else {
        const res = await api.post("/api/users/", payload); // ✅ fixed
        alert("✅ User added successfully!");
      }

      await fetchUsers();
      setEditingUser(null);
      setShowForm(false);
    } catch (e) {
      console.error("❌ Save failed:", e.response?.data || e.message);
      alert("❌ Save failed. Check console for details.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/users/${id}/`); // ✅ fixed
      await fetchUsers();
      alert("✅ User deleted successfully!");
    } catch (e) {
      console.error("Delete failed:", e.response?.data || e.message);
      alert("❌ Delete failed. Check console.");
    }
  };

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.branch || "").toLowerCase().includes(q) ||
      (u.user_level || "").toLowerCase().includes(q)
    );
  });

  if (showForm) {
    return (
      <AddUserForm
        onCancel={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
        onSave={saveUser}
        editData={editingUser}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>User Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
            style={styles.addButton}
          >
            + Add User
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>No</th>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Branch</th>
              <th style={styles.tableHeader}>Role</th>
              <th style={styles.tableHeader}>Phone</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noResults}>
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <tr key={u.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{i + 1}</td>
                  <td style={styles.tableCell}>{u.name}</td>
                  <td style={styles.tableCell}>{u.email}</td>
                  <td style={styles.tableCell}>{u.branch}</td>
                  <td style={styles.tableCell}>{u.user_level}</td>
                  <td style={styles.tableCell}>{u.phone_number}</td>
                  <td style={styles.tableCell}>
                    <span
                      style={
                        u.is_active
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setShowForm(true);
                        }}
                        style={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px", background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  title: { fontSize: "28px", fontWeight: "700" },
  headerActions: { display: "flex", alignItems: "center", gap: "12px" },
  searchContainer: { position: "relative" },
  searchInput: { padding: "12px 40px 12px 16px", fontSize: "14px", border: "2px solid #e5e7eb", borderRadius: "8px" },
  searchIcon: { position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" },
  addButton: { padding: "12px 20px", fontSize: "14px", fontWeight: "600", background: "#3b82f6", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" },
  tableContainer: { background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeaderRow: { backgroundColor: "#f3f4f6" },
  tableHeader: { padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" },
  tableRow: { borderBottom: "1px solid #e5e7eb" },
  tableCell: { padding: "12px", fontSize: "14px" },
  statusActive: { padding: "4px 12px", background: "#16a34a", color: "#fff", borderRadius: "8px", fontSize: "12px", fontWeight: "600" },
  statusInactive: { padding: "4px 12px", background: "#9ca3af", color: "#fff", borderRadius: "8px", fontSize: "12px", fontWeight: "600" },
  noResults: { padding: "32px", textAlign: "center", fontWeight: "500", color: "#6b7280" },
  actionButtons: { display: "flex", gap: "6px" },
  editBtn: { padding: "6px 12px", fontSize: "13px", background: "#dbeafe", color: "#1d4ed8", borderRadius: "6px", border: "1px solid #bfdbfe", cursor: "pointer" },
  deleteBtn: { padding: "6px 12px", fontSize: "13px", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", border: "1px solid #fecaca", cursor: "pointer" },
};
