// src/components/HR/TotalAttendanceSummary.jsx
import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import api from "../../api/client";

const ATTENDANCE_TYPES = {
  FULL_DAY: { label: "Full Day", color: "#10b981" },
  VERIFIED: { label: "Verified Full Day", color: "#3b82f6" },
  HALF_DAY: { label: "Half Day", color: "#f59e0b" },
  VERIFIED_HALF: { label: "Verified Half Day", color: "#f43f5e" },
  LEAVE: { label: "Leave", color: "#ef4444" },
  HOLIDAY: { label: "Holiday", color: "#eab308" },
  NOT_MARKED: { label: "Not Marked", color: "#9ca3af" }
};

export default function TotalAttendanceSummary({ isOpen, onClose, selectedMonth, employees }) {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overallStats, setOverallStats] = useState({
    totalEmployees: 0,
    totalFullDays: 0,
    totalVerifiedFullDays: 0,
    totalHalfDays: 0,
    totalVerifiedHalfDays: 0,
    totalLeaves: 0,
    totalNotMarked: 0
  });

  useEffect(() => {
    if (isOpen && selectedMonth && employees.length > 0) {
      calculateTotalSummary();
    }
  }, [isOpen, selectedMonth, employees]);

  const calculateTotalSummary = async () => {
    setLoading(true);
    try {
      const employeeSummaries = employees.map(emp => {
        const stats = {
          id: emp.id,
          name: emp.name,
          userId: emp.userId,
          fullDaysUnverified: 0,
          verifiedFullDays: 0,
          halfDaysUnverified: 0,
          verifiedHalfDays: 0,
          leaves: 0,
          notMarked: 0,
          totalDays: 0
        };

        const [year, month] = selectedMonth.split("-");
        const daysInMonth = new Date(year, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
          const dayOfWeek = new Date(year, month - 1, day).getDay();
          const isSunday = dayOfWeek === 0;

          if (isSunday) continue; // Skip Sundays (holidays)

          const record = emp.records[date];

          if (!record) {
            stats.notMarked++;
          } else {
            const status = (record.status || "").toLowerCase();
            const verified = (record.verification_status || "").toLowerCase() === "verified" || record.is_verified;

            if (status === "full" || status === "present") {
              if (verified) {
                stats.verifiedFullDays++;
              } else {
                stats.fullDaysUnverified++;
              }
            } else if (status === "half") {
              if (verified) {
                stats.verifiedHalfDays++;
              } else {
                stats.halfDaysUnverified++;
              }
            } else if (status === "leave") {
              stats.leaves++;
            } else {
              stats.notMarked++;
            }
          }
        }

        stats.totalDays = stats.fullDaysUnverified + stats.verifiedFullDays + 
                          stats.halfDaysUnverified + stats.verifiedHalfDays + 
                          stats.leaves + stats.notMarked;

        return stats;
      });

      setSummaryData(employeeSummaries);

      // Calculate overall statistics
      const overall = employeeSummaries.reduce((acc, emp) => ({
        totalEmployees: acc.totalEmployees + 1,
        totalFullDays: acc.totalFullDays + emp.fullDaysUnverified,
        totalVerifiedFullDays: acc.totalVerifiedFullDays + emp.verifiedFullDays,
        totalHalfDays: acc.totalHalfDays + emp.halfDaysUnverified,
        totalVerifiedHalfDays: acc.totalVerifiedHalfDays + emp.verifiedHalfDays,
        totalLeaves: acc.totalLeaves + emp.leaves,
        totalNotMarked: acc.totalNotMarked + emp.notMarked
      }), {
        totalEmployees: 0,
        totalFullDays: 0,
        totalVerifiedFullDays: 0,
        totalHalfDays: 0,
        totalVerifiedHalfDays: 0,
        totalLeaves: 0,
        totalNotMarked: 0
      });

      setOverallStats(overall);
    } catch (error) {
      console.error("Failed to calculate summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Employee Name", "User ID", "Full Days", "Verified Full Days", "Half Days", "Verified Half Days", "Leaves", "Not Marked", "Total Days"];
    const rows = summaryData.map(emp => [
      emp.name,
      emp.userId,
      emp.fullDaysUnverified,
      emp.verifiedFullDays,
      emp.halfDaysUnverified,
      emp.verifiedHalfDays,
      emp.leaves,
      emp.notMarked,
      emp.totalDays
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_summary_${selectedMonth}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            Total Attendance Summary - {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Overall Statistics */}
        <div style={styles.overallStats}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Employees</div>
            <div style={styles.statValue}>{overallStats.totalEmployees}</div>
          </div>
          <div style={{...styles.statCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.FULL_DAY.color}`}}>
            <div style={styles.statLabel}>Full Days</div>
            <div style={styles.statValue}>{overallStats.totalFullDays}</div>
          </div>
          <div style={{...styles.statCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.VERIFIED.color}`}}>
            <div style={styles.statLabel}>Verified Full Days</div>
            <div style={styles.statValue}>{overallStats.totalVerifiedFullDays}</div>
          </div>
          <div style={{...styles.statCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.HALF_DAY.color}`}}>
            <div style={styles.statLabel}>Half Days</div>
            <div style={styles.statValue}>{overallStats.totalHalfDays}</div>
          </div>
          <div style={{...styles.statCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.VERIFIED_HALF.color}`}}>
            <div style={styles.statLabel}>Verified Half Days</div>
            <div style={styles.statValue}>{overallStats.totalVerifiedHalfDays}</div>
          </div>
          <div style={{...styles.statCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.LEAVE.color}`}}>
            <div style={styles.statLabel}>Leaves</div>
            <div style={styles.statValue}>{overallStats.totalLeaves}</div>
          </div>
          <div style={{...styles.statCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.NOT_MARKED.color}`}}>
            <div style={styles.statLabel}>Not Marked</div>
            <div style={styles.statValue}>{overallStats.totalNotMarked}</div>
          </div>
        </div>

        {/* Export Button */}
        <div style={styles.actionBar}>
          <button onClick={exportToCSV} style={styles.exportButton}>
            <Download size={18} />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Employee Details Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>Loading summary data...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>No</th>
                  <th style={styles.tableHeader}>Employee Name</th>
                  <th style={styles.tableHeader}>User ID</th>
                  <th style={styles.tableHeader}>Full Days</th>
                  <th style={styles.tableHeader}>Verified Full</th>
                  <th style={styles.tableHeader}>Half Days</th>
                  <th style={styles.tableHeader}>Verified Half</th>
                  <th style={styles.tableHeader}>Leaves</th>
                  <th style={styles.tableHeader}>Not Marked</th>
                  <th style={styles.tableHeader}>Total Days</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={styles.noData}>
                      No attendance data available
                    </td>
                  </tr>
                ) : (
                  summaryData.map((emp, index) => (
                    <tr key={emp.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{index + 1}</td>
                      <td style={{...styles.tableCell, textAlign: 'left', fontWeight: 600}}>{emp.name}</td>
                      <td style={styles.tableCell}>{emp.userId}</td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.badge, backgroundColor: ATTENDANCE_TYPES.FULL_DAY.color}}>
                          {emp.fullDaysUnverified}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.badge, backgroundColor: ATTENDANCE_TYPES.VERIFIED.color}}>
                          {emp.verifiedFullDays}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.badge, backgroundColor: ATTENDANCE_TYPES.HALF_DAY.color}}>
                          {emp.halfDaysUnverified}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.badge, backgroundColor: ATTENDANCE_TYPES.VERIFIED_HALF.color}}>
                          {emp.verifiedHalfDays}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.badge, backgroundColor: ATTENDANCE_TYPES.LEAVE.color}}>
                          {emp.leaves}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.badge, backgroundColor: ATTENDANCE_TYPES.NOT_MARKED.color}}>
                          {emp.notMarked}
                        </span>
                      </td>
                      <td style={{...styles.tableCell, fontWeight: 700}}>{emp.totalDays}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "1400px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "2px solid #e5e7eb",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 10,
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    transition: "background-color 0.2s",
  },
  overallStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    padding: "24px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  statCard: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },
  actionBar: {
    padding: "16px 24px",
    display: "flex",
    justifyContent: "flex-end",
    borderBottom: "1px solid #e5e7eb",
  },
  exportButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  tableContainer: {
    padding: "24px",
    overflowX: "auto",
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
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.15s",
  },
  tableCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
    display: "inline-block",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
  },
  noData: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
  },
};