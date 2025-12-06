import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const ATTENDANCE_TYPES = {
  FULL_DAY: { label: "Full Day", color: "#10b981", icon: "★" },
  HALF_DAY: { label: "Half Day", color: "#be185d", icon: "★" },
  VERIFIED_HALF: { label: "Verified Half Day", color: "#be185d", icon: "★" },
  LEAVE: { label: "Leave", color: "#ef4444", icon: "★" },
  HOLIDAY: { label: "Holiday", color: "#fbbf24", icon: "★" },
  VERIFIED: { label: "Verified Full Day", color: "#3b82f6", icon: "★" },
  NOT_MARKED: { label: "Not Marked", color: "#d1d5db", icon: "★" }
};

const defaultMonthISO = () => new Date().toISOString().slice(0, 7);

export default function AttendanceManagement() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthISO());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingCells, setSavingCells] = useState({});
  const [userStatus, setUserStatus] = useState("Active Users");

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || 
                  localStorage.getItem("access_token") || 
                  localStorage.getItem("access") ||
                  localStorage.getItem("token") ||
                  sessionStorage.getItem("accessToken") ||
                  sessionStorage.getItem("access_token");
    
    if (!token) {
      console.error("No authentication token found. Please login first.");
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth]);

  async function fetchAttendance() {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-");
      
      const employeesResponse = await api.get("/users/");
      let employeesList = employeesResponse.data;
      
      if (!Array.isArray(employeesList)) {
        employeesList = employeesList.results || employeesList.data || [];
      }

      let attendanceList = [];
      try {
        const attendanceResponse = await api.get(`/hr/attendance/`, {
          params: { month: Number(month), year: year }
        });
        attendanceList = attendanceResponse.data;
      } catch (adminError) {
        console.log("Admin endpoint failed, trying user endpoint:", adminError.message);
        try {
          const userAttendanceResponse = await api.get(`/hr/attendance/my_records/`, {
            params: { month: Number(month), year: year }
          });
          attendanceList = userAttendanceResponse.data;
        } catch (userError) {
          console.error("Both attendance endpoints failed:", userError);
          attendanceList = [];
        }
      }
      
      if (!Array.isArray(attendanceList)) {
        attendanceList = attendanceList.results || attendanceList.data || attendanceList.records || [];
      }

      const empMap = new Map();

      employeesList.forEach(emp => {
        empMap.set(emp.id, {
          id: emp.id,
          name: emp.name || emp.full_name || emp.username || `Employee ${emp.id}`,
          userId: emp.user_id || emp.email || emp.username || "",
          dutyStart: emp.duty_start || "09:30",
          dutyEnd: emp.duty_end || "17:30",
          records: {},
        });
      });

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
              is_verified: record.is_verified || record.verified,
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
      if (err.response?.status === 404) {
        alert("API endpoint not found. Please check your backend configuration.");
      } else {
        alert("Failed to load attendance data. Please try again.");
      }
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
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndex = getDayOfWeek(yearMonth, day);
    return days[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleSummaryClick = (employee) => {
    navigate('/attendance-summary', {
      state: {
        employee: employee,
        selectedMonth: selectedMonth
      }
    });
  };

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
        await api.post('/hr/attendance/mark_leave/', {
          user_id: employeeId,
          date: date,
          admin_note: `Marked as leave by admin on ${new Date().toLocaleString()}`
        });
      } else if (type === 'VERIFIED' || type === 'VERIFIED_HALF') {
        const statusValue = type === 'VERIFIED' ? 'full' : 'half';
        
        if (existingRecord && existingRecord.attendanceId) {
          const updateData = {
            status: statusValue,
            verification_status: 'verified',
            is_verified: true,
            admin_note: `Status changed to ${typeConfig.label} by admin on ${new Date().toLocaleString()}`
          };
          
          await api.patch(`/hr/attendance/${existingRecord.attendanceId}/`, updateData);
          
          try {
            await api.post(`/hr/attendance/${existingRecord.attendanceId}/verify/`, {
              admin_note: `Verified as ${typeConfig.label} on ${new Date().toLocaleString()}`
            });
          } catch (verifyError) {
            console.log("Verify endpoint not available, using patch only:", verifyError.message);
          }
        } else {
          const createData = {
            user: employeeId,
            date: date,
            status: statusValue,
            verification_status: 'verified',
            is_verified: true,
            admin_note: `Created as verified ${typeConfig.label} by admin`,
          };
          
          const response = await api.post("/hr/attendance/", createData);
          
          if (response.data && response.data.id) {
            try {
              await api.post(`/hr/attendance/${response.data.id}/verify/`, {
                admin_note: `Verified as ${typeConfig.label}`,
              });
            } catch (verifyError) {
              console.log("Verify endpoint not available, record created as verified:", verifyError.message);
            }
          }
        }
      }

      await fetchAttendance();
    } catch (error) {
      console.error('Failed to save attendance:', error);
      let errorMessage = 'Failed to save attendance';
      if (error.response) {
        errorMessage = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
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
    const verificationStatus = (rec.verification_status || "").toString().toLowerCase();
    const isVerified = rec.is_verified || verificationStatus === "verified";

    if (backendStatus === "full" || backendStatus === "present") {
      return isVerified ? "VERIFIED" : "FULL_DAY";
    } else if (backendStatus === "half") {
      return isVerified ? "VERIFIED_HALF" : "HALF_DAY";
    } else if (backendStatus === "leave") {
      return "LEAVE";
    } else if (backendStatus === "wfh" || backendStatus === "work_from_home") {
      return isVerified ? "WFH" : "WFH";
    } else if (backendStatus === "absent") {
      return "NOT_MARKED";
    }

    return "NOT_MARKED";
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "-";

    try {
      let date;

      if (typeof timeValue === "string" && timeValue.includes("T")) {
        date = new Date(timeValue);
      } else {
        date = new Date(`2000-01-01T${timeValue}`);
      }

      if (isNaN(date.getTime())) return "-";

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

  const AttendanceStar = ({ employee, date, status, saving }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const record = employee.records[date];
    
    const handleClick = async (type) => {
      setShowMenu(false);
      await handleAttendanceChange(employee.id, date, type);
    };

    const config = ATTENDANCE_TYPES[status] || ATTENDANCE_TYPES.NOT_MARKED;

    const tooltipContent = record ? (
      <div style={styles.tooltipContent}>
        <div><strong>Status:</strong> {config.label}</div>
        <div><strong>Punch In:</strong> {formatTime(record.punch_in)}</div>
        <div><strong>Punch Out:</strong> {formatTime(record.punch_out)}</div>
        {record.verification_status && (
          <div><strong>Verification:</strong> {record.verification_status}</div>
        )}
      </div>
    ) : (
      <div style={styles.tooltipContent}>
        <div>No attendance data</div>
      </div>
    );

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={saving}
          style={{
            ...styles.starButton,
            color: config.color,
            opacity: saving ? 0.5 : 1,
          }}
        >
          {config.icon}
        </button>
        
        {showTooltip && (
          <div style={styles.tooltip}>
            {tooltipContent}
          </div>
        )}
        
        {showMenu && (
          <div style={styles.dropdown}>
            <button
              onClick={() => handleClick('VERIFIED')}
              style={styles.dropdownItem}
            >
              <span style={{ color: ATTENDANCE_TYPES.VERIFIED.color, marginRight: 8, fontSize: 18 }}>
                {ATTENDANCE_TYPES.VERIFIED.icon}
              </span>
              {ATTENDANCE_TYPES.VERIFIED.label}
            </button>
            <button
              onClick={() => handleClick('VERIFIED_HALF')}
              style={styles.dropdownItem}
            >
              <span style={{ color: ATTENDANCE_TYPES.VERIFIED_HALF.color, marginRight: 8, fontSize: 18 }}>
                {ATTENDANCE_TYPES.VERIFIED_HALF.icon}
              </span>
              {ATTENDANCE_TYPES.VERIFIED_HALF.label}
            </button>
            <button
              onClick={() => handleClick('LEAVE')}
              style={styles.dropdownItem}
            >
              <span style={{ color: ATTENDANCE_TYPES.LEAVE.color, marginRight: 8, fontSize: 18 }}>
                {ATTENDANCE_TYPES.LEAVE.icon}
              </span>
              {ATTENDANCE_TYPES.LEAVE.label}
            </button>
          </div>
        )}
      </div>
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
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Attendance Management</h1>
      </div>

      <div style={styles.filterSection}>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.monthInput}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search by Name</label>
            <input
              type="text"
              placeholder="Enter name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filter by User Status</label>
            <select
              value={userStatus}
              onChange={(e) => setUserStatus(e.target.value)}
              style={styles.selectInput}
            >
              <option>Active Users</option>
              <option>Inactive Users</option>
              <option>All Users</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.legendContainer}>
        {Object.entries(ATTENDANCE_TYPES).map(([key, value]) => (
          <div key={key} style={styles.legendItem}>
            <span style={{ color: value.color, fontSize: 18, marginRight: 8 }}>{value.icon}</span>
            <span style={styles.legendText}>{value.label}</span>
          </div>
        ))}
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.stickyHeader}>No</th>
                <th style={styles.stickyHeader}>Name</th>
                <th style={styles.tableHeader}>User ID</th>
                <th style={styles.tableHeader}>Duty Start</th>
                <th style={styles.tableHeader}>Duty End</th>
                <th style={styles.tableHeader}>Summary</th>
                <th colSpan={daysInMonth} style={{...styles.tableHeader, borderRight: 'none', textAlign: 'center'}}>
                  Days Of Month
                </th>
              </tr>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.stickyEmptyHeader}></th>
                <th style={styles.stickyEmptyHeader}></th>
                <th style={styles.emptyHeader}></th>
                <th style={styles.emptyHeader}></th>
                <th style={styles.emptyHeader}></th>
                <th style={styles.emptyHeader}></th>
                {days.map(day => {
                  const dayOfWeek = getDayOfWeek(selectedMonth, day);
                  const isSunday = dayOfWeek === 0;
                  return (
                    <th key={day} style={styles.dayHeader}>
                      <div style={styles.dayNumber}>{day}</div>
                      <div style={{...styles.dayName, color: isSunday ? '#ef4444' : '#6b7280'}}>
                        {getDayName(selectedMonth, day)}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={days.length + 6} style={styles.noResults}>
                    Loading attendance data...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={days.length + 6} style={styles.noResults}>
                    {searchQuery ? `No results for "${searchQuery}"` : "No employees found"}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee, index) => (
                  <tr key={employee.id} style={styles.tableRow}>
                    <td style={styles.stickyCell}>{index + 1}</td>
                    <td style={{...styles.stickyCell, textAlign: 'left', fontWeight: 500}}>{employee.name}</td>
                    <td style={styles.tableCell}>{employee.userId}</td>
                    <td style={styles.tableCell}>{employee.dutyStart}</td>
                    <td style={styles.tableCell}>{employee.dutyEnd}</td>
                    <td style={styles.tableCell}>
                      <button 
                        onClick={() => handleSummaryClick(employee)}
                        style={styles.eyeButton}
                        title="View Detailed Summary"
                      >
                        <Eye size={18} color="#3b82f6" />
                      </button>
                    </td>
                    {days.map((day) => {
                      const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
                      const status = determineStatus(date, employee);
                      const key = `${employee.id}-${date}`;
                      const saving = savingCells[key];
                      return (
                        <td key={day} style={styles.tableCell}>
                          <AttendanceStar 
                            employee={employee}
                            date={date}
                            status={status}
                            saving={saving}
                          />
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
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    width: "100%",
  },
  pageHeader: {
    marginBottom: "24px",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: "12px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    margin: 0,
    textAlign: "center",
  },
  filterSection: {
    backgroundColor: "#ffffff",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  filterRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  monthInput: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  searchInput: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  selectInput: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  legendContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    alignItems: "center",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
  },
  legendText: {
    color: "#374151",
    fontWeight: 500,
  },
  tableContainer: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "visible",
    marginBottom: "24px",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    overflowY: "visible",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "auto",
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
  },
  tableHeader: {
    padding: "12px 8px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#000000",
    borderBottom: "2px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
    backgroundColor: "#f9fafb",
  },
  stickyHeader: {
    padding: "12px 8px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#000000",
    borderBottom: "2px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
    backgroundColor: "#f9fafb",
    position: "sticky",
    left: 0,
    zIndex: 20,
  },
  emptyHeader: {
    padding: "8px",
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
  },
  stickyEmptyHeader: {
    padding: "8px",
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    position: "sticky",
    left: 0,
    zIndex: 20,
  },
  dayHeader: {
    padding: "8px 4px",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "600",
    color: "#6b7280",
    borderBottom: "2px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    minWidth: "40px",
    backgroundColor: "#f9fafb",
  },
  dayNumber: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "2px",
  },
  dayName: {
    fontSize: "10px",
    fontWeight: "500",
    marginTop: "2px",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.15s",
  },
  tableCell: {
    padding: "10px 4px",
    fontSize: "12px",
    color: "#374151",
    textAlign: "center",
    borderRight: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
    overflow: "visible",
    position: "relative",
  },
  stickyCell: {
    padding: "10px 8px",
    fontSize: "13px",
    color: "#374151",
    textAlign: "center",
    borderRight: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
    backgroundColor: "#ffffff",
    position: "sticky",
    left: 0,
    zIndex: 10,
  },
  starButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "4px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    transition: "transform 0.1s",
  },
  eyeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
    margin: "0 auto",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    padding: "8px",
    zIndex: 9999,
    minWidth: "200px",
    marginTop: "4px",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    border: "none",
    background: "none",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: "6px",
    transition: "background-color 0.15s",
  },
  tooltip: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#1f2937",
    color: "white",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    zIndex: 9999,
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    minWidth: "180px",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
  tooltipContent: {
    lineHeight: "1.6",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};