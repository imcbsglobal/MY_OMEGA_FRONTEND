import { useEffect, useState } from "react";
import api from "../../api/client";

export default function LateList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const loadLate = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hr/late-requests/");

      const lateData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setData(lateData);
    } catch (err) {
      console.error(err);
      alert("Failed loading late list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLate();
  }, []);

  const review = async (id, status) => {
    try {
      await api.post(`/hr/late-requests/${id}/review/`, {
        status,
        admin_comment: "",
      });
      loadLate();
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  const filteredData = data.filter((row) => {
    const matchesName = filterName.trim() === "" || 
      row.user_name?.toLowerCase().includes(filterName.toLowerCase());
    const matchesDepartment = filterDepartment.trim() === "" || 
      row.department?.toLowerCase().includes(filterDepartment.toLowerCase());
    return matchesName && matchesDepartment;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header} className="header">
        <h2 style={styles.title}>Late List</h2>
        
        <div style={styles.filterContainer} className="filter-container">
          <input
            type="text"
            placeholder="Filter by name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={styles.filterInput}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Filter by department..."
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={styles.filterInput}
            className="filter-input"
          />
        </div>
      </div>

      {/* Desktop View */}
      <div className="desktop-view" style={styles.desktopView}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeaderRow}>
              <tr>
                <th style={styles.tableHeader}>SL</th>
                <th style={styles.tableHeader}>Employee</th>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Minutes Late</th>
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
                  <td style={styles.tableCell}>{row.date}</td>
                  <td style={styles.tableCell}>{row.late_by_minutes} min</td>
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

          {!loading && filteredData.length === 0 && (
            <div style={styles.noResults}>No results found</div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="mobile-view" style={styles.mobileView}>
        {filteredData.map((row, i) => (
          <div key={row.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardNumber}>#{i + 1}</span>
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
            </div>

            <div style={styles.cardBody}>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Employee:</span>
                <span style={styles.cardValue}>{row.user_name}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Date:</span>
                <span style={styles.cardValue}>{row.date}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Minutes Late:</span>
                <span style={styles.cardValue}>{row.late_by_minutes} min</span>
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Reason:</span>
                <span style={styles.cardValue}>{row.reason}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Reviewed By:</span>
                <span style={styles.cardValue}>{row.reviewed_by_name || "-"}</span>
              </div>
            </div>

            {row.status === "pending" && (
              <div style={styles.cardActions}>
                <button
                  style={styles.approveBtnMobile}
                  onClick={() => review(row.id, "approved")}
                >
                  Approve
                </button>
                <button
                  style={styles.rejectBtnMobile}
                  onClick={() => review(row.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {!loading && filteredData.length === 0 && (
          <div style={styles.noResults}>No results found</div>
        )}
      </div>

      {/* Inline CSS for responsive behavior */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-view {
            display: none !important;
          }
          .mobile-view {
            display: block !important;
          }
          .header {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .filter-container {
            width: 100% !important;
            flex-direction: column !important;
          }
          .filter-input {
            width: 100% !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-view {
            display: none !important;
          }
        }
      `}</style>
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

  header: {
    marginBottom: "20px",
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

  // Desktop View
  desktopView: {
    display: "block",
  },

  // Mobile View
  mobileView: {
    display: "none",
  },

  tableWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    padding: "10px 0",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
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

  // Mobile Card Styles
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    marginBottom: "16px",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },

  cardNumber: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#475569",
  },

  cardBody: {
    padding: "16px",
  },

  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    gap: "12px",
  },

  cardLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    minWidth: "120px",
  },

  cardValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e293b",
    textAlign: "right",
    flex: 1,
    wordBreak: "break-word",
  },

  cardActions: {
    display: "flex",
    gap: "10px",
    padding: "16px",
    borderTop: "1px solid #e2e8f0",
  },

  // Status Badges
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
    display: "inline-block",
  },

  statusApproved: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
    display: "inline-block",
  },

  statusRejected: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
    display: "inline-block",
  },

  // Desktop Buttons
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

  // Mobile Buttons
  approveBtnMobile: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    border: "1px solid #86efac",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  rejectBtnMobile: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
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