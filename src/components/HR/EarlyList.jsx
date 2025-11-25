import { useEffect, useState } from "react";
import api from "../../api/client";

export default function EarlyList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEarly = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hr/early-requests/?month=11&year=2025");
      setData(res.data);
    } catch (err) {
      alert("Failed loading early list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarly();
  }, []);

  const review = async (id, status) => {
    try {
      await api.post(`/hr/early-requests/${id}/review/`, {
        status,
        admin_comment: "",
      });
      loadEarly();
    } catch (err) {
      alert("Failed to update");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Early List</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeaderRow}>
            <tr>
              <th style={styles.tableHeader}>SL</th>
              <th style={styles.tableHeader}>Employee</th>
              <th style={styles.tableHeader}>Date</th>
              <th style={styles.tableHeader}>Minutes Early</th>
              <th style={styles.tableHeader}>Reason</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Reviewed By</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={row.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{i + 1}</td>
                <td style={styles.tableCell}>{row.user_name}</td>
                <td style={styles.tableCell}>{row.date}</td>
                <td style={styles.tableCell}>{row.early_by_minutes} min</td>
                <td style={styles.tableCell}>{row.reason}</td>

                <td style={styles.tableCell}>
                  <span
                    style={
                      row.status === "approved"
                        ? styles.statusApproved
                        : row.status === "rejected"
                        ? styles.statusRejected
                        : styles.statusPending
                    }
                  >
                    {row.status}
                  </span>
                </td>

                <td style={styles.tableCell}>{row.reviewed_by_name || "-"}</td>

                <td style={styles.tableCell}>
                  {row.status === "pending" ? (
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => review(row.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => review(row.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={styles.completedText}>Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && data.length === 0 && (
          <div style={styles.noResults}>No results found</div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------
const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
  },

  tableWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    padding: "10px 0",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHeaderRow: {
    backgroundColor: "#f1f5f9",
  },

  tableHeader: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    borderBottom: "2px solid #e2e8f0",
    textTransform: "uppercase",
  },

  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    height: "60px",
  },

  tableCell: {
    padding: "14px 16px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#334155",
  },

  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
  },

  statusApproved: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
  },

  statusRejected: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
  },

  actionButtons: {
    display: "flex",
    gap: "10px",
  },

  approveBtn: {
    padding: "6px 14px",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    border: "1px solid #86efac",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  rejectBtn: {
    padding: "6px 14px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  completedText: {
    color: "#6b7280",
    fontStyle: "italic",
  },

  noResults: {
    padding: "30px",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "500",
    color: "#6b7280",
  },
};
