import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "@/api/client";

export default function LeaveManagement() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("leave");
  const [leaveData, setLeaveData] = useState([]);
  const [earlyData, setEarlyData] = useState([]);
  const [lateData, setLateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // =========================
  // LOAD USER DATA
  // =========================
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(userData);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      setUser({});
    }
  }, []);

  // =========================
  // LOAD ALL DATA
  // =========================
  const loadAllData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load Leave Requests
      try {
        const leaveRes = await api.get("/hr/leave/");
        const allLeave = extractData(leaveRes.data);
        setLeaveData(allLeave.filter(r => r.user === user.id));
      } catch (error) {
        console.error("Failed to load leave data:", error);
      }

      // Load Early Requests
      try {
        const earlyRes = await api.get("/hr/early-requests/");
        const allEarly = extractData(earlyRes.data);
        setEarlyData(allEarly.filter(r => r.user === user.id));
      } catch (error) {
        console.error("Failed to load early data:", error);
      }

      // Load Late Requests
      try {
        const lateRes = await api.get("/hr/late-requests/");
        const allLate = extractData(lateRes.data);
        setLateData(allLate.filter(r => r.user === user.id));
      } catch (error) {
        console.error("Failed to load late data:", error);
      }

    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract data from different response structures
  const extractData = (data) => {
    if (Array.isArray(data)) {
      return data;
    } else if (data?.results && Array.isArray(data.results)) {
      return data.results;
    } else if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // =========================
  // DELETE RECORD
  // =========================
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        let endpoint = "";
        if (activeTab === "leave") endpoint = `/hr/leave/${id}/`;
        else if (activeTab === "early") endpoint = `/hr/early-requests/${id}/`;
        else if (activeTab === "late") endpoint = `/hr/late-requests/${id}/`;

        await api.delete(endpoint);
        loadAllData();
      } catch (error) {
        console.error("Failed to delete record:", error);
      }
    }
  };

  // =========================
  // GET CURRENT DATA
  // =========================
  const getCurrentData = () => {
    if (activeTab === "leave") return leaveData;
    if (activeTab === "early") return earlyData;
    if (activeTab === "late") return lateData;
    return [];
  };

  // =========================
  // FILTER DATA
  // =========================
  const currentData = getCurrentData();
  const filteredData = currentData.filter(row => {
    const search = searchTerm.toLowerCase();
    return (
      row.leave_type_display?.toLowerCase().includes(search) ||
      row.request_type?.toLowerCase().includes(search) ||
      row.date?.toLowerCase().includes(search) ||
      row.from_date?.toLowerCase().includes(search) ||
      row.to_date?.toLowerCase().includes(search) ||
      row.status?.toLowerCase().includes(search) ||
      row.reason?.toLowerCase().includes(search)
    );
  });

  return (
    <div style={styles.page} className="leave-management">
      {/* HEADER */}
      <div style={styles.header} className="header-responsive">
        <h2 style={styles.title}>
          {activeTab === "leave" ? "Leave" : activeTab === "early" ? "Early" : "Late"} Management
        </h2>

        <div style={styles.rightHeader} className="header-actions">
          <input
            placeholder="Search..."
            style={styles.search}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabsContainer} className="tabs-responsive">
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "leave" ? styles.tabActive : {}),
          }}
          className="tab-btn"
          onClick={() => setActiveTab("leave")}
        >
          <span className="tab-label">Leave Requests</span>
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "early" ? styles.tabActive : {}),
          }}
          className="tab-btn"
          onClick={() => setActiveTab("early")}
        >
          <span className="tab-label">Early Requests</span>
          {earlyData.length > 0 && (
            <span style={styles.tabBadge}>{earlyData.length}</span>
          )}
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "late" ? styles.tabActive : {}),
          }}
          className="tab-btn"
          onClick={() => setActiveTab("late")}
        >
          <span className="tab-label">Late Requests</span>
          {lateData.length > 0 && (
            <span style={styles.tabBadge}>{lateData.length}</span>
          )}
        </button>
      </div>

      {/* TABLE CARD - Desktop View */}
      <div style={styles.card} className="desktop-table">
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>SL NO</th>
              {activeTab === "leave" && (
                <>
                  <th style={styles.th}>LEAVE TYPE</th>
                  <th style={styles.th}>FROM</th>
                  <th style={styles.th}>TO</th>
                </>
              )}
              {(activeTab === "early" || activeTab === "late") && (
                <>
                  <th style={styles.th}>DATE</th>
                  <th style={styles.th}>TIME</th>
                </>
              )}
              <th style={styles.th}>REASON</th>
              <th style={styles.th}>STATUS</th>
              <th style={styles.th}>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={styles.empty}>Loading...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.empty}>No records found</td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={row.id} style={styles.tableRow}>
                  <td style={styles.td}>{i + 1}</td>
                  {activeTab === "leave" && (
                    <>
                      <td style={styles.td}>{row.leave_type_display || row.leave_type || "N/A"}</td>
                      <td style={styles.td}>{row.from_date || "N/A"}</td>
                      <td style={styles.td}>{row.to_date || "N/A"}</td>
                    </>
                  )}
                  {(activeTab === "early" || activeTab === "late") && (
                    <>
                      <td style={styles.td}>{row.date || "N/A"}</td>
                      <td style={styles.td}>{row.time || row.requested_time || "N/A"}</td>
                    </>
                  )}
                  <td style={styles.td}>{row.reason || "N/A"}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(row.status === "Approved"
                          ? styles.statusApproved
                          : row.status === "Rejected"
                          ? styles.statusRejected
                          : styles.statusPending),
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                 <td style={styles.td}>
                  <div style={styles.actions}>
                    <Trash2
                      size={18}
                      style={styles.deleteIcon}
                      onClick={() => handleDelete(row.id)}
                    />
                  </div>
                </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="mobile-cards">
        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : filteredData.length === 0 ? (
          <div style={styles.empty}>No records found</div>
        ) : (
          filteredData.map((row, i) => (
            <div key={row.id} style={styles.mobileCard}>
              <div style={styles.mobileCardHeader}>
                <span style={styles.mobileCardNumber}>#{i + 1}</span>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...(row.status === "approved"
                      ? styles.statusApproved
                      : row.status === "rejected"
                      ? styles.statusRejected
                      : styles.statusPending),
                  }}
                >
                  {row.status}
                </span>
              </div>

              <div style={styles.mobileCardBody}>
                {activeTab === "leave" && (
                  <>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>Leave Type:</span>
                      <span style={styles.mobileValue}>{row.leave_type_display || row.leave_type || "N/A"}</span>
                    </div>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>From:</span>
                      <span style={styles.mobileValue}>{row.from_date || "N/A"}</span>
                    </div>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>To:</span>
                      <span style={styles.mobileValue}>{row.to_date || "N/A"}</span>
                    </div>
                  </>
                )}
                {(activeTab === "early" || activeTab === "late") && (
                  <>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>Date:</span>
                      <span style={styles.mobileValue}>{row.date || "N/A"}</span>
                    </div>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>Time:</span>
                      <span style={styles.mobileValue}>{row.time || row.requested_time || "N/A"}</span>
                    </div>
                  </>
                )}
                <div style={styles.mobileRow}>
                  <span style={styles.mobileLabel}>Reason:</span>
                  <span style={styles.mobileValue}>{row.reason || "N/A"}</span>
                </div>
              </div>

              <div style={styles.mobileCardFooter}>
                {/* <button style={styles.mobileActionBtn}>
                  <Pencil size={14} />
                  Edit
                </button> */}
                <button 
                  style={{...styles.mobileActionBtn, ...styles.mobileDeleteBtn}}
                  onClick={() => handleDelete(row.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div style={styles.footer} className="footer-responsive">
        <span style={styles.footerText}>
          Showing 1to {filteredData.length} of {filteredData.length} entries
        </span>
        <div style={styles.pagination}>
          <button style={styles.pageBtn}>Prev</button>
          <button style={styles.pageActive}>1</button>
          <button style={styles.pageBtn}>Next</button>
        </div>
      </div>

      {/* CSS FOR RESPONSIVE */}
      <style>{`
        @media (max-width: 768px) {
          .leave-management {
            padding: 16px !important;
          }

          .header-responsive {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px;
          }

          .header-responsive h2 {
            font-size: 22px !important;
          }

          .header-actions {
            width: 100%;
            flex-direction: column !important;
            gap: 12px !important;
          }

          .search-input {
            width: 100% !important;
          }

          

          .tabs-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .tabs-responsive::-webkit-scrollbar {
            display: none;
          }

          .tab-btn {
            flex-shrink: 0;
            padding: 10px 16px !important;
            font-size: 13px !important;
          }

          .tab-label {
            white-space: nowrap;
          }

          .desktop-table {
            display: none !important;
          }

          .mobile-cards {
            display: block !important;
          }

          .footer-responsive {
            flex-direction: column !important;
            gap: 16px;
            align-items: center !important;
          }

          .footer-responsive span {
            font-size: 13px !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-cards {
            display: none !important;
          }

          .desktop-table {
            display: block !important;
          }
        }

        @media (max-width: 480px) {
          .btn-text {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    padding: "24px",
    background: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },

  rightHeader: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  search: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    width: "320px",
    fontSize: "14px",
    outline: "none",
  },

  tabsContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    borderBottom: "2px solid #e5e7eb",
  },

  tab: {
    padding: "12px 24px",
    background: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    fontSize: "14px",
    fontWeight: "600",
    color: "#6b7280",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  tabActive: {
    color: "#3b82f6",
    borderBottomColor: "#3b82f6",
  },

  tabBadge: {
    background: "#3b82f6",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHeader: {
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },

  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  tableRow: {
    borderBottom: "1px solid #f3f4f6",
  },

  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
  },

  empty: {
    padding: "48px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "14px",
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    display: "inline-block",
  },

  statusApproved: {
    background: "#d1fae5",
    color: "#065f46",
  },

  statusRejected: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  statusPending: {
    background: "#fef3c7",
    color: "#92400e",
  },

  actions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  deleteIcon: {
    color: "#ef4444",
    cursor: "pointer",
  },

  footer: {
    marginTop: "20px",
    padding: "16px 20px",
    background: "#fff",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },

  footerText: {
    fontSize: "14px",
    color: "#6b7280",
  },

  pagination: {
    display: "flex",
    gap: "8px",
  },

  pageBtn: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
  },

  pageActive: {
    padding: "8px 14px",
    borderRadius: "6px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Mobile Card Styles
  mobileCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },

  mobileCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f3f4f6",
  },

  mobileCardNumber: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },

  mobileCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },

  mobileRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
  },

  mobileLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    minWidth: "80px",
  },

  mobileValue: {
    fontSize: "14px",
    color: "#374151",
    textAlign: "right",
    flex: 1,
  },

  mobileCardFooter: {
    display: "flex",
    gap: "8px",
    paddingTop: "12px",
    borderTop: "1px solid #f3f4f6",
  },

  mobileActionBtn: {
    flex: 1,
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },

  mobileDeleteBtn: {
    color: "#ef4444",
    borderColor: "#ef4444",
  },
};