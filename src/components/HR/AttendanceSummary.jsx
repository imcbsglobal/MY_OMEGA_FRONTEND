// src/components/HR/AttendanceSummary.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// API client
const api = {
  get: async (url) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`http://127.0.0.1:8000/api${url}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  },
};

const ATTENDANCE_TYPES = {
  FULL_DAY: { label: "Full Day", color: "#10b981" },
  VERIFIED: { label: "Verified", color: "#3b82f6" },
  HALF_DAY: { label: "Half Day", color: "#f59e0b" },
  VERIFIED_HALF: { label: "Verified Half Day", color: "#f43f5e" },
  LEAVE: { label: "Leave", color: "#ef4444" },
  HOLIDAY: { label: "Holiday", color: "#eab308" },
  NOT_MARKED: { label: "Not Marked", color: "#9ca3af" }
};

export default function AttendanceSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { employee, selectedMonth } = location.state || {};
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    fullDaysUnverified: 0,
    leaves: 0,
    verifiedFullDays: 0,
    notMarked: 0,
    halfDaysUnverified: 0,
    verifiedHalfDays: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee && selectedMonth) {
      fetchEmployeeAttendance();
    }
  }, [employee, selectedMonth]);

  const fetchEmployeeAttendance = async () => {
    if (!employee?.id) return;
    
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-");
      
      // Fetch employee's attendance records for the selected month
      // Using the my_records endpoint with user_id parameter
      const response = await api.get(`/hr/attendance/my_records/?month=${Number(month)}&year=${year}&user_id=${employee.id}`);
      const data = Array.isArray(response) ? response : (response.results || response.data || []);
      
      setAttendanceData(data);
      calculateSummaryStats(data);
    } catch (error) {
      console.error("Failed to fetch attendance summary:", error);
      alert("Failed to load attendance summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryStats = (records) => {
    const stats = {
      fullDaysUnverified: 0,
      leaves: 0,
      verifiedFullDays: 0,
      notMarked: 0,
      halfDaysUnverified: 0,
      verifiedHalfDays: 0
    };

    records.forEach(record => {
      const status = (record.status || "").toLowerCase();
      const verified = (record.verification_status || "").toLowerCase() === "verified";

      if (status === "full") {
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
      } else if (status === "holiday") {
        // Holidays are counted separately
      } else {
        stats.notMarked++;
      }
    });

    setSummaryStats(stats);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const getDayName = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { weekday: 'long' });
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusColor = (status, verified) => {
    const statusKey = (status || "").toLowerCase();
    const isVerified = verified === true || verified === "verified";
    
    if (statusKey === "full") return isVerified ? "#3b82f6" : "#10b981";
    if (statusKey === "half") return isVerified ? "#f43f5e" : "#f59e0b";
    if (statusKey === "leave") return "#ef4444";
    if (statusKey === "holiday") return "#eab308";
    return "#9ca3af";
  };

  const getStatusLabel = (status, verified) => {
    const statusKey = (status || "").toLowerCase();
    const isVerified = verified === true || verified === "verified";
    
    if (statusKey === "full") return isVerified ? "Verified Full Day" : "Full Day";
    if (statusKey === "half") return isVerified ? "Verified Half Day" : "Half Day";
    if (statusKey === "leave") return "Leave";
    if (statusKey === "holiday") return "Holiday";
    return "Not Marked";
  };

  const formatTime = (timeValue) => {
  if (!timeValue) return "-";

  try {
    let date;

    // ✅ If backend sends full ISO datetime
    if (typeof timeValue === "string" && timeValue.includes("T")) {
      date = new Date(timeValue);
    } 
    // ✅ If backend sends only HH:mm or HH:mm:ss
    else {
      date = new Date(`2000-01-01T${timeValue}`);
    }

    // ✅ Final time display format
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    console.error("Time parse error:", timeValue);
    return "-";
  }
};


  if (!employee) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>No Employee Data</h2>
          <p>Please go back and select an employee to view summary.</p>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>Attendance Summary for {employee.name}</h1>
        <div style={styles.monthSelector}>
          <span style={styles.monthLabel}>
            {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={{...styles.summaryCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.FULL_DAY.color}`}}>
          <div style={styles.summaryCardHeader}>
            <span style={styles.summaryCardTitle}>Full Days (Unverified)</span>
          </div>
          <div style={styles.summaryCardValue}>{summaryStats.fullDaysUnverified}</div>
        </div>

        <div style={{...styles.summaryCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.LEAVE.color}`}}>
          <div style={styles.summaryCardHeader}>
            <span style={styles.summaryCardTitle}>Leaves</span>
          </div>
          <div style={styles.summaryCardValue}>{summaryStats.leaves}</div>
        </div>

        <div style={{...styles.summaryCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.VERIFIED.color}`}}>
          <div style={styles.summaryCardHeader}>
            <span style={styles.summaryCardTitle}>Verified Full Days</span>
          </div>
          <div style={styles.summaryCardValue}>{summaryStats.verifiedFullDays}</div>
        </div>

        <div style={{...styles.summaryCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.NOT_MARKED.color}`}}>
          <div style={styles.summaryCardHeader}>
            <span style={styles.summaryCardTitle}>Not Marked</span>
          </div>
          <div style={styles.summaryCardValue}>{summaryStats.notMarked}</div>
        </div>

        <div style={{...styles.summaryCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.HALF_DAY.color}`}}>
          <div style={styles.summaryCardHeader}>
            <span style={styles.summaryCardTitle}>Half Days (Unverified)</span>
          </div>
          <div style={styles.summaryCardValue}>{summaryStats.halfDaysUnverified}</div>
        </div>

        <div style={{...styles.summaryCard, borderLeft: `4px solid ${ATTENDANCE_TYPES.VERIFIED_HALF.color}`}}>
          <div style={styles.summaryCardHeader}>
            <span style={styles.summaryCardTitle}>Verified Half Days</span>
          </div>
          <div style={styles.summaryCardValue}>{summaryStats.verifiedHalfDays}</div>
        </div>
      </div>

      {/* Attendance Details Table */}
      <div style={styles.tableContainer}>
        <h3 style={styles.tableTitle}>Attendance Details</h3>
        {loading ? (
          <div style={styles.loading}>Loading attendance data...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Day</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Punch In Time</th>
                <th style={styles.tableHeader}>Punch Out Time</th>
                <th style={styles.tableHeader}>Total Working Time</th>
                <th style={styles.tableHeader}>Punch In Location</th>
                <th style={styles.tableHeader}>Punch Out Location</th>
                <th style={styles.tableHeader}>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="9" style={styles.noData}>
                    No attendance records found for this month.
                  </td>
                </tr>
              ) : (
                attendanceData.map((record, index) => (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.tableCell}>{formatDate(record.date)}</td>
                    <td style={styles.tableCell}>{getDayName(record.date)}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(record.status, record.verification_status)
                      }}>
                        {getStatusLabel(record.status, record.verification_status)}
                      </span>
                    </td>
                 <td style={styles.tableCell}>
                    {formatTime(record.punch_in_time || record.punch_in || record.in_time)}
                    </td>
                   <td style={styles.tableCell}>
                    {formatTime(record.punch_out_time || record.punch_out || record.out_time)}
                    </td>
                    <td style={styles.tableCell}>{record.working_hours || "-"}</td>
                    <td style={styles.tableCell}>{record.punch_in_location || "-"}</td>
                    <td style={styles.tableCell}>{record.punch_out_location || "-"}</td>
                    <td style={styles.tableCell}>{record.note || record.admin_note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

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
  backButton: {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
    flex: 1,
    textAlign: "center",
  },
  monthSelector: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  monthLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#6b7280",
    padding: "8px 16px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  summaryCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  summaryCardHeader: {
    marginBottom: "12px",
  },
  summaryCardTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  summaryCardValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "auto",
    padding: "20px",
  },
  tableTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 16px 0",
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
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  tableCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
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
  errorContainer: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
};