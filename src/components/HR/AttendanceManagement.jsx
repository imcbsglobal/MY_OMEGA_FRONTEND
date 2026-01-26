import React, { useState, useEffect } from "react";
import { Eye, BarChart3, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const ATTENDANCE_TYPES = {
  PUNCH_IN_ONLY: { label: "Punch In Only", color: "#10b981", icon: "◐", description: "Half filled green" },
  FULL_DAY: { label: "Full Day", color: "#10b981", icon: "★", description: "Full green" },
  HALF_DAY: { label: "Half Day", color: "#be185d", icon: "★" },
  VERIFIED_HALF: { label: "Verified Half Day", color: "#be185d", icon: "★" },
  LEAVE: { label: "Leave", color: "#ef4444", icon: "★" },
  SPECIAL_LEAVE: { label: "Special Leave", color: "#f59e0b", icon: "★", description: "Orange - Special Leave" },
  MANDATORY_LEAVE: { label: "Mandatory Holiday", color: "#8b5cf6", icon: "★", description: "Purple - Mandatory Holiday" },
  HOLIDAY: { label: "Holiday", color: "#fbbf24", icon: "★" },
  VERIFIED: { label: "Verified Full Day", color: "#3b82f6", icon: "★", description: "Full blue" },
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
  const [leaveMasters, setLeaveMasters] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null); // NEW: track which leave type was selected

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
    fetchLeaveMasters();
  }, [selectedMonth]);

  async function fetchLeaveMasters() {
    try {
      const response = await api.get('master/');
      console.log("=".repeat(80));
      console.log("📥 Leave Masters Response:", response.data);
      
      if (response.data.success && response.data.data) {
        // Filter for special and mandatory leaves only
        const specialAndMandatory = response.data.data.filter(leave => 
          leave.is_active && (leave.category === 'special' || leave.category === 'mandatory_holiday')
        );
        
        console.log("📋 FILTERED LEAVE MASTERS:", specialAndMandatory.map(l => ({
          id: l.id,
          name: l.leave_name,
          category: l.category,
          is_active: l.is_active
        })));
        console.log("=".repeat(80));
        
        setLeaveMasters(specialAndMandatory);
      }
    } catch (error) {
      console.error("Failed to fetch leave masters:", error);
    }
  }

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
        const empId =
          record.user ||
          record.employee_id ||
          record.user_id ||
          record.user?.id ||
          record.employee?.id;

        if (empId && empMap.has(empId)) {
          const emp = empMap.get(empId);
          const date = record.date || record.attendance_date;

          if (date) {
            const formattedDate =
              typeof date === "string" ? date.slice(0, 10) : date;

            // Log any record with mandatory_holiday or special_leave status for debugging
            if (record.status && (record.status.includes('holiday') || record.status.includes('leave'))) {
              console.log('🔍 Raw API Response for', formattedDate, ':', {
                status: record.status,
                verification_status: record.verification_status,
                user_name: record.user_name,
                full_record: record
              });
            }

            const finalStatus = record.status || record.attendance_status;
            
            // Debug: log mandatory/special leave statuses
            if (finalStatus && (finalStatus.includes('holiday') || finalStatus.includes('leave'))) {
              console.log('💾 STORING RECORD:', {
                date: formattedDate,
                finalStatus: finalStatus,
                backend_record_status: record.status,
                attendance_status_fallback: record.attendance_status,
              });
            }

            emp.records[formattedDate] = {
              ...record,
              attendanceId: record.id,
              punch_in: record.punch_in || record.punch_in_time || record.in_time,
              punch_out: record.punch_out || record.punch_out_time || record.out_time,
              status: finalStatus,
              leave_master: record.leave_master,
              leave_master_details: record.leave_master_details,

              verification_status:
                record.verification_status ??
                record.is_verified ??
                record.verified ??
                "unverified",

              is_verified:
                record.is_verified ??
                (record.verification_status === "verified") ??
                record.verified ??
                false,

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
    navigate("/attendance-summary", {
      state: {
        employee,
        selectedMonth
      }
    });
  };

  const handleAttendanceChange = async (employeeId, date, type) => {
    const key = `${employeeId}-${date}`;
    setSavingCells(prev => ({ ...prev, [key]: true }));

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
      } 
      else if (type === "VERIFIED" || type === "VERIFIED_HALF") {
        const statusValue = type === "VERIFIED" ? "full" : "half";

        if (existingRecord && existingRecord.attendanceId) {
          await api.patch(`/hr/attendance/${existingRecord.attendanceId}/update_status/`, {
            status: statusValue,
            admin_note: `Status changed to ${typeConfig.label} on ${new Date().toLocaleString()}`
          });

          try {
            await api.post(`/hr/attendance/${existingRecord.attendanceId}/verify/`, {
              admin_note: `Verified as ${typeConfig.label} on ${new Date().toLocaleString()}`
            });
          } catch (verifyError) {
            console.log("Verify endpoint not available, using patch only:", verifyError.message);
          }
        } else {
          console.log("Creating new attendance record for verification.", employeeId, date, statusValue);
          const createData = {
            user: employeeId,
            date: date,
            status: statusValue,
            admin_note: `Created as verified ${typeConfig.label} by admin`
          };

          const response = await api.post("/hr/attendance/", createData);

          if (response.data && response.data.id) {
            try {
              await api.post(`/hr/attendance/${response.data.id}/verify/`, {
                admin_note: `Verified as ${typeConfig.label}`
              });
            } catch (verifyError) {
              console.log("Verify endpoint not available for new record:", verifyError.message);
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
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const handleSpecialLeaveClick = (employeeId, date, leaveType = null) => {
    setSelectedCell({ employeeId, date });
    setSelectedLeaveType(leaveType); // Store which leave type was selected
    setShowLeaveModal(true);
  };

  const handleLeaveSelection = async (leaveMaster) => {
    if (!selectedCell) return;

    const key = `${selectedCell.employeeId}-${selectedCell.date}`;
    setSavingCells(prev => ({ ...prev, [key]: true }));

    try {
      const employee = employees.find(e => e.id === selectedCell.employeeId);
      if (!employee) return;

      const existingRecord = employee.records[selectedCell.date];

      // Debug: log the leave master object
      console.log('='.repeat(60));
      console.log('🎯 LEAVE MASTER OBJECT:', {
        id: leaveMaster.id,
        leave_name: leaveMaster.leave_name,
        category: leaveMaster.category,
        category_display: leaveMaster.category_display,
        payment_status: leaveMaster.payment_status,
        payment_status_display: leaveMaster.payment_status_display,
      });

      // Determine the status based on leave category - use the exact status values from backend
      const leaveStatus = leaveMaster.category === 'mandatory_holiday' 
        ? 'mandatory_holiday' 
        : 'special_leave';

      console.log('📝 STATUS CALCULATION:', {
        leaveMasterCategory: leaveMaster.category,
        categoryType: typeof leaveMaster.category,
        isEqual_mandatory_holiday: leaveMaster.category === 'mandatory_holiday',
        calculatedStatus: leaveStatus,
      });
      console.log('='.repeat(60));

      if (existingRecord && existingRecord.attendanceId) {
        // Update existing record
        const updateResponse = await api.patch(`/hr/attendance/${existingRecord.attendanceId}/update_status/`, {
          status: leaveStatus,
          leave_master: leaveMaster.id,
          admin_note: `Marked as ${leaveMaster.leave_name} (${leaveMaster.category === 'mandatory_holiday' ? 'Mandatory Holiday' : 'Special Leave'}) - ${leaveMaster.payment_status === 'paid' ? 'Paid' : 'Unpaid'} by admin on ${new Date().toLocaleString()}`
        });

        console.log('✅ Update Response:', {
          status: updateResponse.data?.attendance?.status,
          expected: leaveStatus,
          match: updateResponse.data?.attendance?.status === leaveStatus
        });

        // Now verify it
        try {
          const verifyResponse = await api.post(`/hr/attendance/${existingRecord.attendanceId}/verify/`, {
            admin_note: `Verified as ${leaveMaster.leave_name}`
          });
          console.log('✅ Verify Response:', {
            status: verifyResponse.data?.attendance?.status,
            verification_status: verifyResponse.data?.attendance?.verification_status
          });
        } catch (verifyError) {
          console.log("Verify endpoint not fully available:", verifyError.message);
        }
      } else {
        // Create new record
        const createResponse = await api.post('/hr/attendance/', {
          user: selectedCell.employeeId,
          date: selectedCell.date,
          status: leaveStatus,
          leave_master: leaveMaster.id,
          is_leave: true,
          admin_note: `Created as ${leaveMaster.leave_name} (${leaveMaster.category === 'mandatory_holiday' ? 'Mandatory Holiday' : 'Special Leave'}) - ${leaveMaster.payment_status === 'paid' ? 'Paid' : 'Unpaid'} by admin`
        });

        console.log('✅ Create Response:', {
          status: createResponse.data?.status,
          expected: leaveStatus,
          match: createResponse.data?.status === leaveStatus
        });

        // Verify the newly created record
        if (createResponse.data && createResponse.data.id) {
          try {
            const verifyResponse = await api.post(`/hr/attendance/${createResponse.data.id}/verify/`, {
              admin_note: `Verified as ${leaveMaster.leave_name}`
            });
            console.log('✅ Verify Create Response:', {
              status: verifyResponse.data?.attendance?.status,
              verification_status: verifyResponse.data?.attendance?.verification_status
            });
          } catch (verifyError) {
            console.log("Verify endpoint not available for new record:", verifyError.message);
          }
        }
      }

      setShowLeaveModal(false);
      setSelectedCell(null);
      await fetchAttendance();
    } catch (error) {
      console.error('Failed to mark leave:', error);
      alert('Failed to mark leave. Please try again.');
    } finally {
      setSavingCells(prev => {
        const newState = { ...prev };
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

    // Check backend status for special leave types FIRST (highest priority)
    if (backendStatus === 'mandatory_holiday') {
      console.log('✅ MANDATORY_HOLIDAY DETECTED:', {
        date,
        rec_status: rec.status,
        lowercased: backendStatus,
        returning: 'MANDATORY_LEAVE'
      });
      return "MANDATORY_LEAVE";
    }
    if (backendStatus === 'special_leave') {
      console.log('✅ SPECIAL_LEAVE DETECTED:', {
        date,
        rec_status: rec.status,
        lowercased: backendStatus,
        returning: 'SPECIAL_LEAVE'
      });
      return "SPECIAL_LEAVE";
    }
    
    // Check if it's a special leave or mandatory holiday from leave_master
    if (rec.leave_master_details) {
      const category = (rec.leave_master_details.category || "").toString().toLowerCase();
      console.log('Leave Master Category:', date, category);
      if (category === 'special') {
        console.log('✅ Detected SPECIAL_LEAVE from leave_master');
        return "SPECIAL_LEAVE";
      }
      if (category === 'mandatory_holiday') {
        console.log('✅ Detected MANDATORY_LEAVE from leave_master');
        return "MANDATORY_LEAVE";
      }
    }

    const isVerified =
      rec.is_verified === true ||
      rec.verification_status === true ||
      rec.verification_status === "true" ||
      rec.verification_status === "verified";

    const hasPunchIn = rec.punch_in && rec.punch_in !== "-" && rec.punch_in !== null && rec.punch_in !== "";
    const hasPunchOut = rec.punch_out && rec.punch_out !== "-" && rec.punch_out !== null && rec.punch_out !== "";

    if (hasPunchIn && !hasPunchOut) {
      return "PUNCH_IN_ONLY";
    }

    if (backendStatus === "full" || backendStatus === "present") {
      if (isVerified) return "VERIFIED";
      return "FULL_DAY";
    } 
    else if (backendStatus === "half") {
      if (hasPunchIn && hasPunchOut) {
        return isVerified ? "VERIFIED_HALF" : "HALF_DAY";
      }
      return "HALF_DAY";
    } 
    else if (backendStatus === "leave") {
      return "LEAVE";
    }
    else if (backendStatus === "holiday") {
      return "HOLIDAY";
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
    const menuRef = React.useRef(null);
    
    const config = ATTENDANCE_TYPES[status] || ATTENDANCE_TYPES.NOT_MARKED;

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setShowMenu(false);
        }
      };

      if (showMenu) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showMenu]);

    const handleClick = async (type) => {
      setShowMenu(false);
      if (type === 'SPECIAL_LEAVE' || type === 'MANDATORY_LEAVE') {
        handleSpecialLeaveClick(employee.id, date, type);
      } else {
        await handleAttendanceChange(employee.id, date, type);
      }
    };

    const toggleMenu = () => {
      setShowMenu(prev => !prev);
    };

    const tooltipContent = record ? (
      <div style={styles.tooltipContent}>
        <div><strong>Status:</strong> {config.label}</div>
        {record.leave_master_details && (
          <>
            <div><strong>Leave Type:</strong> {record.leave_master_details.leave_name}</div>
            <div><strong>Payment:</strong> {record.leave_master_details.payment_status_display}</div>
          </>
        )}
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

    const renderStar = () => {
      if (status === "PUNCH_IN_ONLY") {
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: 'block' }}>
            <defs>
              <linearGradient id={`half-gradient-${date}`}>
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#half-gradient-${date})`}
              stroke="none"
            />
          </svg>
        );
      }
      return <span style={{ fontSize: '20px' }}>{config.icon}</span>;
    };

    return (
      <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={toggleMenu}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={saving}
          style={{
            ...styles.starButton,
            color: status === "PUNCH_IN_ONLY" ? "transparent" : config.color,
            opacity: saving ? 0.5 : 1,
          }}
        >
          {renderStar()}
        </button>

        {showTooltip && !showMenu && (
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
            <div style={styles.dropdownDivider} />
            <button
              onClick={() => handleClick('SPECIAL_LEAVE')}
              style={styles.dropdownItem}
            >
              <span style={{ color: ATTENDANCE_TYPES.SPECIAL_LEAVE.color, marginRight: 8, fontSize: 18 }}>
                {ATTENDANCE_TYPES.SPECIAL_LEAVE.icon}
              </span>
              {ATTENDANCE_TYPES.SPECIAL_LEAVE.label}
            </button>
            <button
              onClick={() => handleClick('MANDATORY_LEAVE')}
              style={styles.dropdownItem}
            >
              <span style={{ color: ATTENDANCE_TYPES.MANDATORY_LEAVE.color, marginRight: 8, fontSize: 18 }}>
                {ATTENDANCE_TYPES.MANDATORY_LEAVE.icon}
              </span>
              {ATTENDANCE_TYPES.MANDATORY_LEAVE.label}
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
            <div style={styles.searchRow}>
              <input
                type="text"
                placeholder="Enter name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <button
                onClick={() => navigate('/total-summary')}
                style={styles.totalSummaryButton}
                title="View Total Monthly Summary"
              >
                <BarChart3 size={18} />
                <span>Total Summary</span>
              </button>
            </div>
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
            {key === "PUNCH_IN_ONLY" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <defs>
                  <linearGradient id="legend-half-gradient">
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#d1d5db" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="url(#legend-half-gradient)"
                  stroke="none"
                />
              </svg>
            ) : (
              <span style={{ color: value.color, fontSize: 18, marginRight: 8 }}>{value.icon}</span>
            )}
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
                <th colSpan={daysInMonth} style={{ ...styles.tableHeader, borderRight: 'none', textAlign: 'center' }}>
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
                      <div style={{ ...styles.dayName, color: isSunday ? '#ef4444' : '#6b7280' }}>
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
                    <td style={{ ...styles.stickyCell, textAlign: 'left', fontWeight: 500 }}>{employee.name}</td>
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

      {showLeaveModal && (
        <div style={styles.modalOverlay} onClick={() => setShowLeaveModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Select {selectedLeaveType === 'MANDATORY_LEAVE' ? 'Mandatory Holiday' : 'Special Leave'}
              </h2>
              <button onClick={() => setShowLeaveModal(false)} style={styles.closeButton}>
                <X size={24} />
              </button>
            </div>
            <div style={styles.modalContent}>
              {leaveMasters.length === 0 ? (
                <p style={styles.noLeaves}>No leaves available. Please add them in the Leave Master section.</p>
              ) : (
                <div style={styles.leaveList}>
                  {leaveMasters
                    .filter(leave => {
                      // Filter based on selected leave type
                      if (selectedLeaveType === 'MANDATORY_LEAVE') {
                        return leave.category === 'mandatory_holiday';
                      } else if (selectedLeaveType === 'SPECIAL_LEAVE') {
                        return leave.category === 'special';
                      }
                      return true; // Show all if no specific type selected
                    })
                    .map((leave) => (
                      <button
                        key={leave.id}
                        onClick={() => handleLeaveSelection(leave)}
                        style={styles.leaveItem}
                      >
                        <div style={styles.leaveInfo}>
                          <div style={styles.leaveName}>{leave.leave_name}</div>
                          <div style={styles.leaveDetails}>
                            <span style={styles.leaveCategory}>
                              {leave.category === 'mandatory_holiday' ? 'Mandatory Holiday' : 'Special Leave'}
                            </span>
                            <span style={{ 
                              ...styles.leavePayment,
                              backgroundColor: leave.payment_status === 'paid' ? '#dcfce7' : '#fee2e2',
                              color: leave.payment_status === 'paid' ? '#166534' : '#991b1b'
                            }}>
                              {leave.payment_status_display}
                            </span>
                          </div>
                          {leave.leave_date && (
                            <div style={styles.leaveDate}>
                              Date: {new Date(leave.leave_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    margin: 0,
  },
  filterSection: {
    backgroundColor: "#ffffff",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  filterRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "16px",
    alignItems: "flex-end",
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
    width: "180px",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  searchRow: {
    display: "flex",
    gap: "8px",
    alignItems: "stretch",
  },
  searchInput: {
    width: "200px",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  selectInput: {
    width: "180px",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  totalSummaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#8b5cf6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
    whiteSpace: "nowrap",
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
    minWidth: "220px",
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
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#e5e7eb",
    margin: "8px 0",
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
    textAlign: "center",
    padding: "40px 20px",
    color: "#6b7280",
    fontSize: "14px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: "#6b7280",
    transition: "color 0.2s",
  },
  modalContent: {
    padding: "24px",
    overflowY: "auto",
  },
  noLeaves: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#6b7280",
    fontSize: "14px",
  },
  leaveList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  leaveItem: {
    width: "100%",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
  },
  leaveInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  leaveName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
  },
  leaveDetails: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  leaveCategory: {
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "4px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    fontWeight: "500",
  },
  leavePayment: {
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: "500",
  },
  leaveDate: {
    fontSize: "12px",
    color: "#6b7280",
  },
}