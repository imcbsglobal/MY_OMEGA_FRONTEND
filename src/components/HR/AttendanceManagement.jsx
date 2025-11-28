import React, { useState, useEffect } from "react";

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
  post: async (url, data) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`http://127.0.0.1:8000/api${url}`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  },
  patch: async (url, data) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`http://127.0.0.1:8000/api${url}`, {
      method: 'PATCH',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  },
  delete: async (url) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`http://127.0.0.1:8000/api${url}`, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  }
};

const ATTENDANCE_TYPES = {
  FULL_DAY: { label: "Full Day", color: "#10b981", icon: "full", status: "full" },
  VERIFIED: { label: "Verified", color: "#3b82f6", icon: "full", status: "full", verified: true },
  HALF_DAY: { label: "Half Day", color: "#f59e0b", icon: "half", status: "half" },
  VERIFIED_HALF: { label: "Verified Half Day", color: "#f43f5e", icon: "half", status: "half", verified: true },
  LEAVE: { label: "Leave", color: "#ef4444", icon: "full", status: "leave" },
  HOLIDAY: { label: "Holiday", color: "#eab308", icon: "full", status: "holiday" },
  NOT_MARKED: { label: "Not Marked", color: "#9ca3af", icon: "full" }
};

// Helper functions
const defaultMonthISO = () => new Date().toISOString().slice(0, 7);

function parseTimeToMinutes(value) {
  if (!value && value !== 0) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const str = value.trim();
    const tIndex = str.indexOf("T");
    if (tIndex !== -1) {
      const timePart = str.slice(tIndex + 1).split("+")[0].split("Z")[0];
      return parseHmsToMinutes(timePart);
    }
    const ampmMatch = str.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*(am|pm|AM|PM)/);
    if (ampmMatch) {
      return parseHmsToMinutes(ampmMatch[1] + " " + ampmMatch[2]);
    }
    return parseHmsToMinutes(str);
  }
  return null;
}

function parseHmsToMinutes(s) {
  if (!s) return null;
  const raw = s.trim();
  const ampm = /([0-9:]+)\s*(am|pm|AM|PM)/.exec(raw);
  if (ampm) {
    let [_, hm, ap] = ampm;
    const parts = hm.split(":").map(p => parseInt(p, 10) || 0);
    let hh = parts[0];
    const mm = parts[1] || 0;
    const apLower = ap.toLowerCase();
    if (apLower === "pm" && hh < 12) hh += 12;
    if (apLower === "am" && hh === 12) hh = 0;
    return hh * 60 + mm;
  }
  const parts = raw.split(":").map(p => parseInt(p, 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const hh = parts[0];
    const mm = parts[1];
    if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) return hh * 60 + mm;
  }
  return null;
}

function minutesToDisplay(mins) {
  if (mins == null) return "-";
  const hh = Math.floor(mins / 60) % 24;
  const mm = Math.floor(mins % 60);
  const date = new Date();
  date.setHours(hh, mm, 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// Attendance Cell Component
function AttendanceCell({ attendance, date, onAttendanceChange, punchIn, punchOut, saving }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAttendanceClick = async (type) => {
    setShowMenu(false);
    await onAttendanceChange(date, type);
  };

  const getAttendanceColor = () => {
    if (!attendance) return "#9ca3af";
    const type = ATTENDANCE_TYPES[attendance];
    return type?.color || "#9ca3af";
  };

  const getAttendanceIcon = () => {
    if (!attendance) return "full";
    const type = ATTENDANCE_TYPES[attendance];
    return type?.icon || "full";
  };

  const iconColor = getAttendanceColor();
  const iconType = getAttendanceIcon();

  const StarIcon = ({ color, type }) => {
    if (type === "half") {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 L12 2 Z" 
                fill={color} stroke={color} strokeWidth="2" clipPath="polygon(0 0, 50% 0, 50% 100%, 0 100%)" />
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 L12 2 Z" 
              fill={color} stroke={color} strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div style={styles.attendanceCell}>
      <div style={styles.attendanceCellContent}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={saving}
          style={styles.attendanceBtn}
        >
          <StarIcon color={iconColor} type={iconType} />
        </button>
        {showMenu && (
          <div style={styles.attendanceMenu}>
            {Object.keys(ATTENDANCE_TYPES).map((key) => (
              <button
                key={key}
                onClick={() => handleAttendanceClick(key)}
                style={styles.attendanceMenuItem}
              >
                {ATTENDANCE_TYPES[key].label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={styles.timeDisplay}>
        {punchIn ? minutesToDisplay(parseTimeToMinutes(punchIn)) : "–"}
      </div>
      <div style={styles.timeDisplay}>
        {punchOut ? minutesToDisplay(parseTimeToMinutes(punchOut)) : "–"}
      </div>
      {saving && <div style={styles.savingIndicator}>💾</div>}
    </div>
  );
}

// Summary Button Component
function SummaryButton({ employee, selectedMonth, onSummaryClick }) {
  const handleClick = () => {
    onSummaryClick(employee, selectedMonth);
  };

  return (
    <button onClick={handleClick} style={styles.summaryBtn}>
      📊
    </button>
  );
}

// Main Component
export default function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthISO());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingCells, setSavingCells] = useState({});

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth]);

  async function fetchAttendance() {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-");
      
      // Fetch employees
     const employeesData = await api.get("/users/");
      const employeesList = Array.isArray(employeesData) ? employeesData : 
        (employeesData.results || employeesData.data || []);

      // Fetch attendance data
      const attendanceData = await api.get(`/hr/attendance/?month=${Number(month)}&year=${year}`);
      const attendanceList = Array.isArray(attendanceData) ? attendanceData : 
        (attendanceData.results || attendanceData.data || []);

      const empMap = new Map();

      // Process employees
      employeesList.forEach(emp => {
        empMap.set(emp.id, {
          id: emp.id,
          name: emp.name || emp.full_name || `Employee ${emp.id}`,
          userId: emp.user_id || emp.email || emp.username || "",
          dutyStart: emp.duty_start || "09:30",
          dutyEnd: emp.duty_end || "17:30",
          records: {},
        });
      });

      // Process attendance records
      attendanceList.forEach((record) => {
        const empId = record.user || record.employee_id || record.user_id || record.user?.id || record.employee?.id;
        if (empId && empMap.has(empId)) {
          const emp = empMap.get(empId);
          const date = record.date || record.attendance_date;
          if (date) {
            const formattedDate = typeof date === "string" ? date.slice(0, 10) : date;
            emp.records[formattedDate] = {
              ...record,
              attendanceId: record.id,
              punch_in: record.punch_in || record.punch_in_time || record.in_time,
              punch_out: record.punch_out || record.punch_out_time || record.out_time,
              status: record.status || record.attendance_status,
              verification_status: record.verification_status || record.is_verified,
              date: formattedDate,
            };
          }
        }
      });

      const sortedEmployees = Array.from(empMap.values()).sort((a, b) => 
        (a.name || "").localeCompare(b.name || "")
      );

      setEmployees(sortedEmployees);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      alert("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getDayOfWeek = (yearMonth, day) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month - 1, day).getDay();
  };

  const getDayName = (yearMonth, day) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[getDayOfWeek(yearMonth, day)];
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Handle summary button click
  const handleSummaryClick = (employee, month) => {
    console.log("Summary clicked for:", employee.name, month);
    // You can navigate to summary page or show modal here
  };

  // Handle attendance change
  const handleAttendanceChange = async (employeeId, date, type) => {
    const key = `${employeeId}-${date}`;
    setSavingCells(prev => ({...prev, [key]: true}));

    try {
      const typeConfig = ATTENDANCE_TYPES[type];
      if (!typeConfig) return;

      const employee = employees.find(e => e.id === employeeId);
      if (!employee) return;

      const existingRecord = employee.records[date];

      if (type === 'LEAVE') {
        // Mark as leave
        await api.post('/hr/attendance/mark_leave/', {
          user_id: employeeId,
          date: date,
          admin_note: `Marked as leave by admin on ${new Date().toLocaleString()}`
        });
      } else if (existingRecord && existingRecord.attendanceId) {
        // Update existing attendance
        const updateData = {
          status: typeConfig.status,
          admin_note: `Status changed to ${typeConfig.label} by admin on ${new Date().toLocaleString()}`
        };
        await api.patch(`/hr/attendance/${existingRecord.attendanceId}/`, updateData);

        // If marking as verified, call verify endpoint
        if (typeConfig.verified) {
          await api.post(`/hr/attendance/${existingRecord.attendanceId}/verify/`, {
            admin_note: `Verified as ${typeConfig.label} on ${new Date().toLocaleString()}`
          });
        }
      } else {
        // Create new attendance record
        const createData = {
          user: employeeId,
          date: date,
          status: typeConfig.status || "full",
          admin_note: `Created as ${typeConfig.label} by admin`,
        };
        const response = await api.post("/hr/attendance/", createData);

        // Verify if needed
        if (typeConfig.verified && response.id) {
          await api.post(`/hr/attendance/${response.id}/verify/`, {
            admin_note: `Verified as ${typeConfig.label}`,
          });
        }
      }

      // Refresh data
      await fetchAttendance();
    } catch (error) {
      console.error('Failed to save attendance:', error);
      let errorMessage = 'Failed to save attendance';
      if (error.message.includes('API error')) {
        errorMessage = `Server error: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setSavingCells(prev => {
        const newState = {...prev};
        delete newState[key];
        return newState;
      });
    }
  };

  const determineStatus = (date, emp) => {
    const isSunday = getDayOfWeek(selectedMonth, Number(date.split("-").pop())) === 0;
    const rec = emp.records && emp.records[date];

    if (isSunday) return "HOLIDAY";
    if (!rec) return "NOT_MARKED";

    const backendStatus = (rec.status || "").toString().toLowerCase();
    const verified = (rec.verification_status || "").toString().toLowerCase() === "verified";

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

  const renderAttendanceCell = (emp, date) => {
    const key = `${emp.id}-${date}`;
    const status = determineStatus(date, emp);
    const rec = emp.records[date] || {};
    const punchIn = rec.punch_in;
    const punchOut = rec.punch_out;
    const saving = savingCells[key];

    return (
      <AttendanceCell
        key={date}
        attendance={status}
        date={date}
        onAttendanceChange={(d, type) => handleAttendanceChange(emp.id, d, type)}
        punchIn={punchIn}
        punchOut={punchOut}
        saving={saving}
      />
    );
  };

  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (emp.name || "").toLowerCase().includes(q) || 
           (emp.userId || "").toLowerCase().includes(q);
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Attendance Management - Admin View</h1>
        <div style={styles.headerActions}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.monthInput}
            />
          </div>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <button onClick={fetchAttendance} style={styles.refreshButton}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={styles.legendContainer}>
        {Object.entries(ATTENDANCE_TYPES).map(([key, value]) => {
          const StarIcon = ({ color, type }) => {
            if (type === "half") {
              return (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 L12 2 Z" 
                        fill={color} stroke={color} strokeWidth="2" clipPath="polygon(0 0, 50% 0, 50% 100%, 0 100%)" />
                </svg>
              );
            }
            return (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 L12 2 Z" 
                      fill={color} stroke={color} strokeWidth="2" />
              </svg>
            );
          };

          return (
            <div key={key} style={styles.legendItem}>
              <StarIcon color={value.color} type={value.icon} />
              <span style={styles.legendText}>{value.label}</span>
            </div>
          );
        })}
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={{...styles.tableHeader, ...styles.stickyNameColumn}}>NAME</th>
              <th style={styles.tableHeader}>DUTY START</th>
              <th style={styles.tableHeader}>DUTY END</th>
              <th style={styles.tableHeader}>SUMMARY</th>
              {days.map(day => {
                const dayName = getDayName(selectedMonth, day);
                const isSunday = getDayOfWeek(selectedMonth, day) === 0;
                return (
                  <th key={day} style={{...styles.tableHeader, ...styles.dayHeader, color: isSunday ? '#ef4444' : '#6b7280'}}>
                    <div>{day}</div>
                    <div style={styles.dayName}>{dayName}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={days.length + 4} style={styles.noResults}>
                  Loading employees and attendance data...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={days.length + 4} style={styles.noResults}>
                  {searchQuery ? `No employees found for "${searchQuery}"` : "No employees available"}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.stickyNameColumn}}>{employee.name}</td>
                  <td style={styles.tableCell}>{employee.dutyStart}</td>
                  <td style={styles.tableCell}>{employee.dutyEnd}</td>
                  <td style={styles.tableCell}>
                    <SummaryButton 
                      employee={employee} 
                      selectedMonth={selectedMonth}
                      onSummaryClick={handleSummaryClick}
                    />
                  </td>
                  {days.map((day) => {
                    const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
                    return (
                      <td key={day} style={styles.attendanceCell}>
                        {renderAttendanceCell(employee, date)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles
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
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  monthInput: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontWeight: "500",
    color: "#374151",
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
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "auto",
    maxHeight: "calc(100vh - 350px)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    position: "relative",
  },
  tableHeaderRow: {
    backgroundColor: "#f3f4f6",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
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
    minWidth: "50px",
  },
  dayName: {
    fontSize: "10px",
    fontWeight: "500",
    marginTop: "2px",
  },
  stickyNameColumn: {
    position: "sticky",
    left: "5px",
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
  attendanceCell: {
    padding: "8px",
    textAlign: "center",
    position: "relative",
    minWidth: "50px",
  },
  attendanceCellContent: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  attendanceBtn: {
    fontSize: "20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "4px",
  },
  attendanceMenu: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    padding: "8px",
    zIndex: 1000,
    minWidth: "180px",
    marginTop: "4px",
  },
  attendanceMenuItem: {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "500",
    border: "none",
    background: "none",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: "6px",
  },
  summaryBtn: {
    fontSize: "20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "4px",
    transition: "transform 0.2s",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
  savingIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    fontSize: "10px",
  },
  timeDisplay: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "2px",
  }
};