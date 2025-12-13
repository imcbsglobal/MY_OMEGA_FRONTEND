// src/HR/master/Department.jsx
import React, { useEffect, useState } from "react";
import { Building2, Plus, Trash2, Edit2, X, Check, RefreshCw } from "lucide-react";
import api from "../../api/client";

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ===============================
     Fetch Departments
  ================================ */
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try multiple possible endpoints
      let response;
      try {
        response = await api.get("cv-management/departments/");
      } catch (err) {
        // If departments/ fails, try /departments
        if (err.response?.status === 404) {
          response = await api.get("cv-management/departments/");
        } else {
          throw err;
        }
      }
      
      console.log("API Response:", response.data);
      
      // Handle various response structures
      let deptData;
      if (response.data.data) {
        deptData = response.data.data;
      } else if (response.data.results) {
        deptData = response.data.results;
      } else if (Array.isArray(response.data)) {
        deptData = response.data;
      } else {
        deptData = [];
      }
      
      setDepartments(Array.isArray(deptData) ? deptData : []);
      
      if (deptData.length === 0) {
        console.log("No departments found in response");
      }
    } catch (err) {
      let errorMessage = "Unable to load departments";
      
      if (err.response?.status === 404) {
        errorMessage = "API endpoint not found. Please check your Django URL configuration.";
      } else if (err.response?.status === 401) {
        errorMessage = "Unauthorized. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission.";
      } else if (err.response?.data) {
        errorMessage = err.response.data.detail || 
                      err.response.data.message || 
                      err.response.data.error || 
                      JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error("Fetch departments error:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        url: err.config?.url
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Add Department
  ================================ */
  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      setError("Please enter a department name");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      let response;
      try {
        response = await api.post("cv-management/departments/", {
          name: newDepartment.trim(),
        });
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.post("cv-management/departments", {
            name: newDepartment.trim(),
          });
        } else {
          throw err;
        }
      }

      console.log("Add Department Response:", response.data);
      
      const newDept = response.data.data || response.data;
      setDepartments((prev) => [...prev, newDept]);
      setNewDepartment("");
      setSuccess("Department added successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      let errorMsg = "Unable to add department";
      
      if (err.response?.status === 400) {
        errorMsg = err.response.data.name?.[0] || 
                  err.response.data.detail || 
                  "Invalid department data";
      } else if (err.response?.status === 404) {
        errorMsg = "API endpoint not found. Check Django URLs.";
      } else if (err.response?.data) {
        errorMsg = err.response.data.detail ||
                  err.response.data.message || 
                  err.response.data.error ||
                  JSON.stringify(err.response.data);
      }
      
      setError(errorMsg);
      console.error("Add department error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Edit Department
  ================================ */
  const startEdit = (dept) => {
    setEditingId(dept.id);
    setEditingName(dept.name);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setError("");
  };

  const handleUpdateDepartment = async (id) => {
    if (!editingName.trim()) {
      setError("Department name cannot be empty");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      let response;
      try {
        response = await api.put(`cv-management/departments/${id}/`, {
          name: editingName.trim(),
        });
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.put(`cv-management/departments/${id}`, {
            name: editingName.trim(),
          });
        } else {
          throw err;
        }
      }

      console.log("Update Department Response:", response.data);
      
      const updatedDept = response.data.data || response.data;
      setDepartments((prev) =>
        prev.map((dept) => (dept.id === id ? updatedDept : dept))
      );
      setEditingId(null);
      setEditingName("");
      setSuccess("Department updated successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      let errorMsg = "Unable to update department";
      
      if (err.response?.status === 400) {
        errorMsg = err.response.data.name?.[0] || 
                  err.response.data.detail || 
                  "Invalid department data";
      } else if (err.response?.status === 404) {
        errorMsg = "Department not found or API endpoint incorrect";
      } else if (err.response?.data) {
        errorMsg = err.response.data.detail ||
                  err.response.data.message || 
                  err.response.data.error ||
                  JSON.stringify(err.response.data);
      }
      
      setError(errorMsg);
      console.error("Update department error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Delete Department
  ================================ */
  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      try {
        await api.delete(`cv-management/departments/${id}/`);
      } catch (err) {
        if (err.response?.status === 404) {
          await api.delete(`cv-management/departments/${id}`);
        } else {
          throw err;
        }
      }
      
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      setSuccess("Department deleted successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      let errorMsg = "Unable to delete department";
      
      if (err.response?.status === 404) {
        errorMsg = "Department not found or API endpoint incorrect";
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data.detail || "Cannot delete this department";
      } else if (err.response?.data) {
        errorMsg = err.response.data.detail ||
                  err.response.data.message || 
                  err.response.data.error ||
                  JSON.stringify(err.response.data);
      }
      
      setError(errorMsg);
      console.error("Delete department error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Handle Enter Key
  ================================ */
  const handleKeyPress = (e, action, param) => {
    if (e.key === "Enter") {
      if (action === "add") {
        handleAddDepartment();
      } else if (action === "update") {
        handleUpdateDepartment(param);
      }
    }
  };

  /* ===============================
     Refresh Departments
  ================================ */
  const handleRefresh = () => {
    setError("");
    setSuccess("");
    fetchDepartments();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <Building2 size={28} color="#dc2626" />
          <h2 style={styles.title}>Department Management</h2>
          <button 
            onClick={handleRefresh}
            style={{
              ...styles.refreshButton,
              opacity: loading ? 0.6 : 1,
            }}
            title="Refresh departments"
            disabled={loading}
          >
            <RefreshCw size={14} style={{
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div style={styles.successMessage}>
          <Check size={18} />
          <span>{success}</span>
          <button 
            onClick={() => setSuccess("")}
            style={styles.dismissSuccessButton}
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          <X size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button 
            onClick={() => setError("")}
            style={styles.dismissButton}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========== Add Department ========== */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus size={20} />
          Add New Department
        </h3>
        <p style={styles.cardDescription}>
          Enter the name of the new department. Department names should be unique and descriptive.
        </p>
        <div style={styles.addSection}>
          <input
            type="text"
            placeholder="Enter department name (e.g., Sales, Marketing, IT)"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, "add")}
            style={styles.input}
            disabled={loading}
          />
          <button
            onClick={handleAddDepartment}
            style={{
              ...styles.addButton,
              opacity: loading || !newDepartment.trim() ? 0.5 : 1,
              cursor: loading || !newDepartment.trim() ? "not-allowed" : "pointer",
            }}
            disabled={loading || !newDepartment.trim()}
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>
      </div>

      {/* ========== Department List ========== */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.cardTitle}>
            <Building2 size={20} />
            All Departments ({departments.length})
          </h3>
          <div style={styles.stats}>
            <span style={styles.statItem}>
              Total: {departments.length}
            </span>
          </div>
        </div>

        {loading && departments.length === 0 ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading departments...</p>
            <p style={styles.loadingHint}>Make sure backend server is running on http://localhost:8000</p>
          </div>
        ) : departments.length === 0 ? (
          <div style={styles.emptyState}>
            <Building2 size={48} color="#cbd5e1" />
            <p style={styles.emptyText}>No departments found</p>
            <p style={styles.emptySubtext}>
              {error ? "Failed to load departments. Check the error above." : "Add your first department using the form above"}
            </p>
            <button 
              onClick={fetchDepartments}
              style={styles.retryButton}
              disabled={loading}
            >
              <RefreshCw size={14} />
              Retry Loading
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.th, width: "60px" }}>#</th>
                  <th style={styles.th}>Department Name</th>
                  <th style={{ ...styles.th, width: "200px", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, index) => (
                  <tr key={dept.id} style={styles.tableRow}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      {editingId === dept.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, "update", dept.id)}
                          style={styles.editInput}
                          autoFocus
                          disabled={loading}
                        />
                      ) : (
                        <div style={styles.deptName}>
                          <Building2 size={16} color="#64748b" />
                          <span>{dept.name}</span>
                          <span style={styles.deptId}>ID: {dept.id}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {editingId === dept.id ? (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleUpdateDepartment(dept.id)}
                            style={{
                              ...styles.saveButton,
                              opacity: loading ? 0.5 : 1,
                              cursor: loading ? "not-allowed" : "pointer",
                            }}
                            disabled={loading}
                            title="Save changes"
                          >
                            <Check size={16} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              ...styles.cancelButton,
                              opacity: loading ? 0.5 : 1,
                              cursor: loading ? "not-allowed" : "pointer",
                            }}
                            disabled={loading}
                            title="Cancel editing"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => startEdit(dept)}
                            style={{
                              ...styles.editButton,
                              opacity: loading ? 0.5 : 1,
                              cursor: loading ? "not-allowed" : "pointer",
                            }}
                            disabled={loading}
                            title="Edit department"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            style={{
                              ...styles.deleteButton,
                              opacity: loading ? 0.5 : 1,
                              cursor: loading ? "not-allowed" : "pointer",
                            }}
                            disabled={loading}
                            title="Delete department"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div style={styles.debugInfo}>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>🔍 Debug Information (Click to expand)</summary>
          <div style={styles.debugContent}>
            <div style={styles.debugSection}>
              <strong>API Configuration:</strong>
              <div style={styles.debugItem}>Base URL: {import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"}</div>
              <div style={styles.debugItem}>Full Endpoint: {(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api") + "/departments/"}</div>
            </div>
            <div style={styles.debugSection}>
              <strong>State:</strong>
              <div style={styles.debugItem}>Departments Count: {departments.length}</div>
              <div style={styles.debugItem}>Loading: {loading ? "Yes" : "No"}</div>
              <div style={styles.debugItem}>Has Error: {error ? "Yes" : "No"}</div>
            </div>
            <div style={styles.debugSection}>
              <strong>Authentication:</strong>
              <div style={styles.debugItem}>
                Token Status: {localStorage.getItem("accessToken") || localStorage.getItem("access") || localStorage.getItem("token") ? "✓ Present" : "✗ Not found"}
              </div>
              <div style={styles.debugItem}>
                Token Preview: {(localStorage.getItem("accessToken") || localStorage.getItem("access") || localStorage.getItem("token") || "None").substring(0, 20)}...
              </div>
            </div>
            <div style={styles.debugSection}>
              <strong>Troubleshooting:</strong>
              <div style={styles.debugItem}>1. Check if Django server is running on port 8000</div>
              <div style={styles.debugItem}>2. Verify your Django urls.py includes the departments endpoint</div>
              <div style={styles.debugItem}>3. Check Django CORS settings allow requests from frontend</div>
              <div style={styles.debugItem}>4. Verify authentication token is valid</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

/* ===============================
   Styles
=============================== */
const styles = {
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    marginBottom: 30,
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.5,
  },
  refreshButton: {
    marginLeft: "auto",
    padding: "6px 12px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #f1f5f9",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardDescription: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.5,
  },
  stats: {
    display: "flex",
    gap: 16,
  },
  statItem: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f8fafc",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  addSection: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: "250px",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
  },
  addButton: {
    padding: "12px 24px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    borderBottom: "2px solid #e2e8f0",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#334155",
  },
  deptName: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: "500",
  },
  deptId: {
    marginLeft: "auto",
    fontSize: "11px",
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  editInput: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 6,
    border: "2px solid #3b82f6",
    fontSize: "14px",
    outline: "none",
  },
  actionButtons: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
  },
  editButton: {
    padding: "8px 12px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.2s",
    fontSize: "12px",
    fontWeight: "500",
  },
  deleteButton: {
    padding: "8px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.2s",
    fontSize: "12px",
    fontWeight: "500",
  },
  saveButton: {
    padding: "8px 12px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.2s",
    fontSize: "12px",
    fontWeight: "500",
  },
  cancelButton: {
    padding: "8px 12px",
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.2s",
    fontSize: "12px",
    fontWeight: "500",
  },
  successMessage: {
    padding: "12px 16px",
    background: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: 8,
    color: "#065f46",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "14px",
    fontWeight: "500",
  },
  errorMessage: {
    padding: "12px 16px",
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    color: "#991b1b",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "14px",
    fontWeight: "500",
  },
  dismissButton: {
    padding: "4px 8px",
    background: "transparent",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  },
  dismissSuccessButton: {
    marginLeft: "auto",
    padding: "0",
    background: "transparent",
    color: "#065f46",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    lineHeight: 1,
  },
  loadingState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b",
  },
  loadingHint: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "8px",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #f1f5f9",
    borderTop: "4px solid #dc2626",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#64748b",
    margin: "16px 0 8px",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "0 0 16px 0",
  },
  retryButton: {
    padding: "8px 16px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  debugInfo: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#64748b",
    background: "#f8fafc",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  debugContent: {
    marginTop: "12px",
  },
  debugSection: {
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e2e8f0",
  },
  debugItem: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#475569",
    paddingLeft: "12px",
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {
    console.log("Animation already exists");
  }
}