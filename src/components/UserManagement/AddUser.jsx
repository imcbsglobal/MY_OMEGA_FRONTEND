import React, { useEffect, useState } from "react";
import AddUserForm from "./AddUser-Form";
import api from "../../api/client";

export default function AddUser() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  async function fetchUsers() {
    try {
      // Fetch active users (default) and inactive users explicitly,
      // then merge so this page shows both (active + inactive).
      const [activeRes, inactiveRes] = await Promise.all([
        api.get("/users/"),
        api.get("/users/?is_active=false"),
      ]);

      const norm = (res) => {
        const payload = res?.data || {};
        return Array.isArray(payload) ? payload : (payload.results || payload.data || []);
      };

      const activeList = norm(activeRes);
      const inactiveList = norm(inactiveRes);

      // Merge by id to avoid duplicates
      const byId = new Map();
      [...activeList, ...inactiveList].forEach((u) => {
        if (u && u.id != null) byId.set(u.id, u);
      });

      const merged = Array.from(byId.values());
      setUsers(merged);
    } catch (e) {
      console.error("Error fetching users:", e.response?.data || e.message);
    }
  }

  const saveUser = async () => {
    await fetchUsers();
    setEditingUser(null);
    setShowForm(false);
  };

  const deleteUser = async (id, userName) => {
    if (!window.confirm(`Inactivate user "${userName}"?`)) return;

    try {
      setDeletingId(id);
      await api.patch(`/users/${id}/`, { is_active: false });
      await fetchUsers();
      alert("User inactivated successfully");
    } catch (error) {
      alert("Inactivate failed");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      setTogglingId(user.id);
      await api.patch(`/users/${user.id}/`, { is_active: !user.is_active });
      await fetchUsers();
    } catch (error) {
      alert("Status update failed");
    } finally {
      setTogglingId(null);
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
        onCancel={() => { setEditingUser(null); setShowForm(false); }}
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
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button
            onClick={() => { setEditingUser(null); setShowForm(true); }}
            style={styles.addButton}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>No</th>
              <th style={styles.tableHeader}>Picture</th>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Branch</th>
              <th style={styles.tableHeader}>Role</th>
              <th style={styles.tableHeader}>Phone</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noResults}>No users found</td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <tr key={u.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{i + 1}</td>

                  <td style={styles.tableCell}>
                    {u.photo_url ? (
                      <img
                        src={u.photo_url}
                        alt={u.name}
                        style={styles.profilePicture}
                      />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}
                  </td>

                  <td style={styles.tableCell}>{u.name}</td>
                  <td style={styles.tableCell}>{u.email}</td>
                  <td style={styles.tableCell}>{u.branch}</td>
                  <td style={styles.tableCell}>{u.user_level}</td>
                  <td style={styles.tableCell}>{u.phone_number}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => { setEditingUser(u); setShowForm(true); }}
                        style={styles.editBtn}
                      >
                        Edit
                      </button>
                      {u.is_active ? (
                        <button 
                          onClick={() => deleteUser(u.id, u.name || u.email)}
                          style={styles.deleteBtn}
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? "Inactivating..." : "Inactivate"}
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleUserStatus(u)}
                          style={styles.editBtn}
                          disabled={togglingId === u.id}
                        >
                          {togglingId === u.id ? "Activating..." : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div style={styles.mobileContainer}>
        {filtered.length === 0 ? (
          <div style={styles.noResultsMobile}>No users found</div>
        ) : (
          filtered.map((u, i) => (
            <div key={u.id} style={styles.userCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderLeft}>
                  {u.photo_url ? (
                    <img
                      src={u.photo_url}
                      alt={u.name}
                      style={styles.profilePictureMobile}
                    />
                  ) : (
                    <div style={styles.avatarPlaceholderMobile}>
                      {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div>
                    <div style={styles.cardName}>{u.name}</div>
                    <div style={styles.cardEmail}>{u.email}</div>
                  </div>
                </div>
                <span style={u.is_active ? styles.statusActive : styles.statusInactive}>
                  {u.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Branch:</span>
                  <span style={styles.infoValue}>{u.branch}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Role:</span>
                  <span style={styles.infoValue}>{u.user_level}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Phone:</span>
                  <span style={styles.infoValue}>{u.phone_number}</span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => { setEditingUser(u); setShowForm(true); }}
                  style={styles.editBtnMobile}
                >
                  Edit
                </button>
                <button 
                  onClick={() => (u.is_active ? deleteUser(u.id, u.name || u.email) : toggleUserStatus(u))}
                  style={u.is_active ? styles.deleteBtnMobile : styles.editBtnMobile}
                  disabled={u.is_active ? (deletingId === u.id) : (togglingId === u.id)}
                >
                  {u.is_active ? (deletingId === u.id ? "Inactivating..." : "Inactivate") : (togglingId === u.id ? "Activating..." : "Activate")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { 
    padding: "16px", 
    background: "#f9fafb", 
    minHeight: "100vh" 
  },
  header: { 
    display: "flex", 
    flexDirection: "column",
    gap: "16px",
    marginBottom: "24px" 
  },
  title: { 
    fontSize: "24px", 
    fontWeight: "700",
    margin: 0
  },
  headerActions: { 
    display: "flex", 
    flexDirection: "column",
    gap: "12px",
  },
  searchInput: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  },
  addButton: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    background: "#3b82f6",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    width: "100%"
  },
  tableContainer: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "auto",
    display: "none"
  },
  table: { 
    width: "100%", 
    borderCollapse: "collapse",
    minWidth: "800px"
  },
  tableHeader: {
    padding: "12px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    backgroundColor: "#f3f4f6",
  },
  tableRow: { borderBottom: "1px solid #e5e7eb" },
  tableCell: { 
    padding: "12px", 
    fontSize: "14px", 
    verticalAlign: "middle" 
  },
  profilePicture: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "2px solid #e5e7eb"
  },
  avatarPlaceholder: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    color: "#6b7280"
  },
  statusActive: {
    padding: "4px 12px",
    background: "#16a34a",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  },
  statusInactive: {
    padding: "4px 12px",
    background: "#9ca3af",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  },
  noResults: {
    padding: "32px",
    textAlign: "center",
    fontWeight: "500",
    color: "#6b7280",
  },
  actionButtons: { 
    display: "flex", 
    gap: "6px",
    flexWrap: "wrap"
  },
  editBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: "6px",
    border: "1px solid #bfdbfe",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
    border: "1px solid #fecaca",
    cursor: "pointer",
  },
  
  // Mobile Card Styles
  mobileContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  userCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #e5e7eb"
  },
  cardHeaderLeft: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flex: 1,
    minWidth: 0
  },
  profilePictureMobile: {
    width: "50px",
    height: "50px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "2px solid #e5e7eb",
    flexShrink: 0
  },
  avatarPlaceholderMobile: {
    width: "50px",
    height: "50px",
    borderRadius: "8px",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
    color: "#6b7280",
    flexShrink: 0
  },
  cardName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  cardEmail: {
    fontSize: "13px",
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  cardBody: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280"
  },
  infoValue: {
    fontSize: "14px",
    color: "#111827"
  },
  cardFooter: {
    display: "flex",
    gap: "8px",
    padding: "12px 16px",
    background: "#f9fafb",
    borderTop: "1px solid #e5e7eb"
  },
  editBtnMobile: {
    flex: 1,
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: "6px",
    border: "1px solid #bfdbfe",
    cursor: "pointer",
  },
  deleteBtnMobile: {
    flex: 1,
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
    border: "1px solid #fecaca",
    cursor: "pointer",
  },
  noResultsMobile: {
    padding: "32px",
    textAlign: "center",
    fontWeight: "500",
    color: "#6b7280",
    background: "#fff",
    borderRadius: "12px"
  },

  // Media Queries
  '@media (min-width: 768px)': {
    container: { padding: "24px" },
    header: { flexDirection: "row", justifyContent: "space-between" },
    title: { fontSize: "28px" },
    headerActions: { 
      flexDirection: "row",
      width: "auto"
    },
    searchInput: { width: "300px" },
    addButton: { width: "auto" },
    tableContainer: { display: "block" },
    mobileContainer: { display: "none" }
  }
};

// Apply media query styles
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(min-width: 768px)');
  if (mediaQuery.matches) {
    Object.assign(styles.container, { padding: "24px" });
    Object.assign(styles.header, { flexDirection: "row", justifyContent: "space-between" });
    Object.assign(styles.title, { fontSize: "28px" });
    Object.assign(styles.headerActions, { flexDirection: "row", width: "auto" });
    Object.assign(styles.searchInput, { width: "300px" });
    Object.assign(styles.addButton, { width: "auto" });
    Object.assign(styles.tableContainer, { display: "block" });
    Object.assign(styles.mobileContainer, { display: "none" });
  }
}