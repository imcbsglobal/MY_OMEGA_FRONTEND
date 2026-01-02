import { useEffect, useState } from "react";
import api from "../../api/client";

export default function LeaveList() {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const loadLeave = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hr/leave-requests/");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setLeaveData(data);
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

  // Filter logic
  const filteredData = leaveData.filter((row) => {
    const matchesName = filterName.trim() === "" || 
      row.user_name?.toLowerCase().includes(filterName.toLowerCase());
    const matchesDepartment = filterDepartment.trim() === "" || 
      row.department?.toLowerCase().includes(filterDepartment.toLowerCase());
    return matchesName && matchesDepartment;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Leave List</h2>
        
        <div style={styles.filterContainer}>
          <input
            type="text"
            placeholder="Filter by name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={styles.filterInput}
          />
          <input
            type="text"
            placeholder="Filter by department..."
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={styles.filterInput}
          />
        </div>
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
            {filteredData.map((row, i) => (
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
                      row.status === "Approved"
                        ? styles.statusApproved
                        : row.status === "Rejected"
                        ? styles.statusRejected
                        : styles.statusPending
                    }
                  >
                    {row.status}
                  </span>
                </td>
                <td style={styles.tableCell}>{row.reviewed_by_name || "-"}</td>

                <td style={styles.tableCell}>
                  {row.status === "Pending" ? (
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => updateStatus(row.id, "Approved")}
                      >
                        Approve
                      </button>

                      <button
                        style={styles.rejectBtn}
                        onClick={() => updateStatus(row.id, "Rejected")}
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

        {!loading && filteredData.length === 0 && (
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },

  filterContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  filterInput: {
    padding: "10px 14px",
    fontSize: "14px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    width: "200px",
    transition: "all 0.3s",
    fontWeight: "500",
    color: "#334155",
  },

  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
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