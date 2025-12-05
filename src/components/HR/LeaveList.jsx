import { useEffect, useState } from "react";
import api from "../../api/client";

export default function LeaveList() {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeave = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hr/leave-requests/")

      setLeaveData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load leave list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeave();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.post(`/hr/leave-requests/${id}/review/`, {
        status,
        admin_comment: "",
      });
      loadLeave();
    } catch (err) {
      alert("Failed to update");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Leave List</h2>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHeaderRow}>
            <tr>
              <th style={styles.tableHeader}>SL</th>
              <th style={styles.tableHeader}>Employee</th>
              <th style={styles.tableHeader}>Leave Type</th>
              <th style={styles.tableHeader}>From</th>
              <th style={styles.tableHeader}>To</th>
              <th style={styles.tableHeader}>Reason</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Reviewed By</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaveData.map((row, i) => (
              <tr key={row.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{i + 1}</td>
                <td style={styles.tableCell}>{row.user_name}</td>
                <td style={styles.tableCell}>{row.leave_type_display}</td>
                <td style={styles.tableCell}>{row.from_date}</td>
                <td style={styles.tableCell}>{row.to_date}</td>
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
                        onClick={() => updateStatus(row.id, "approved")}
                      >
                        Approve
                      </button>

                      <button
                        style={styles.rejectBtn}
                        onClick={() => updateStatus(row.id, "rejected")}
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

        {!loading && leaveData.length === 0 && (
          <div style={styles.noResults}>No results found</div>
        )}
      </div>
    </div>
  );
}
const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },

  tableWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    padding: "8px 0",
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

  // STATUS PILLS ---------------------------------------------------

  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },

  statusApproved: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },

  statusRejected: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },

  // ACTION BUTTONS ------------------------------------------------

  actionButtons: {
    display: "flex",
    gap: "10px",
  },

  viewBtn: {
    padding: "6px 14px",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    border: "1px solid #86efac",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  editBtn: {
    padding: "6px 14px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    border: "1px solid #93c5fd",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  deleteBtn: {
    padding: "6px 14px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  approveBtn: {
    padding: "6px 14px",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    border: "1px solid #86efac",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  rejectBtn: {
    padding: "6px 14px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  completedText: {
    fontStyle: "italic",
    color: "#6b7280",
    fontWeight: "500",
  },

  noResults: {
    padding: "35px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};
