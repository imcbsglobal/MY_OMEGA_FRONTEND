import React, { useEffect, useState } from "react";
import {
  Wallet, Plus, RefreshCw, X, Check, Briefcase, User, Calendar, Edit2, Trash2
} from "lucide-react";
import api from "../../api/client";

export default function Deduction() {
  const [deductions, setDeductions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================
     FORM STATE (MATCH BACKEND)
  ========================= */
  const [formData, setFormData] = useState({
    employee_id: "",
    deduction_type: "",
    year: new Date().getFullYear(),
    month: "",
    amount: ""
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    fetchEmployees();
    fetchDeductions();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("employee-management/employees/");
      setEmployees(res.data?.results || res.data || []);
    } catch (err) {
      console.error("Employee load error", err);
    }
  };

  const fetchDeductions = async () => {
    try {
      setLoading(true);
      const res = await api.get("payroll/deductions/");
      setDeductions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Unable to load deductions");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ADD DEDUCTION
  ========================= */
  const handleAddDeduction = async () => {
    if (!formData.employee_id || !formData.deduction_type || !formData.month || !formData.amount) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("payroll/payroll/add-deduction/", {
        employee_id: Number(formData.employee_id),
          deduction_type: formData.deduction_type.trim().toUpperCase(),
        year: Number(formData.year),
        month: formData.month,
        amount: Number(formData.amount),
      });

      setSuccess("Deduction added successfully");
      fetchDeductions();

      setFormData({
        employee_id: "",
        deduction_type: "",
        year: new Date().getFullYear(),
        month: "",
        amount: ""
      });
    } catch {
      setError("Failed to add deduction");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS (SAFE)
  ========================= */
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Wallet size={28} color="#dc2626" />
        <h2 style={styles.title}>Deduction Management</h2>
        <button onClick={fetchDeductions} style={styles.refreshButton}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <div style={styles.errorMessage}><X /> {error}</div>}
      {success && <div style={styles.successMessage}><Check /> {success}</div>}

      {/* ADD FORM */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}><Plus /> Add New Deduction</h3>

        <div style={styles.formGrid}>
          <select
            value={formData.employee_id}
            onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
            style={styles.select}
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name || emp.employee_id || emp.id}
              </option>
            ))}
          </select>

          <input
            placeholder="Deduction Type"
            value={formData.deduction_type}
            onChange={e => setFormData({ ...formData, deduction_type: e.target.value.toUpperCase() })}
            style={styles.input}
          />

          <select
            value={formData.year}
            onChange={e => setFormData({ ...formData, year: e.target.value })}
            style={styles.select}
          >
            {years.map(y => <option key={y}>{y}</option>)}
          </select>

          <select
            value={formData.month}
            onChange={e => setFormData({ ...formData, month: e.target.value })}
            style={styles.select}
          >
            <option value="">Select Month</option>
            {months.map(m => <option key={m}>{m}</option>)}
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            style={styles.input}
          />
        </div>

        <button onClick={handleAddDeduction} style={styles.addButton}>
          <Plus /> Add Deduction
        </button>
      </div>

      {/* LIST */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.cardTitle}>
            <Briefcase size={20} />
            All Deductions ({deductions.length})
          </h3>
          <div style={styles.stats}>
            <span style={styles.statItem}>Total: {deductions.length}</span>
          </div>
        </div>

        <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
              <tr style={styles.tableHeader}>
                <th style={{ ...styles.th, width: "60px" }}>#</th>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Deduction</th>
                <th style={{ ...styles.th, width: "100px" }}>Year</th>
                <th style={{ ...styles.th, width: "120px" }}>Month</th>
                <th style={{ ...styles.th, width: "120px", textAlign: "right" }}>Amount</th>
              </tr>
          </thead>
          <tbody>
              {deductions.map((d, i) => (
                <tr key={d.id} style={styles.tableRow}>
                  <td style={styles.td}>{i + 1}</td>

                  <td style={styles.td}>
                    <div style={styles.employeeName}>
                      <User size={16} color="#64748b" />
                      <span>{d.employee_name || "—"}</span>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.deductionName}>
                      <Briefcase size={16} color="#64748b" />
                      <span>{d.deduction_type}</span>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.yearBadge}>{d.year || "—"}</span>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.monthBadge}><Calendar size={14} />{d.month || "—"}</span>
                  </td>

                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <span style={styles.amount}>{formatCurrency(d.amount)}</span>
                  </td>

                  
                </tr>
              ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1400, margin: "0 auto", padding: "20px" },
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
  buttonGroup: { display: "flex", gap: 12, flexWrap: "wrap" },
  addButton: {
    padding: "12px 24px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8,
    fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, transition: "all 0.2s", cursor: "pointer"
  },
  addMoreButton: {
    padding: "12px 24px", background: "#059669", color: "#fff", border: "none", borderRadius: 8,
    fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, transition: "all 0.2s", cursor: "pointer"
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
  employeeName: { display: "flex", alignItems: "center", gap: 8, fontWeight: "500", color: "#7c3aed" },
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