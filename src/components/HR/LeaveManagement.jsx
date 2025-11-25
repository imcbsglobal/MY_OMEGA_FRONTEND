// src/components/HR/LeaveManagement.jsx
import React, { useEffect, useState } from "react";
import api from "@/api/client";

export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState("leave"); // leave | late | early
  const [leaveData, setLeaveData] = useState([]);
  const [lateData, setLateData] = useState([]);
  const [earlyData, setEarlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // LOAD DATA
  // ============================
  const loadAll = async () => {
    try {
      setLoading(true);
      const [leaveRes, lateRes, earlyRes] = await Promise.all([
        api.get("/hr/leave-requests/"),
        api.get("/hr/late-requests/"),
        api.get("/hr/early-requests/"),
      ]);

      setLeaveData(leaveRes.data || []);
      setLateData(lateRes.data || []);
      setEarlyData(earlyRes.data || []);
    } catch (err) {
      alert("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ============================
  // UPDATE STATUS
  // ============================
  const updateStatus = async (type, id, status) => {
    let url = "";

    if (type === "leave") url = `/hr/leave-requests/${id}/review/`;
    if (type === "late") url = `/hr/late-requests/${id}/review/`;
    if (type === "early") url = `/hr/early-requests/${id}/review/`;

    try {
      await api.post(url, {
        status,
        admin_comment: "",
      });
      alert("Status updated");
      loadAll();
    } catch (err) {
      alert("Update failed");
    }
  };

  // ============================
  // RENDER STATUS BADGE
  // ============================
  const renderStatus = (status) => {
    if (status === "approved")
      return <span style={styles.statusApproved}>Approved</span>;
    if (status === "rejected")
      return <span style={styles.statusRejected}>Rejected</span>;
    return <span style={styles.statusPending}>Pending</span>;
  };

  // ============================
  // RENDER TABLES
  // ============================
  const renderLeave = () => (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.tableHeader}>SL NO</th>
            <th style={styles.tableHeader}>EMPLOYEE</th>
            <th style={styles.tableHeader}>LEAVE TYPE</th>
            <th style={styles.tableHeader}>FROM</th>
            <th style={styles.tableHeader}>TO</th>
            <th style={styles.tableHeader}>REASON</th>
            <th style={styles.tableHeader}>STATUS</th>
            <th style={styles.tableHeader}>REVIEWED BY</th>
            <th style={styles.tableHeader}>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {leaveData.length === 0 ? (
            <tr>
              <td colSpan="9" style={styles.noResults}>
                No leave requests found
              </td>
            </tr>
          ) : (
            leaveData.map((row, i) => (
              <tr key={row.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{i + 1}</td>
                <td style={styles.tableCell}>{row.user_name}</td>
                <td style={styles.tableCell}>{row.leave_type_display}</td>
                <td style={styles.tableCell}>{row.from_date}</td>
                <td style={styles.tableCell}>{row.to_date}</td>
                <td style={styles.tableCell}>{row.reason}</td>
                <td style={styles.tableCell}>{renderStatus(row.status)}</td>
                <td style={styles.tableCell}>{row.reviewed_by_name || "-"}</td>
                <td style={styles.tableCell}>
                  {row.status === "pending" ? (
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => updateStatus("leave", row.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => updateStatus("leave", row.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={styles.completedText}>Completed</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderLate = () => (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.tableHeader}>SL NO</th>
            <th style={styles.tableHeader}>EMPLOYEE</th>
            <th style={styles.tableHeader}>DATE</th>
            <th style={styles.tableHeader}>MINUTES LATE</th>
            <th style={styles.tableHeader}>REASON</th>
            <th style={styles.tableHeader}>STATUS</th>
            <th style={styles.tableHeader}>REVIEWED BY</th>
            <th style={styles.tableHeader}>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {lateData.length === 0 ? (
            <tr>
              <td colSpan="8" style={styles.noResults}>
                No late requests found
              </td>
            </tr>
          ) : (
            lateData.map((row, i) => (
              <tr key={row.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{i + 1}</td>
                <td style={styles.tableCell}>{row.user_name}</td>
                <td style={styles.tableCell}>{row.date}</td>
                <td style={styles.tableCell}>{row.late_by_minutes}</td>
                <td style={styles.tableCell}>{row.reason}</td>
                <td style={styles.tableCell}>{renderStatus(row.status)}</td>
                <td style={styles.tableCell}>{row.reviewed_by_name || "-"}</td>
                <td style={styles.tableCell}>
                  {row.status === "pending" ? (
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => updateStatus("late", row.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => updateStatus("late", row.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={styles.completedText}>Completed</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderEarly = () => (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.tableHeader}>SL NO</th>
            <th style={styles.tableHeader}>EMPLOYEE</th>
            <th style={styles.tableHeader}>DATE</th>
            <th style={styles.tableHeader}>MINUTES EARLY</th>
            <th style={styles.tableHeader}>REASON</th>
            <th style={styles.tableHeader}>STATUS</th>
            <th style={styles.tableHeader}>REVIEWED BY</th>
            <th style={styles.tableHeader}>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {earlyData.length === 0 ? (
            <tr>
              <td colSpan="8" style={styles.noResults}>
                No early requests found
              </td>
            </tr>
          ) : (
            earlyData.map((row, i) => (
              <tr key={row.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{i + 1}</td>
                <td style={styles.tableCell}>{row.user_name}</td>
                <td style={styles.tableCell}>{row.date}</td>
                <td style={styles.tableCell}>{row.early_by_minutes}</td>
                <td style={styles.tableCell}>{row.reason}</td>
                <td style={styles.tableCell}>{renderStatus(row.status)}</td>
                <td style={styles.tableCell}>{row.reviewed_by_name || "-"}</td>
                <td style={styles.tableCell}>
                  {row.status === "pending" ? (
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => updateStatus("early", row.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => updateStatus("early", row.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={styles.completedText}>Completed</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>
          Loading leave data...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Leave Management</h2>
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        <button
          style={
            activeTab === "leave"
              ? { ...styles.tabBtn, ...styles.tabActive }
              : styles.tabBtn
          }
          onClick={() => setActiveTab("leave")}
        >
          Leave Requests
        </button>

        <button
          style={
            activeTab === "late"
              ? { ...styles.tabBtn, ...styles.tabActive }
              : styles.tabBtn
          }
          onClick={() => setActiveTab("late")}
        >
          Late Requests
        </button>

        <button
          style={
            activeTab === "early"
              ? { ...styles.tabBtn, ...styles.tabActive }
              : styles.tabBtn
          }
          onClick={() => setActiveTab("early")}
        >
          Early Requests
        </button>
      </div>

      {activeTab === "leave" && renderLeave()}
      {activeTab === "late" && renderLate()}
      {activeTab === "early" && renderEarly()}
    </div>
  );
}

/* ======================= INTERVIEW MANAGEMENT STYLE ======================= */

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },

  tabsRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },

  tabBtn: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  tabActive: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },

  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHeaderRow: {
    backgroundColor: "#f3f4f6",
  },

  tableHeader: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
  },

  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },

  tableCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
  },

  statusPending: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },

  statusApproved: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },

  statusRejected: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },

  actionButtons: {
    display: "flex",
    gap: "6px",
  },

  approveBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#059669",
    backgroundColor: "#d1fae5",
    border: "1px solid #a7f3d0",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  rejectBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  completedText: {
    color: "#6b7280",
    fontStyle: "italic",
  },

  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};