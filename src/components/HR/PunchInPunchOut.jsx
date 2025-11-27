import React, { useState, useEffect } from "react";
import api from "../../api/client";

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
  const [isPunching, setIsPunching] = useState(false);
  const [isBreakProcessing, setIsBreakProcessing] = useState(false);

  // ✅ Attendance types with star icons and colors (same as AttendanceManagement)
  const ATTENDANCE_TYPES = {
    FULL_DAY: { label: "Full Day", color: "#10b981", icon: "full", status: "full" },
    VERIFIED: { label: "Verified", color: "#3b82f6", icon: "full", status: "full", verified: true },
    HALF_DAY: { label: "Half Day", color: "#f59e0b", icon: "half", status: "half" },
    VERIFIED_HALF: { label: "Verified Half Day", color: "#f43f5e", icon: "half", status: "half", verified: true },
    LEAVE: { label: "Leave", color: "#ef4444", icon: "full", status: "leave" },
    HOLIDAY: { label: "Holiday", color: "#eab308", icon: "full", status: "holiday" },
    NOT_MARKED: { label: "Not Marked", color: "#9ca3af", icon: "full" }
  };

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

  // ✅ Load today's breaks
  const loadTodayBreaks = async () => {
    try {
      const { data } = await api.get("/hr/attendance/today_breaks/");
      
      let breaksArray = [];
      if (Array.isArray(data)) {
        breaksArray = data;
      } else if (data.breaks && Array.isArray(data.breaks)) {
        breaksArray = data.breaks;
      } else if (data.data && Array.isArray(data.data)) {
        breaksArray = data.data;
      }

      const breaks = breaksArray.map(b => ({
        id: b.id,
        start: formatToIST12(b.break_in || b.start_time || b.break_start),
        end: (b.break_out || b.end_time || b.break_end) 
          ? formatToIST12(b.break_out || b.end_time || b.break_end) 
          : null,
      }));

      const ongoingBreak = breaks.find(b => !b.end);
      
      setBreakStatus({
        breaks,
        isOnBreak: !!ongoingBreak,
        currentBreakId: ongoingBreak?.id || null,
      });
    } catch (err) {
      console.error("❌ Failed to load today's breaks:", err);
      setBreakStatus({
        breaks: [],
        isOnBreak: false,
        currentBreakId: null,
      });
    }
  };

  // ✅ Load user's own monthly attendance records
  const loadMyAttendanceRecords = async () => {
    try {
      const [year, month] = selectedMonth.split("-");
      const { data } = await api.get(
        `/hr/attendance/my_records/?month=${parseInt(month)}&year=${year}`
      );
      
      // Handle different response formats
      let records = [];
      if (Array.isArray(data)) {
        records = data;
      } else if (data.records && Array.isArray(data.records)) {
        records = data.records;
      } else if (data.data && Array.isArray(data.data)) {
        records = data.data;
      }
      
      setAttendanceRecords(records);
    } catch (err) {
      console.error("❌ Failed to load attendance records:", err);
      setAttendanceRecords([]);
    }
  };

  // ✅ Reverse-geocode to get address
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

          await api.post("/hr/attendance/punch_in/", {
            latitude,
            longitude,
            location: locationName,
          });

          await loadTodayStatus();
          await loadMyAttendanceRecords();
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
          
          await api.post("/hr/attendance/punch_out/", {
            latitude,
            longitude,
            location: locationName,
          });

          await loadTodayStatus();
          await loadMyAttendanceRecords();
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

  // ✅ Handle Break Start
  const handleBreakStart = async () => {
    if (isBreakProcessing || breakStatus.isOnBreak) return;
    if (todayStatus.punchIn === null || todayStatus.punchOut !== null) {
      alert("Please punch in first and ensure you haven't punched out yet.");
      return;
    }

    setIsBreakProcessing(true);
    try {
      await api.post("/hr/attendance/start_break/");
      await loadTodayBreaks();
      alert("Break started successfully!");
    } catch (err) {
      console.error("❌ Break start failed:", err);
      const errorMsg = err?.response?.data?.detail || err.message;
      alert("Break start failed: " + errorMsg);
    } finally {
      setIsBreakProcessing(false);
    }
  };

  // ✅ Handle Break End
  const handleBreakEnd = async () => {
    if (isBreakProcessing || !breakStatus.isOnBreak) {
      alert("No active break to end.");
      return;
    }

    setIsBreakProcessing(true);
    try {
      await api.post("/hr/attendance/end_break/");
      await loadTodayBreaks();
      alert("Break ended successfully!");
    } catch (err) {
      console.error("❌ Break end failed:", err);
      const errorMsg = err?.response?.data?.detail || err.message;
      alert("Break end failed: " + errorMsg);
      await loadTodayBreaks();
    } finally {
      setIsBreakProcessing(false);
    }
  };

  // ✅ Load data on mount/month change
  useEffect(() => {
    loadTodayStatus();
    loadTodayBreaks();
    loadMyAttendanceRecords();
  }, [selectedMonth]);

  // ✅ Calculate summary statistics
  const calculateSummary = () => {
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => 
      record.status === 'Full Day' || record.status === 'Verified Full Day'
    ).length;
    const halfDays = attendanceRecords.filter(record => 
      record.status === 'Half Day' || record.status === 'Verified Half Day'
    ).length;
    const leaveDays = attendanceRecords.filter(record => 
      record.status === 'Leave'
    ).length;
    
    return { totalDays, presentDays, halfDays, leaveDays };
  };

  const summary = calculateSummary();

  // ✅ Get day name for a specific date
  const getDayName = (dateString) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // ✅ Get days in month for calendar view
  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ✅ Get attendance status for calendar view
  const getAttendanceForDay = (day) => {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    const record = attendanceRecords.find(r => r.date === dateStr);
    return record || null;
  };

  // ✅ Determine status type based on record
  const determineStatus = (date, record) => {
    const isSunday = getDayName(date) === 'Sun';
    if (isSunday) return "HOLIDAY";
    if (!record) return "NOT_MARKED";

    const backendStatus = (record.status || "").toString().toLowerCase();
    const verified = (record.verification_status || "").toString().toLowerCase() === "verified";

    const mapBackend = (bs) => {
      if (!bs) return null;
      if (bs === "full") return verified ? "VERIFIED" : "FULL_DAY";
      if (bs === "half") return verified ? "VERIFIED_HALF" : "HALF_DAY";
      if (bs === "leave") return "LEAVE";
      if (bs === "wfh") return verified ? "VERIFIED" : "FULL_DAY";
      return null;
    };

    const mapped = mapBackend(backendStatus);
    if (mapped) return mapped;

    return "NOT_MARKED";
  };

  // ✅ Star Icon Component (same as AttendanceManagement)
  const StarIcon = ({ color, type, size = 20 }) => {
    if (type === "half") {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <defs>
            <clipPath id={`half-clip-${color}-${Date.now()}`}>
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          <path
            d="M12 .587l3.668 7.568L24 9.423l-6 5.853L19.335 24 12 19.897 4.665 24 6 15.276 0 9.423l8.332-1.268z"
            fill={color}
            clipPath={`url(#half-clip-${color}-${Date.now()})`}
          />
          <path
            d="M12 .587l3.668 7.568L24 9.423l-6 5.853L19.335 24 12 19.897 4.665 24 6 15.276 0 9.423l8.332-1.268z"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
        </svg>
      );
    }

    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 .587l3.668 7.568L24 9.423l-6 5.853L19.335 24 12 19.897 4.665 24 6 15.276 0 9.423l8.332-1.268z" />
      </svg>
    );
  };

  const handleRefresh = () => {
    loadTodayStatus();
    loadTodayBreaks();
    loadMyAttendanceRecords();
  };

  // ✅ UI
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Attendance</h2>
        <div style={styles.headerActions}>
          <div style={styles.monthSelector}>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.monthSelect}
            >
              <option value="2025-11">November, 2025</option>
              <option value="2025-10">October, 2025</option>
              <option value="2025-09">September, 2025</option>
            </select>
          </div>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name..."
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <button onClick={handleRefresh} style={styles.refreshButton}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legendContainer}>
        {Object.entries(ATTENDANCE_TYPES).map(([key, value]) => (
          <div key={key} style={styles.legendItem}>
            <StarIcon color={value.color} type={value.icon} size={18} />
            <span style={styles.legendText}>{value.label}</span>
          </div>
        ))}
      </div>

      {/* Daily Attendance Actions */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Daily Attendance</h3>
        <div style={styles.statusCard}>
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
                {todayStatus.punchInLocation || "Not available"}
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
                {todayStatus.punchOutLocation || "Not available"}
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

      {/* Monthly Calendar View */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>My Attendance Calendar - {selectedMonth}</h3>
        
        {/* Summary Statistics */}
        <div style={styles.summaryContainer}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Days</span>
            <span style={styles.summaryValue}>{summary.totalDays}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Present</span>
            <span style={styles.summaryValue}>{summary.presentDays}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Half Days</span>
            <span style={styles.summaryValue}>{summary.halfDays}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Leaves</span>
            <span style={styles.summaryValue}>{summary.leaveDays}</span>
          </div>
        </div>

        {/* Calendar Table */}
        <div style={styles.tableContainer}>
          <table style={styles.calendarTable}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{...styles.tableHeader, ...styles.stickyNameColumn}}>
                  NAME
                </th>
                <th style={styles.tableHeader}>DUTY START</th>
                <th style={styles.tableHeader}>DUTY END</th>
                <th style={styles.tableHeader}>SUMMARY</th>
                {days.map(day => {
                  const dayName = getDayName(`${selectedMonth}-${String(day).padStart(2, '0')}`);
                  const isSunday = dayName === 'Sun';
                  return (
                    <th
                      key={day}
                      style={{
                        ...styles.tableHeader,
                        ...styles.dayHeader,
                        backgroundColor: isSunday ? '#fef3c7' : '#f3f4f6',
                      }}
                    >
                      <div style={styles.dayNumber}>{day}</div>
                      <div style={styles.dayName}>{dayName}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tableRow}>
                <td style={{...styles.tableCell, ...styles.stickyNameColumn, fontWeight: '600'}}>
                  My Attendance
                </td>
                <td style={styles.tableCell}>09:30</td>
                <td style={styles.tableCell}>17:30</td>
                <td style={styles.tableCell}>
                  <button style={styles.summaryBtn}>📊</button>
                </td>
                {days.map(day => {
                  const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
                  const record = getAttendanceForDay(day);
                  const statusType = determineStatus(dateStr, record);
                  const statusConfig = ATTENDANCE_TYPES[statusType] || ATTENDANCE_TYPES.NOT_MARKED;
                  const dayName = getDayName(dateStr);
                  const isSunday = dayName === 'Sun';
                  
                  return (
                    <td key={day} style={{
                      ...styles.calendarCell,
                      backgroundColor: isSunday ? '#fef3c7' : 'white'
                    }}>
                      <div style={styles.attendanceIcon} title={statusConfig.label}>
                        <StarIcon 
                          color={statusConfig.color} 
                          type={statusConfig.icon} 
                          size={20}
                        />
                      </div>
                      <div style={styles.timeDisplay}>
                        <div style={styles.punchTime}>
                          {record?.punch_in_time ? formatToIST12(record.punch_in_time) : "–"}
                        </div>
                        <div style={styles.punchTime}>
                          {record?.punch_out_time ? formatToIST12(record.punch_out_time) : "–"}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ✅ Updated Styles
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
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  monthSelector: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  monthSelect: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
  },
  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    padding: "12px 40px 12px 16px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    width: "280px",
    fontWeight: "500",
    color: "#374151",
  },
  searchIcon: {
    position: "absolute",
    right: "14px",
    fontSize: "18px",
    pointerEvents: "none",
    color: "#9ca3af",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  refreshButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  legendContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  legendText: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "20px",
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
  summaryContainer: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  summaryLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "auto",
    maxHeight: "600px",
    border: "1px solid #e5e7eb",
  },
  calendarTable: {
    width: "100%",
    borderCollapse: "collapse",
    position: "relative",
  },
  tableHeaderRow: { backgroundColor: "#f3f4f6", position: "sticky", top: 0, zIndex: 10 },
  tableHeader: {
    padding: "12px 8px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  dayHeader: {
    textAlign: "center",
    minWidth: "60px",
  },
  dayNumber: {
    fontSize: "12px",
    fontWeight: "600",
  },
  dayName: {
    fontSize: "10px",
    fontWeight: "500",
    marginTop: "2px",
  },
  stickyNameColumn: {
    position: "sticky",
    left: 0,
    backgroundColor: "white",
    zIndex: 5,
    width: "200px",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  tableCell: {
    padding: "12px 8px",
    fontSize: "14px",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  calendarCell: {
    padding: "8px",
    textAlign: "center",
    minWidth: "60px",
    borderRight: "1px solid #e5e7eb",
  },
  attendanceIcon: {
    marginBottom: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  timeDisplay: {
    fontSize: "10px",
    color: "#6b7280",
  },
  punchTime: {
    lineHeight: "1.2",
  },
  summaryBtn: {
    fontSize: "20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "4px",
  },
};

export default PunchinPunchout;