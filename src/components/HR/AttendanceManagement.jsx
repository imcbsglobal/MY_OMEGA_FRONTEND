// src/components/HR/AttendanceManagement.jsx
// Full working file: preserves your original style & structure,
// adds API integration and auto-status calculation (Full Day / Half Day / Leave / Holiday / Not Marked).
// Uses your existing api client at ../../api/client

import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/client";

const ATTENDANCE_TYPES = {
  FULL_DAY: { label: "Full Day", color: "#10b981", icon: "full" },
  VERIFIED: { label: "Verified", color: "#3b82f6", icon: "full" },
  HALF_DAY: { label: "Half Day", color: "#f59e0b", icon: "half" },
  VERIFIED_HALF: { label: "Verified Half Day", color: "#f43f5e", icon: "half" },
  LEAVE: { label: "Leave", color: "#ef4444", icon: "full" },
  HOLIDAY: { label: "Holiday", color: "#eab308", icon: "full" },
  NOT_MARKED: { label: "Not Marked", color: "#9ca3af", icon: "full" }
};

// -------------------- Helpers --------------------
const defaultMonthISO = () => new Date().toISOString().slice(0, 7);

// Try to parse many time formats into minutes since 00:00.
// Accepts: "09:30", "09:30:00", "09:30 am", "9:30 PM", "2025-11-15T09:30:00", etc.
// Returns minutes number or null.
function parseTimeToMinutes(value) {
  if (!value && value !== 0) return null;
  if (typeof value === "number") return value; // already minutes
  // If ISO datetime -> extract time portion
  if (typeof value === "string") {
    const str = value.trim();
    // if contains 'T' (ISO)
    const tIndex = str.indexOf("T");
    if (tIndex !== -1) {
      const timePart = str.slice(tIndex + 1).split("+")[0].split("Z")[0];
      return parseHmsToMinutes(timePart);
    }
    // if contains space with AM/PM
    const ampmMatch = str.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*(am|pm|AM|PM)/);
    if (ampmMatch) {
      return parseHmsToMinutes(ampmMatch[1] + " " + ampmMatch[2]);
    }
    // if simple hh:mm or hh:mm:ss
    return parseHmsToMinutes(str);
  }
  return null;
}

function parseHmsToMinutes(s) {
  if (!s) return null;
  const raw = s.trim();
  // handle am/pm
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
  // handle hh:mm[:ss]
  const parts = raw.split(":").map(p => parseInt(p, 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const hh = parts[0];
    const mm = parts[1];
    if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) return hh * 60 + mm;
  }
  return null;
}

// format minutes back to hh:mm AM/PM (short)
function minutesToDisplay(mins) {
  if (mins == null) return "-";
  const hh = Math.floor(mins / 60) % 24;
  const mm = Math.floor(mins % 60);
  const date = new Date();
  date.setHours(hh, mm, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// compute hours difference (float hours) from two time values (any format)
function computeHoursBetween(a, b) {
  const ma = parseTimeToMinutes(a);
  const mb = parseTimeToMinutes(b);
  if (ma == null || mb == null) return 0;
  return (mb - ma) / 60;
}

// -------------------- Reused UI: Modal and Cell (kept from your original) --------------------
function AddEditEmployeeModal({ isOpen, onClose, onSubmit, existingData }) {
  const [employeeData, setEmployeeData] = useState({
    name: "",
    userId: "",
    dutyStart: "09:30",
    dutyEnd: "17:30",
  });

  useEffect(() => {
    if (existingData) {
      setEmployeeData(existingData);
    } else {
      setEmployeeData({
        name: "",
        userId: "",
        dutyStart: "09:30",
        dutyEnd: "17:30",
      });
    }
  }, [existingData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!employeeData.name.trim() || !employeeData.userId.trim()) {
      alert("Please fill in name and user ID");
      return;
    }
    onSubmit(employeeData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {existingData ? "Edit Employee" : "Add New Employee"}
          </h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Employee Name *</label>
              <input
                style={styles.input}
                name="name"
                value={employeeData.name}
                onChange={handleInputChange}
                placeholder="Enter employee name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>User ID *</label>
              <input
                style={styles.input}
                name="userId"
                value={employeeData.userId}
                onChange={handleInputChange}
                placeholder="Enter user ID/email"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Duty Start Time</label>
              <input
                style={styles.input}
                type="time"
                name="dutyStart"
                value={employeeData.dutyStart}
                onChange={handleInputChange}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Duty End Time</label>
              <input
                style={styles.input}
                type="time"
                name="dutyEnd"
                value={employeeData.dutyEnd}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} style={styles.submitBtn}>
            {existingData ? "Update Employee" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttendanceCell({ attendance, date, onAttendanceChange }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAttendanceClick = (type) => {
    onAttendanceChange(date, type);
    setShowMenu(false);
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
        <svg width="20" height="20" viewBox="0 0 24 24">
          <defs>
            <clipPath id={`half-${date}-${color}`}>
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          <path
            d="M12 .587l3.668 7.568L24 9.423l-6 5.853L19.335 24 12 19.897 4.665 24 6 15.276 0 9.423l8.332-1.268z"
            fill={color}
            clipPath={`url(#half-${date}-${color})`}
          />
          <path
            d="M12 .587l3.668 7.568L24 9.423l-6 5.853L19.335 24 12 19.897 4.665 24 6 15.276 0 9.423l8.332-1.268z"
            fill="none"
            stroke={color}
          />
        </svg>
      );
    }

    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
        <path d="M12 .587l3.668 7.568L24 9.423l-6 5.853L19.335 24 12 19.897 4.665 24 6 15.276 0 9.423l8.332-1.268z" />
      </svg>
    );
  };

  return (
    <td style={styles.attendanceCell}>
      <div style={styles.attendanceCellContent}>
        <button
          style={styles.attendanceBtn}
          onClick={() => setShowMenu(!showMenu)}
        >
          <StarIcon color={iconColor} type={iconType} />
        </button>

        {showMenu && (
          <div style={styles.attendanceMenu}>
            {Object.keys(ATTENDANCE_TYPES).map((key) => (
              <button
                key={key}
                style={styles.attendanceMenuItem}
                onClick={() => handleAttendanceClick(key)}
              >
                {ATTENDANCE_TYPES[key].label}
              </button>
            ))}
          </div>
        )}
      </div>
    </td>
  );
}

      {/* show punch in/out below the star (kept your style) */}
      {/* <div style={{ marginTop: 6, textAlign: "center", fontSize: 12 }}>
        <div style={{ color: "#111827", fontWeight: 600 }}>
          {punchIn ? minutesToDisplay(parseTimeToMinutes(punchIn)) : "—"}
        </div>
        <div style={{ color: "#6b7280" }}>
          {punchOut ? minutesToDisplay(parseTimeToMinutes(punchOut)) : "—"}
        </div>
      </div> */
}

// -------------------- Main Component --------------------
export default function AttendanceManagement() {
  const [employees, setEmployees] = useState([]); // array of { id, name, userId, dutyStart, dutyEnd, records: { 'yyyy-mm-dd': { ... } } }
  const [overrides, setOverrides] = useState({}); // manual overrides keyed by `${employeeId}-${yyyy-mm-dd}`
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthISO());
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load from API when month changes
  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  async function fetchAttendance() {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-");
      const res = await api.get(`/hr/attendance/my_records/?month=${Number(month)}&year=${year}`);
      // Accept many shapes
      const payload = res?.data || [];
      const rows = Array.isArray(payload) ? payload : (Array.isArray(payload.records) ? payload.records : payload.data || []);

      // Build employees map from rows
      const empMap = new Map();

      // robust getter
      const pick = (obj, keys) => {
        for (const k of keys) {
          if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== null && obj[k] !== undefined) return obj[k];
        }
        return undefined;
      };

      rows.forEach((r) => {
        // expected keys: employee_id / user_id / id
        const empId = pick(r, ["employee_id", "user_id", "user", "id", "employee"]) ?? (r.name ? `name-${r.name}` : `emp-${Math.random().toString(36).slice(2,8)}`);
        const name = pick(r, ["employee_name", "name", "full_name", "user_name"]) || `Employee ${empId}`;
        const userId = pick(r, ["user_id", "email", "user_email"]) || "";
        const dutyStart = pick(r, ["duty_start", "dutyStart", "start_time"]) || "-";
        const dutyEnd = pick(r, ["duty_end", "dutyEnd", "end_time"]) || "-";

        const dateRaw = pick(r, ["date", "attendance_date", "day", "record_date"]);
        // normalize date to yyyy-mm-dd if possible (take first 10 chars)
        const date = typeof dateRaw === "string" ? dateRaw.slice(0, 10) : dateRaw;

        // ensure an entry
        if (!empMap.has(empId)) {
          empMap.set(empId, {
            id: empId,
            name,
            userId,
            dutyStart,
            dutyEnd,
            records: {}, // date -> record
          });
        }
        const emp = empMap.get(empId);

        // attach record if date present
        if (date) {
          emp.records[date] = {
            ...r,
            // try to normalize common punch fields
            punch_in: pick(r, ["punch_in", "punch_in_time", "in_time", "time_in"]),
            punch_out: pick(r, ["punch_out", "punch_out_time", "out_time", "time_out"]),
            date,
          };
        }
      });

      // Convert to array
      const arr = Array.from(empMap.values()).sort((a,b) => (a.name || "").localeCompare(b.name || ""));
      setEmployees(arr);
      // reset overrides when new data loaded (optional)
      // setOverrides({});
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      // keep previous state on error
    } finally {
      setLoading(false);
    }
  }

  // Utility for days
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

  // handle manual override from attendance cell menu
  const handleAttendanceChange = (employeeId, date, type) => {
    const key = `${employeeId}-${date}`;
    setOverrides((prev) => ({ ...prev, [key]: type }));
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleModalSubmit = (employeeData) => {
    let updatedEmployees;
    if (editingEmployee) {
      updatedEmployees = employees.map(emp =>
        emp.id === editingEmployee.id ? { ...emp, ...employeeData } : emp
      );
    } else {
      // create new local employee id
      const newId = `local-${Date.now()}`;
      updatedEmployees = [{ id: newId, name: employeeData.name, userId: employeeData.userId, dutyStart: employeeData.dutyStart, dutyEnd: employeeData.dutyEnd, records: {} }, ...employees];
    }
    setEmployees(updatedEmployees);
  };

  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (emp.name || "").toLowerCase().includes(q) || (emp.userId || "").toLowerCase().includes(q);
  });

  const getSummaryIcon = (employeeId) => "📊";

  // status determination according to rules:
  // - Sunday => HOLIDAY
  // - No punch in & no punch out => LEAVE
  // - both exist => hours >=8 => FULL_DAY, hours>=4 => HALF_DAY, else NOT_MARKED
  // - missing one => NOT_MARKED
  const determineStatus = (date, emp, overrideKey) => {
    const isSunday = getDayOfWeek(selectedMonth, Number(date.split("-").pop())) === 0;
    const override = overrideKey ? overrides[overrideKey] : undefined;
    if (override) return override;

    const rec = emp.records && emp.records[date];
    const punchIn = rec?.punch_in;
    const punchOut = rec?.punch_out;

    if (isSunday) return "HOLIDAY";
    if (!punchIn && !punchOut) return "LEAVE";
    if (punchIn && punchOut) {
      const hours = computeHoursBetween(punchIn, punchOut);
      if (hours >= 8) return "FULL_DAY";
      if (hours >= 4) return "HALF_DAY";
      return "NOT_MARKED";
    }
    return "NOT_MARKED";
  };

  // compute hours using helpers
  function computeHoursBetween(a, b) {
    return computeHoursBetween_local(a, b);
  }
  function computeHoursBetween_local(a, b) {
    const ma = parseTimeToMinutes(a);
    const mb = parseTimeToMinutes(b);
    if (ma == null || mb == null) return 0;
    return (mb - ma) / 60;
  }

  // render cell content while keeping old star+times layout
  const renderAttendanceCell = (emp, date) => {
    const key = `${emp.id}-${date}`;
    const override = overrides[key];
    // if override present, treat as status from override
    const status = override || (emp.records[date] ? determineStatus(date, emp, key) : (getDayOfWeek(selectedMonth, Number(date.split("-").pop())) === 0 ? "HOLIDAY" : "LEAVE"));
    const rec = emp.records[date] || {};
    const punchIn = rec.punch_in;
    const punchOut = rec.punch_out;

    return (
      <AttendanceCell
        key={key}
        attendance={status}
        date={date}
        onAttendanceChange={(d, type) => handleAttendanceChange(emp.id, d, type)}
        punchIn={punchIn}
        punchOut={punchOut}
      />
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Attendance Management</h2>
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
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <button onClick={handleAddEmployee} style={styles.addButton}>
            + Add New
          </button>
        </div>
      </div>

      <div style={styles.legendContainer}>
        {Object.entries(ATTENDANCE_TYPES).map(([key, value]) => {
          const StarIcon = ({ color, type }) => {
            if (type === "half") {
              return (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: "block" }}
                >
                  <defs>
                    <clipPath id={`half-clip-legend-${key}`}>
                      <rect x="0" y="0" width="12" height="24" />
                    </clipPath>
                  </defs>
                  <path
                    d="M12 .587l3.668 7.568L24 9.423l-6 5.853L19.335 24 12 19.897 4.665 24 6 15.276 0 9.423l8.332-1.268z"
                    fill={color}
                    clipPath={`url(#half-clip-legend-${key})`}
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={color}
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
              >
                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.853L19.335 24 12 19.897 4.665 24 6 15.276 0 9.423l8.332-1.268z" />
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
              <th style={{...styles.tableHeader, ...styles.stickyColumn, width: '50px', padding: '12px 4px', textAlign: 'center'}}>NO</th>
              <th style={{...styles.tableHeader, ...styles.stickyNameColumn, padding: '12px 8px'}}>NAME</th>
              <th style={styles.tableHeader}>USER ID</th>
              <th style={styles.tableHeader}>DUTY START</th>
              <th style={styles.tableHeader}>DUTY END</th>
              <th style={styles.tableHeader}>SUMMARY</th>
              {days.map(day => {
                const dayName = getDayName(selectedMonth, day);
                const isSunday = getDayOfWeek(selectedMonth, day) === 0;
                return (
                  <th key={day} style={{
                    ...styles.tableHeader,
                    ...styles.dayHeader,
                    backgroundColor: isSunday ? '#fef3c7' : '#f3f4f6',
                  }}>
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
                <td colSpan={days.length + 6} style={styles.noResults}>
                  Loading...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={days.length + 6} style={styles.noResults}>
                  {searchQuery ? `No employees found for "${searchQuery}"` : "No employees available"}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee, index) => (
                <tr key={employee.id} style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.stickyColumn, padding: '12px 4px', textAlign: 'center', width: '50px'}}>{index + 1}</td>
                  <td style={{...styles.tableCell, ...styles.stickyNameColumn, fontWeight: '600', padding: '12px 8px'}}>{employee.name}</td>
                  <td style={styles.tableCell}>{employee.userId}</td>
                  <td style={styles.tableCell}>{employee.dutyStart}</td>
                  <td style={styles.tableCell}>{employee.dutyEnd}</td>
                  <td style={styles.tableCell}>
                    <button style={styles.summaryBtn}>{getSummaryIcon(employee.id)}</button>
                  </td>
                  {days.map((day) => {
                    const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
                    const key = `${employee.id}-${date}`;
                    return renderAttendanceCell(employee, date);
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddEditEmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        existingData={editingEmployee}
      />
    </div>
  );
}

// -------------------- Styles (kept identical to your original) --------------------
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
    transition: "all 0.3s",
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
    transition: "all 0.3s",
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
  addButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
  legendIcon: {
    fontSize: "18px",
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
  stickyColumn: {
    position: "sticky",
    left: 0,
    backgroundColor: "white",
    zIndex: 5,
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
    transition: "background-color 0.2s",
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
    transition: "transform 0.2s",
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
    transition: "background-color 0.2s",
  },
  summaryBtn: {
    fontSize: "20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "4px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
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
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  closeButton: {
    fontSize: "28px",
    fontWeight: "300",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
  },
  modalBody: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitBtn: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};
