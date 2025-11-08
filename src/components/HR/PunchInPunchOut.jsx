import React, { useState, useEffect } from 'react';

const PunchinPunchout = () => {
  const [todayStatus, setTodayStatus] = useState({
    punchIn: null,
    punchInLocation: null,
    punchOut: null,
    punchOutLocation: null,
  });

  const [breakStatus, setBreakStatus] = useState({
    breaks: [],
    isOnBreak: false,
  });

  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Mock data for attendance records
  useEffect(() => {
    const mockRecords = [
      { date: 'Oct 1, 2025', day: 'Wed', status: 'Verified Full Day', punchIn: '09:31 AM', punchOut: '05:31 PM' },
      { date: 'Oct 2, 2025', day: 'Thu', status: 'Leave', punchIn: '--:--', punchOut: '--:--' },
      { date: 'Oct 3, 2025', day: 'Fri', status: 'Verified Full Day', punchIn: '09:39 AM', punchOut: '05:43 PM' },
      { date: 'Oct 4, 2025', day: 'Sat', status: 'Verified Full Day', punchIn: '09:28 AM', punchOut: '05:36 PM' },
      { date: 'Oct 5, 2025', day: 'Sun', status: 'Holiday', punchIn: '--:--', punchOut: '--:--' },
      { date: 'Oct 6, 2025', day: 'Mon', status: 'Verified Full Day', punchIn: '09:28 AM', punchOut: '--:--' },
      { date: 'Oct 7, 2025', day: 'Tue', status: 'Verified Full Day', punchIn: '09:23 AM', punchOut: '05:34 PM' },
      { date: 'Oct 8, 2025', day: 'Wed', status: 'Verified Full Day', punchIn: '09:34 AM', punchOut: '05:32 PM' },
      { date: 'Oct 9, 2025', day: 'Thu', status: 'Half Day', punchIn: '09:26 AM', punchOut: '--:--' },
      { date: 'Oct 10, 2025', day: 'Fri', status: 'Not Marked', punchIn: '--:--', punchOut: '--:--' },
    ];
    setAttendanceRecords(mockRecords);

    // Mock today's status
    setTodayStatus({
      punchIn: '09:26 AM',
      punchInLocation: 'Vythiri',
      punchOut: null,
      punchOutLocation: null,
    });
  }, [selectedMonth]);

  const handlePunchIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setTodayStatus(prev => ({
      ...prev,
      punchIn: time,
      punchInLocation: 'Vythiri',
    }));
  };

  const handlePunchOut = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setTodayStatus(prev => ({
      ...prev,
      punchOut: time,
      punchOutLocation: 'Vythiri',
    }));
  };

  const handleBreakPunchIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    if (breakStatus.isOnBreak) {
      const updatedBreaks = [...breakStatus.breaks];
      const lastBreak = updatedBreaks[updatedBreaks.length - 1];
      lastBreak.end = time;
      
      setBreakStatus({
        breaks: updatedBreaks,
        isOnBreak: false,
      });
    } else {
      setBreakStatus(prev => ({
        breaks: [...prev.breaks, { start: time, end: null }],
        isOnBreak: true,
      }));
    }
  };

  const handleBreakPunchOut = () => {
    if (breakStatus.isOnBreak) {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const updatedBreaks = [...breakStatus.breaks];
      const lastBreak = updatedBreaks[updatedBreaks.length - 1];
      lastBreak.end = time;
      
      setBreakStatus({
        breaks: updatedBreaks,
        isOnBreak: false,
      });
    }
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      'Verified Full Day': { backgroundColor: "#d1fae5", color: "#065f46" },
      'Full Day': { backgroundColor: "#d1fae5", color: "#065f46" },
      'Verified Half Day': { backgroundColor: "#fef3c7", color: "#92400e" },
      'Half Day': { backgroundColor: "#fef3c7", color: "#92400e" },
      'Leave': { backgroundColor: "#fee2e2", color: "#991b1b" },
      'Holiday': { backgroundColor: "#dbeafe", color: "#1e40af" },
      'Not Marked': { backgroundColor: "#f3f4f6", color: "#374151" },
    };
    return statusStyles[status] || { backgroundColor: "#f3f4f6", color: "#374151" };
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Punch In/Punch Out</h2>
        <div style={styles.headerActions}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthInput}
          />
          <button onClick={handleRefresh} style={styles.refreshButton}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Daily Attendance */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Daily Attendance</h3>
        <div style={styles.statusCard}>
          <div style={styles.statusHeader}>
            <span style={styles.statusLabel}>Today's Status</span>
          </div>
          <div style={styles.statusDetails}>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Punch In:</span>
              <span style={styles.statusValue}>{todayStatus.punchIn || 'Not punched in yet'}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Punch In Location:</span>
              <span style={styles.statusValue}>{todayStatus.punchInLocation || 'Not punched in yet'}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Punch Out:</span>
              <span style={styles.statusValue}>{todayStatus.punchOut || 'Not punched out yet'}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Punch Out Location:</span>
              <span style={styles.statusValue}>{todayStatus.punchOutLocation || 'Not punched out yet'}</span>
            </div>
          </div>
        </div>
        <div style={styles.actionButtons}>
          <button 
            style={{...styles.punchInBtn, ...(todayStatus.punchIn !== null ? styles.buttonDisabled : {})}}
            onClick={handlePunchIn}
            disabled={todayStatus.punchIn !== null}
          >
            → Punch In
          </button>
          <button 
            style={{...styles.punchOutBtn, ...(todayStatus.punchIn === null || todayStatus.punchOut !== null ? styles.buttonDisabled : {})}}
            onClick={handlePunchOut}
            disabled={todayStatus.punchIn === null || todayStatus.punchOut !== null}
          >
            ← Punch Out
          </button>
        </div>
      </div>

      {/* Break Time Management */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Break Time Management</h3>
        <div style={styles.statusCard}>
          <div style={styles.statusHeader}>
            <span style={styles.statusLabel}>Today's Break Status</span>
          </div>
          <div style={styles.breakDetails}>
            {breakStatus.breaks.length === 0 ? (
              <div style={styles.noBreaks}>No breaks taken today</div>
            ) : (
              breakStatus.breaks.map((breakItem, index) => (
                <div key={index} style={styles.breakItem}>
                  <span style={styles.breakLabel}>Break {index + 1}:</span>
                  <span style={styles.breakTime}>
                    {breakItem.start} to {breakItem.end || 'In progress...'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div style={styles.actionButtons}>
          <button 
            style={{...styles.breakInBtn, ...(todayStatus.punchIn === null || todayStatus.punchOut !== null ? styles.buttonDisabled : {})}}
            onClick={handleBreakPunchIn}
            disabled={todayStatus.punchIn === null || todayStatus.punchOut !== null}
          >
            ☕ Break Punch In
          </button>
          <button 
            style={{...styles.breakOutBtn, ...(!breakStatus.isOnBreak ? styles.buttonDisabled : {})}}
            onClick={handleBreakPunchOut}
            disabled={!breakStatus.isOnBreak}
          >
            ⏸ Break Punch Out
          </button>
        </div>
      </div>

      {/* Attendance Records */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>My Attendance Records</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Day</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Punch In</th>
                <th style={styles.tableHeader}>Punch Out</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.noResults}>
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record, index) => (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.tableCell}>{record.date}</td>
                    <td style={styles.tableCell}>{record.day}</td>
                    <td style={styles.tableCell}>
                      <span style={{...styles.statusBadge, ...getStatusStyle(record.status)}}>
                        {record.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{record.punchIn}</td>
                    <td style={styles.tableCell}>{record.punchOut}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "1000px",
    marginBottom: "20px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  monthInput: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    width: "160px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
  },
  refreshButton: {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "20px",
    width: "100%",
    maxWidth: "1000px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 20px 0",
  },
  statusCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
  },
  statusHeader: {
    marginBottom: "16px",
  },
  statusLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
  },
  statusDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "8px",
    borderBottom: "1px solid #e5e7eb",
  },
  statusValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#111827",
  },
  breakDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  breakItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "6px",
    borderLeft: "4px solid #ffa726",
  },
  breakLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
  },
  breakTime: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    fontFamily: "'Courier New', monospace",
  },
  noBreaks: {
    textAlign: "center",
    color: "#9ca3af",
    fontStyle: "italic",
    padding: "20px",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  punchInBtn: {
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#10b981",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  punchOutBtn: {
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  breakInBtn: {
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#f59e0b",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  breakOutBtn: {
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  tableContainer: {
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
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
  },
  tableCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};

export default PunchinPunchout;