import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function UserControl() {
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAccess, setUserAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const navigate = useNavigate();

  const styles = {
    page: {
      padding: "25px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "Inter, sans-serif",
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
    actionBtnDisabled: {
      width: "100%",
      background: "#94a3b8",
      border: "none",
      color: "#fff",
      fontWeight: "600",
      padding: "10px",
      borderRadius: "8px",
      cursor: "not-allowed",
      fontSize: "14px",
      boxShadow: "0px 3px 6px rgba(0,0,0,0.15)",
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const currentUserRes = await api.get("/users/me/");
        setCurrentUser(currentUserRes.data);
        
        // Fetch all users
        const res = await api.get("/user-controll/admin/users/");
        
        // Filter users based on current user's permissions
        let filteredUsers = res.data;
        
        if (!currentUserRes.data.is_superuser) {
          // Non-superuser: only show users they can manage
          // For now, show all non-admin users  
          filteredUsers = res.data.filter(u => 
            u.user_level !== "Super Admin" && !u.is_superuser
          );
        }
        
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch user access when user is selected
  useEffect(() => {
    if (!selectedUser) {
      setUserAccess(null);
      return;
    }

    const fetchUserAccess = async () => {
      setLoadingAccess(true);
      try {
        const res = await api.get(`/user-controll/admin/user/${selectedUser}/menus/`);
        setUserAccess(res.data);
      } catch (error) {
        console.error("Error fetching user access:", error);
        setUserAccess(null);
      } finally {
        setLoadingAccess(false);
      }
    };

    fetchUserAccess();
  }, [selectedUser]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading users...</p>;

  return (
    <div style={styles.page}>
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
          style={selectedUser ? styles.actionBtn : styles.actionBtnDisabled}
          disabled={!selectedUser}
          onClick={() => navigate(`/configure-access/${selectedUser}`)}
        >
          ⚙ Configure Menu Access
        </button>
      </div>

      {/* Display User Access Section */}
      {selectedUser && (
        <div style={{
          ...styles.card,
          marginTop: "20px",
          maxWidth: "900px",
        }}>
          <div style={styles.header}>Current Access Permissions</div>
          
          {loadingAccess ? (
            <p style={{ padding: "15px", color: "#666" }}>Loading access details...</p>
          ) : userAccess?.menu_perms && userAccess.menu_perms.length > 0 ? (
            <div>
              <div style={{ marginBottom: "15px", fontSize: "13px", color: "#666" }}>
                Total Access: <strong>{userAccess.menu_perms.length}</strong> menu(s)
              </div>
              <div style={{
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: "6px"
              }}>
                {userAccess.menu_perms.map((perm, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 15px",
                      borderBottom: idx < userAccess.menu_perms.length - 1 ? "1px solid #f3f4f6" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                        {perm.name || `Menu #${perm.menu_id}`}
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      gap: "15px",
                      fontSize: "12px"
                    }}>
                      <div style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: perm.can_view ? "#dcfce7" : "#f3f4f6",
                        color: perm.can_view ? "#166534" : "#9ca3af",
                        fontWeight: "500"
                      }}>
                        👁 {perm.can_view ? "View" : "—"}
                      </div>
                      <div style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: perm.can_edit ? "#dbeafe" : "#f3f4f6",
                        color: perm.can_edit ? "#1e40af" : "#9ca3af",
                        fontWeight: "500"
                      }}>
                        ✏ {perm.can_edit ? "Edit" : "—"}
                      </div>
                      <div style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: perm.can_delete ? "#fee2e2" : "#f3f4f6",
                        color: perm.can_delete ? "#991b1b" : "#9ca3af",
                        fontWeight: "500"
                      }}>
                        🗑 {perm.can_delete ? "Delete" : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              padding: "15px",
              color: "#666",
              textAlign: "center",
              backgroundColor: "#f9fafb",
              borderRadius: "6px"
            }}>
              No access permissions assigned to this user
            </div>
          )}
        </div>
      )}
    </div>
  );
}