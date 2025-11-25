import React, { useState, useEffect } from "react";
import api from "../../api/client";

const PunchinPunchout = () => {

  const toIST12 = (utc) => {
    if (!utc) return null;
    const d = new Date(utc);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const [todayStatus, setTodayStatus] = useState({
    punchIn: null,
    punchInLocation: null,
    punchOut: null,
    punchOutLocation: null,
  });

  const [breakStatus, setBreakStatus] = useState({
    breaks: [],
    isOnBreak: false,
    currentBreakId: null,
  });

  const formatToIST12 = (utcString) => {
    if (!utcString) return null;
    const date = new Date(utcString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const [selectedMonth, setSelectedMonth] = useState("2025-11");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPunching, setIsPunching] = useState(false);
  const [isBreakProcessing, setIsBreakProcessing] = useState(false);

  // ✅ Load today's status
  const loadTodayStatus = async () => {
    try {
      const { data } = await api.get("/hr/attendance/today_status/");
      setTodayStatus({
        punchIn: formatToIST12(data?.punch_in_time),
        punchInLocation: data?.punch_in_location || null,
        punchOut: formatToIST12(data?.punch_out_time),
        punchOutLocation: data?.punch_out_location || null,
      });
    } catch (err) {
      console.error("❌ Failed to load today's status:", err);
    }
  };

  // ✅ Load today's breaks with better error handling
  const loadTodayBreaks = async () => {
    try {
      const { data } = await api.get("/hr/attendance/today_breaks/");
      
      // Handle multiple response formats
      let breaksArray = [];
      if (Array.isArray(data)) {
        breaksArray = data;
      } else if (data.breaks && Array.isArray(data.breaks)) {
        breaksArray = data.breaks;
      } else if (data.data && Array.isArray(data.data)) {
        breaksArray = data.data;
      }

      // Transform to consistent format
      const breaks = breaksArray.map(b => ({
        id: b.id,
        start: formatToIST12(b.break_in || b.start_time || b.break_start),
        end: (b.break_out || b.end_time || b.break_end) 
          ? formatToIST12(b.break_out || b.end_time || b.break_end) 
          : null,
      }));

      // Check if there's an ongoing break
      const ongoingBreak = breaks.find(b => !b.end);
      
      setBreakStatus({
        breaks,
        isOnBreak: !!ongoingBreak,
        currentBreakId: ongoingBreak?.id || null,
      });
    } catch (err) {
      console.error("❌ Failed to load today's breaks:", err);
      // Reset to safe state if API fails
      setBreakStatus({
        breaks: [],
        isOnBreak: false,
        currentBreakId: null,
      });
    }
  };

  // ✅ Load monthly attendance summary
  const loadMonthlySummary = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-");
      const { data } = await api.get(
        `/hr/attendance/my_records/?month=${parseInt(month)}&year=${year}`
      );
      setAttendanceRecords(data.records || data || []);
    } catch (err) {
      console.error("❌ Failed to load attendance summary:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reverse-geocode to get human-readable address
  const getAddressFromLocation = async (lat, lon) => {
    try {
      const { data } = await api.post("/hr/reverse-geocode-bigdata/", {
        latitude: lat,
        longitude: lon,
      });
      return data?.address || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    } catch {
      return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    }
  };

  // ✅ Punch In
  const handlePunchIn = async () => {
    if (isPunching || todayStatus.punchIn) return;
    setIsPunching(true);

    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const locationName = await getAddressFromLocation(latitude, longitude);
          console.log("📍 Punch-In location:", locationName);

          const resp = await api.post("/hr/attendance/punch_in/", {
            latitude,
            longitude,
            location: locationName,
          });

          console.log("✅ Punch In Response:", resp.data);

          setTodayStatus((prev) => ({
            ...prev,
            punchIn:
              resp.data.punch_in_time ||
              new Date().toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              }),
            punchInLocation:
              resp.data.punch_in_location || locationName || "Unknown",
          }));

          await loadMonthlySummary();
        },
        (err) => {
          console.error("⚠️ Location error:", err);
          alert("Enable location services for punch-in.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (err) {
      console.error("❌ Punch in failed:", err);
      alert("Punch in failed: " + (err?.response?.data?.detail || err.message));
    } finally {
      setIsPunching(false);
    }
  };

  // ✅ Punch Out
  const handlePunchOut = async () => {
    if (isPunching || todayStatus.punchOut || !todayStatus.punchIn) return;
    setIsPunching(true);

    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const locationName = await getAddressFromLocation(latitude, longitude);
          console.log("📍 Punch-Out location:", locationName);
          
          const resp = await api.post("/hr/attendance/punch_out/", {
            latitude,
            longitude,
            location: locationName,
          });

          console.log("✅ Punch Out Response:", resp.data);

          setTodayStatus((prev) => ({
            ...prev,
            punchOut:
              resp.data.punch_out_time ||
              new Date().toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
              }),
            punchOutLocation:
              resp.data.punch_out_location || locationName || "Unknown",
          }));

          await loadMonthlySummary();
        },
        (err) => {
          console.error("⚠️ Location error:", err);
          alert("Enable location services for punch-out.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (err) {
      console.error("❌ Punch out failed:", err);
      alert("Punch out failed: " + (err?.response?.data?.detail || err.message));
    } finally {
      setIsPunching(false);
    }
  };

  // ✅ Handle Break Start - Improved error handling
  const handleBreakStart = async () => {
    if (isBreakProcessing || breakStatus.isOnBreak) return;
    if (todayStatus.punchIn === null || todayStatus.punchOut !== null) {
      alert("Please punch in first and ensure you haven't punched out yet.");
      return;
    }

    setIsBreakProcessing(true);
    try {
      const resp = await api.post("/hr/attendance/start_break/");
      console.log("✅ Break Start Response:", resp.data);

      // Reload breaks immediately
      await loadTodayBreaks();
      
      // Show success message
      alert("Break started successfully!");
    } catch (err) {
      console.error("❌ Break start failed:", err);
      const errorMsg = err?.response?.data?.detail 
        || err?.response?.data?.error 
        || err?.response?.data?.message
        || err.message;
      alert("Break start failed: " + errorMsg);
    } finally {
      setIsBreakProcessing(false);
    }
  };

  // ✅ Handle Break End - Improved error handling
  const handleBreakEnd = async () => {
    if (isBreakProcessing || !breakStatus.isOnBreak) {
      alert("No active break to end.");
      return;
    }

    setIsBreakProcessing(true);
    try {
      const resp = await api.post("/hr/attendance/end_break/");
      console.log("✅ Break End Response:", resp.data);

      // Reload breaks immediately
      await loadTodayBreaks();
      
      // Show success message
      alert("Break ended successfully!");
    } catch (err) {
      console.error("❌ Break end failed:", err);
      
      // Better error message extraction
      const errorMsg = err?.response?.data?.detail 
        || err?.response?.data?.error 
        || err?.response?.data?.message
        || err.message;
      
      alert("Break end failed: " + errorMsg);
      
      // Reload break status to sync with server
      await loadTodayBreaks();
    } finally {
      setIsBreakProcessing(false);
    }
  };

  // ✅ Load data on mount/month change
  useEffect(() => {
    loadTodayStatus();
    loadTodayBreaks();
    loadMonthlySummary();
  }, [selectedMonth]);

  const getStatusStyle = (status) => {
    const statusStyles = {
      "Verified Full Day": { backgroundColor: "#d1fae5", color: "#065f46" },
      "Full Day": { backgroundColor: "#d1fae5", color: "#065f46" },
      "Verified Half Day": { backgroundColor: "#fef3c7", color: "#92400e" },
      "Half Day": { backgroundColor: "#fef3c7", color: "#92400e" },
      Leave: { backgroundColor: "#fee2e2", color: "#991b1b" },
      Holiday: { backgroundColor: "#dbeafe", color: "#1e40af" },
      "Not Marked": { backgroundColor: "#f3f4f6", color: "#374151" },
    };
    return statusStyles[status] || {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    };
  };

  const handleRefresh = () => {
    loadTodayStatus();
    loadTodayBreaks();
    loadMonthlySummary();
  };

  // ✅ UI
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
              <span style={styles.statusValue}>
                {todayStatus.punchIn || "Not punched in yet"}
              </span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Punch In Location:</span>
              <span style={styles.statusValue}>
                {todayStatus.punchInLocation || "Not punched in yet"}
              </span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Punch Out:</span>
              <span style={styles.statusValue}>
                {todayStatus.punchOut || "Not punched out yet"}
              </span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Punch Out Location:</span>
              <span style={styles.statusValue}>
                {todayStatus.punchOutLocation || "Not punched out yet"}
              </span>
            </div>
          </div>
        </div>
        <div style={styles.actionButtons}>
          <button
            style={{
              ...styles.punchInBtn,
              ...(todayStatus.punchIn !== null ? styles.buttonDisabled : {}),
            }}
            onClick={handlePunchIn}
            disabled={todayStatus.punchIn !== null || isPunching}
          >
            → Punch In
          </button>
          <button
            style={{
              ...styles.punchOutBtn,
              ...(todayStatus.punchIn === null || todayStatus.punchOut !== null
                ? styles.buttonDisabled
                : {}),
            }}
            onClick={handlePunchOut}
            disabled={
              todayStatus.punchIn === null ||
              todayStatus.punchOut !== null ||
              isPunching
            }
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
            {breakStatus.isOnBreak && (
              <span style={styles.activeBreakBadge}>● Break Active</span>
            )}
          </div>
          <div style={styles.breakDetails}>
            {breakStatus.breaks.length === 0 ? (
              <div style={styles.noBreaks}>No breaks taken today</div>
            ) : (
              breakStatus.breaks.map((b, i) => (
                <div key={b.id || i} style={styles.breakItem}>
                  <span style={styles.breakLabel}>Break {i + 1}:</span>
                  <span style={styles.breakTime}>
                    {b.start} to {b.end || "In progress..."}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div style={styles.actionButtons}>
          <button
            style={{
              ...styles.breakInBtn,
              ...(todayStatus.punchIn === null ||
              todayStatus.punchOut !== null ||
              breakStatus.isOnBreak
                ? styles.buttonDisabled
                : {}),
            }}
            onClick={handleBreakStart}
            disabled={
              todayStatus.punchIn === null ||
              todayStatus.punchOut !== null ||
              breakStatus.isOnBreak ||
              isBreakProcessing
            }
          >
            ☕ Start Break
          </button>
          <button
            style={{
              ...styles.breakOutBtn,
              ...(!breakStatus.isOnBreak ? styles.buttonDisabled : {}),
            }}
            onClick={handleBreakEnd}
            disabled={!breakStatus.isOnBreak || isBreakProcessing}
          >
            ⏸ End Break
          </button>
        </div>
      </div>

      {/* Attendance Records */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>My Attendance Records</h3>
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.noResults}>Loading...</div>
          ) : (
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
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...getStatusStyle(record.status),
                          }}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {formatToIST12(record.punch_in || record.punch_in_time)}
                      </td>
                      <td style={styles.tableCell}>
                        {formatToIST12(record.punch_out || record.punch_out_time)}
                      </td>
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
};

// ✅ Styles
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: { fontSize: "16px", fontWeight: "600", color: "#374151" },
  activeBreakBadge: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f59e0b",
    backgroundColor: "#fef3c7",
    padding: "4px 12px",
    borderRadius: "12px",
  },
  statusDetails: { display: "flex", flexDirection: "column", gap: "12px" },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "8px",
    borderBottom: "1px solid #e5e7eb",
  },
  statusValue: { fontSize: "14px", fontWeight: "500", color: "#111827" },
  breakDetails: { display: "flex", flexDirection: "column", gap: "8px" },
  breakItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "6px",
    borderLeft: "4px solid #ffa726",
  },
  breakLabel: { fontSize: "14px", fontWeight: "500", color: "#6b7280" },
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
  buttonDisabled: { opacity: 0.5, cursor: "not-allowed" },
  tableContainer: {
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeaderRow: { backgroundColor: "#f3f4f6" },
  tableHeader: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
  },
  tableRow: { borderBottom: "1px solid #e5e7eb" },
  tableCell: { padding: "12px 16px", fontSize: "14px", color: "#374151" },
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