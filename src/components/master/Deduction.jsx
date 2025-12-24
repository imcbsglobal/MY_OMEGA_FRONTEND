import React, { useEffect, useState } from "react";
import { Wallet, Plus, Trash2, Edit2, X, Check, RefreshCw, Calendar } from "lucide-react";
import api from "../../api/client";
export default function Deduction() {
  const [deductions, setDeductions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    month: "",
    amount: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    year: "",
    month: "",
    amount: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchDeductions();
  }, []);

  const fetchDeductions = async () => {
    try {
      setLoading(true);
      setError("");
      
      let response;
      try {
        response = await api.get("cv-management/deductions/");
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.get("cv-management/deductions");
        } else {
          throw err;
        }
      }
      
      let deductionData;
      if (response.data.data) {
        deductionData = response.data.data;
      } else if (response.data.results) {
        deductionData = response.data.results;
      } else if (Array.isArray(response.data)) {
        deductionData = response.data;
      } else {
        deductionData = [];
      }
      
      setDeductions(Array.isArray(deductionData) ? deductionData : []);
    } catch (err) {
      let errorMessage = "Unable to load deduction data";
      
      if (err.response?.status === 404) {
        errorMessage = "API endpoint not found. Please check your Django URL configuration.";
      } else if (err.response?.status === 401) {
        errorMessage = "Unauthorized. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission.";
      } else if (err.response?.data) {
        errorMessage = err.response.data.detail || err.response.data.message || 
                      err.response.data.error || JSON.stringify(err.response.data);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeduction = async () => {
    if (!formData.name.trim()) {
      setError("Please enter a deduction name");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!formData.year || !formData.month) {
      setError("Please select year and month");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      let response;
      try {
        response = await api.post("cv-management/deductions/", {
          name: formData.name.trim(),
          year: formData.year,
          month: formData.month,
          amount: parseFloat(formData.amount)
        });
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.post("cv-management/deductions", {
            name: formData.name.trim(),
            year: formData.year,
            month: formData.month,
            amount: parseFloat(formData.amount)
          });
        } else {
          throw err;
        }
      }

      const newDeduction = response.data.data || response.data;
      setDeductions((prev) => [...prev, newDeduction]);
      setFormData({
        name: "",
        year: new Date().getFullYear().toString(),
        month: "",
        amount: ""
      });
      setSuccess("Deduction added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      let errorMsg = "Unable to add deduction";
      
      if (err.response?.status === 400) {
        errorMsg = err.response.data.detail || "Invalid deduction data";
      } else if (err.response?.data) {
        errorMsg = err.response.data.detail || err.response.data.message || 
                  err.response.data.error || JSON.stringify(err.response.data);
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (deduction) => {
    setEditingId(deduction.id);
    setEditData({
      name: deduction.name,
      year: deduction.year,
      month: deduction.month,
      amount: deduction.amount
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", year: "", month: "", amount: "" });
    setError("");
  };

  const handleUpdateDeduction = async (id) => {
    if (!editData.name.trim()) {
      setError("Deduction name cannot be empty");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!editData.amount || parseFloat(editData.amount) <= 0) {
      setError("Please enter a valid amount");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      let response;
      try {
        response = await api.put(`cv-management/deductions/${id}/`, {
          name: editData.name.trim(),
          year: editData.year,
          month: editData.month,
          amount: parseFloat(editData.amount)
        });
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.put(`cv-management/deductions/${id}`, {
            name: editData.name.trim(),
            year: editData.year,
            month: editData.month,
            amount: parseFloat(editData.amount)
          });
        } else {
          throw err;
        }
      }

      const updatedDeduction = response.data.data || response.data;
      setDeductions((prev) =>
        prev.map((ded) => (ded.id === id ? updatedDeduction : ded))
      );
      setEditingId(null);
      setEditData({ name: "", year: "", month: "", amount: "" });
      setSuccess("Deduction updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      let errorMsg = "Unable to update deduction";
      
      if (err.response?.status === 400) {
        errorMsg = err.response.data.detail || "Invalid deduction data";
      } else if (err.response?.status === 404) {
        errorMsg = "Deduction not found or API endpoint incorrect";
      } else if (err.response?.data) {
        errorMsg = err.response.data.detail || err.response.data.message || 
                  err.response.data.error || JSON.stringify(err.response.data);
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeduction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deduction?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      try {
        await api.delete(`cv-management/deductions/${id}/`);
      } catch (err) {
        if (err.response?.status === 404) {
          await api.delete(`cv-management/deductions/${id}`);
        } else {
          throw err;
        }
      }
      
      setDeductions((prev) => prev.filter((ded) => ded.id !== id));
      setSuccess("Deduction deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      let errorMsg = "Unable to delete deduction";
      
      if (err.response?.status === 404) {
        errorMsg = "Deduction not found or API endpoint incorrect";
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data.detail || "Cannot delete this deduction";
      } else if (err.response?.data) {
        errorMsg = err.response.data.detail || err.response.data.message || 
                  err.response.data.error || JSON.stringify(err.response.data);
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError("");
    setSuccess("");
    fetchDeductions();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <Wallet size={28} color="#dc2626" />
          <h2 style={styles.title}>Deduction Management</h2>
          <button 
            onClick={handleRefresh}
            style={{
              ...styles.refreshButton,
              opacity: loading ? 0.6 : 1,
            }}
            title="Refresh deductions"
            disabled={loading}
          >
            <RefreshCw size={14} style={{
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }} />
            Refresh
          </button>
        </div>
      </div>

      {success && (
        <div style={styles.successMessage}>
          <Check size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} style={styles.dismissSuccessButton}>×</button>
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          <X size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError("")} style={styles.dismissButton}>Dismiss</button>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus size={20} />
          Add New Deduction
        </h3>
        
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Deduction Name</label>
            <input
              type="text"
              placeholder="Enter Deduction Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Year</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              style={styles.select}
              disabled={loading}
            >
              <option value="">YYYY</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Month</label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              style={styles.select}
              disabled={loading}
            >
              <option value="">Select Month</option>
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={styles.input}
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleAddDeduction}
          style={{
            ...styles.addButton,
            opacity: loading || !formData.name.trim() || !formData.year || !formData.month || !formData.amount ? 0.5 : 1,
            cursor: loading || !formData.name.trim() || !formData.year || !formData.month || !formData.amount ? "not-allowed" : "pointer",
          }}
          disabled={loading || !formData.name.trim() || !formData.year || !formData.month || !formData.amount}
        >
          <Plus size={18} />
          Add Deduction
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.cardTitle}>
            <Wallet size={20} />
            All Deductions ({deductions.length})
          </h3>
          <div style={styles.stats}>
            <span style={styles.statItem}>Total: {deductions.length}</span>
          </div>
        </div>

        {loading && deductions.length === 0 ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading deductions...</p>
            <p style={styles.loadingHint}>Make sure backend server is running on http://localhost:8000</p>
          </div>
        ) : deductions.length === 0 ? (
          <div style={styles.emptyState}>
            <Wallet size={48} color="#cbd5e1" />
            <p style={styles.emptyText}>No deductions added yet</p>
            <p style={styles.emptySubtext}>
              {error ? "Failed to load deductions. Check the error above." : "Add your first deduction using the form above"}
            </p>
            <button onClick={fetchDeductions} style={styles.retryButton} disabled={loading}>
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
                  <th style={styles.th}>Deduction Name</th>
                  <th style={{ ...styles.th, width: "100px" }}>Year</th>
                  <th style={{ ...styles.th, width: "120px" }}>Month</th>
                  <th style={{ ...styles.th, width: "120px", textAlign: "right" }}>Amount</th>
                  <th style={{ ...styles.th, width: "200px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((deduction, index) => (
                  <tr key={deduction.id} style={styles.tableRow}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      {editingId === deduction.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          style={styles.editInput}
                          autoFocus
                          disabled={loading}
                        />
                      ) : (
                        <div style={styles.deductionName}>
                          <Wallet size={16} color="#64748b" />
                          <span>{deduction.name}</span>
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === deduction.id ? (
                        <select
                          value={editData.year}
                          onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                          style={styles.editSelect}
                          disabled={loading}
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={styles.yearBadge}>{deduction.year}</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {editingId === deduction.id ? (
                        <select
                          value={editData.month}
                          onChange={(e) => setEditData({ ...editData, month: e.target.value })}
                          style={styles.editSelect}
                          disabled={loading}
                        >
                          {months.map((month) => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={styles.monthBadge}>
                          <Calendar size={14} />
                          {deduction.month}
                        </span>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {editingId === deduction.id ? (
                        <input
                          type="number"
                          value={editData.amount}
                          onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                          style={{ ...styles.editInput, textAlign: "right" }}
                          step="0.01"
                          min="0"
                          disabled={loading}
                        />
                      ) : (
                        <span style={styles.amount}>{formatCurrency(deduction.amount)}</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {editingId === deduction.id ? (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleUpdateDeduction(deduction.id)}
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
                            onClick={() => startEdit(deduction)}
                            style={{
                              ...styles.editButton,
                              opacity: loading ? 0.5 : 1,
                              cursor: loading ? "not-allowed" : "pointer",
                            }}
                            disabled={loading}
                            title="Edit deduction"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDeduction(deduction.id)}
                            style={{
                              ...styles.deleteButton,
                              opacity: loading ? 0.5 : 1,
                              cursor: loading ? "not-allowed" : "pointer",
                            }}
                            disabled={loading}
                            title="Delete deduction"
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
    </div>
  );
}

const styles = {
  container: { maxWidth: 1200, margin: "0 auto", padding: "20px" },
  header: { marginBottom: 30 },
  titleSection: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
  title: { margin: 0, fontSize: "28px", fontWeight: "700", color: "#1e293b" },
  refreshButton: {
    marginLeft: "auto", padding: "6px 12px", background: "#f1f5f9", color: "#475569",
    border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", fontWeight: "500",
    cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px"
  },
  card: {
    background: "#fff", padding: 24, borderRadius: 12, marginBottom: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9"
  },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  cardTitle: {
    margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#334155",
    display: "flex", alignItems: "center", gap: 8
  },
  stats: { display: "flex", gap: 16 },
  statItem: { fontSize: "12px", color: "#64748b", background: "#f8fafc", padding: "4px 8px", borderRadius: "4px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: "13px", fontWeight: "500", color: "#475569" },
  input: {
    padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
    fontSize: "14px", outline: "none", transition: "all 0.2s"
  },
  select: {
    padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "14px",
    outline: "none", transition: "all 0.2s", background: "#fff", cursor: "pointer"
  },
  addButton: {
    padding: "12px 24px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8,
    fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, transition: "all 0.2s", cursor: "pointer", width: "fit-content"
  },
  tableContainer: { overflowX: "auto", borderRadius: "8px", border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { backgroundColor: "#f8fafc" },
  th: {
    padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600",
    color: "#64748b", borderBottom: "2px solid #e2e8f0"
  },
  tableRow: { borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#334155" },
  deductionName: { display: "flex", alignItems: "center", gap: 8, fontWeight: "500" },
  yearBadge: {
    fontSize: "13px", color: "#475569", background: "#f1f5f9", padding: "4px 10px",
    borderRadius: "6px", fontWeight: "500"
  },
  monthBadge: {
    fontSize: "12px", color: "#0369a1", background: "#e0f2fe", padding: "4px 10px",
    borderRadius: "6px", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: 4
  },
  amount: { fontSize: "14px", fontWeight: "600", color: "#dc2626" },
  editInput: {
    width: "100%", padding: "8px 12px", borderRadius: 6, border: "2px solid #3b82f6",
    fontSize: "14px", outline: "none"
  },
  editSelect: {
    width: "100%", padding: "8px 12px", borderRadius: 6, border: "2px solid #3b82f6",
    fontSize: "14px", outline: "none", background: "#fff", cursor: "pointer"
  },
  actionButtons: { display: "flex", gap: 8, justifyContent: "center" },
  editButton: {
    padding: "8px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
    fontSize: "12px", fontWeight: "500", cursor: "pointer"
  },
  deleteButton: {
    padding: "8px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
    fontSize: "12px", fontWeight: "500", cursor: "pointer"
  },
  saveButton: {
    padding: "8px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
    fontSize: "12px", fontWeight: "500", cursor: "pointer"
  },
  cancelButton: {
    padding: "8px 12px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
    fontSize: "12px", fontWeight: "500", cursor: "pointer"
  },
  successMessage: {
    padding: "12px 16px", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 8,
    color: "#065f46", marginBottom: 20, display: "flex", alignItems: "center", gap: 8,
    fontSize: "14px", fontWeight: "500"
  },
  errorMessage: {
    padding: "12px 16px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8,
    color: "#991b1b", marginBottom: 20, display: "flex", alignItems: "center", gap: 8,
    fontSize: "14px", fontWeight: "500"
  },
  dismissButton: {
    padding: "4px 8px", background: "transparent", color: "#991b1b", border: "1px solid #fca5a5",
    borderRadius: "4px", fontSize: "12px", cursor: "pointer"
  },
  dismissSuccessButton: {
    marginLeft: "auto", padding: "0", background: "transparent", color: "#065f46",
    border: "none", fontSize: "20px", cursor: "pointer", fontWeight: "bold", lineHeight: 1
  },
  loadingState: { textAlign: "center", padding: "40px 20px", color: "#64748b" },
  loadingHint: { fontSize: "12px", color: "#94a3b8", marginTop: "8px" },
  spinner: {
    width: 40, height: 40, border: "4px solid #f1f5f9", borderTop: "4px solid #dc2626",
    borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px"
  },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyText: { fontSize: "16px", fontWeight: "600", color: "#64748b", margin: "16px 0 8px" },
  emptySubtext: { fontSize: "14px", color: "#94a3b8", margin: "0 0 16px 0" },
  retryButton: {
    padding: "8px 16px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0",
    borderRadius: "6px", fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
    display: "inline-flex", alignItems: "center", gap: "6px"
  }
};

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