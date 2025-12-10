// src/HR/master/Department.jsx
import React, { useEffect, useState } from "react";
import { Building2, Plus, Trash2, Edit2, X, Check } from "lucide-react";;

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
      const res = await api.get("/master/departments/");
      setDepartments(res.data);
      setError("");
    } catch (err) {
      setError("Unable to load departments");
      console.error(err);
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
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/master/departments/", {
        name: newDepartment.trim(),
      });

      setDepartments((prev) => [...prev, res.data]);
      setNewDepartment("");
      setSuccess("Department added successfully!");
      setError("");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add department");
      console.error(err);
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
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdateDepartment = async (id) => {
    if (!editingName.trim()) {
      setError("Department name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/master/departments/${id}/`, {
        name: editingName.trim(),
      });

      setDepartments((prev) =>
        prev.map((dept) => (dept.id === id ? res.data : dept))
      );
      setEditingId(null);
      setEditingName("");
      setSuccess("Department updated successfully!");
      setError("");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update department");
      console.error(err);
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
      await api.delete(`/master/departments/${id}/`);
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      setSuccess("Department deleted successfully!");
      setError("");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete department");
      console.error(err);
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <Building2 size={28} color="#dc2626" />
          <h2 style={styles.title}>Department Management</h2>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div style={styles.successMessage}>
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ========== Add Department ========== */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus size={20} />
          Add New Department
        </h3>
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
            style={styles.addButton}
            disabled={loading || !newDepartment.trim()}
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>
      </div>

      {/* ========== Department List ========== */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Building2 size={20} />
          All Departments ({departments.length})
        </h3>

        {loading && departments.length === 0 ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div style={styles.emptyState}>
            <Building2 size={48} color="#cbd5e1" />
            <p style={styles.emptyText}>No departments added yet</p>
            <p style={styles.emptySubtext}>
              Add your first department using the form above
            </p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.th, width: "60px" }}>#</th>
                  <th style={styles.th}>Department Name</th>
                  <th style={{ ...styles.th, width: "150px", textAlign: "center" }}>
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
                        />
                      ) : (
                        <div style={styles.deptName}>
                          <Building2 size={16} color="#64748b" />
                          {dept.name}
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {editingId === dept.id ? (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleUpdateDepartment(dept.id)}
                            style={styles.saveButton}
                            disabled={loading}
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={styles.cancelButton}
                            disabled={loading}
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => startEdit(dept)}
                            style={styles.editButton}
                            disabled={loading}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            style={styles.deleteButton}
                            disabled={loading}
                            title="Delete"
                          >
                            <Trash2 size={16} />
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
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #f1f5f9",
  },
  cardTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: 8,
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
    cursor: "pointer",
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
    padding: 8,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  deleteButton: {
    padding: 8,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  saveButton: {
    padding: 8,
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  cancelButton: {
    padding: 8,
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
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
  loadingState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b",
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
    margin: 0,
  },
};