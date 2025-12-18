import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, User, Clock, Hash } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";

const STATUS_LABELS = {
  VERIFIED: "Verified Full Day",
  FULL_DAY: "Full Day",
  VERIFIED_HALF: "Verified Half Day",
  HALF_DAY: "Half Day",
  LEAVE: "Leave",
  HOLIDAY: "Holiday",
  NOT_MARKED: "Not Marked"
};

const STATUS_COLORS = {
  VERIFIED: "#3b82f6",
  FULL_DAY: "#10b981",
  VERIFIED_HALF: "#8b5cf6", 
  HALF_DAY: "#be185d",
  LEAVE: "#ef4444",
  HOLIDAY: "#fbbf24",
  NOT_MARKED: "#9ca3af"
};

export default function AttendanceSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const employee = state?.employee;
  const selectedMonth = state?.selectedMonth;

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    verifiedFull: 0,
    full: 0,
    verifiedHalf: 0,
    half: 0,
    leave: 0,
    notMarked: 0,
    holidays: 0,
    rows: []
  });

  // Safety check
  if (!employee || !selectedMonth) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={() => navigate("/attendance-management")} style={styles.backBtn}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={styles.title}>No data found</h2>
        </div>
        <div style={styles.noData}>
          <p>No employee data available. Please go back and select an employee.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchAttendanceRecords();
  }, [employee, selectedMonth]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-");

      const response = await api.get("/hr/attendance/", {
        params: {
          month: parseInt(month),
          year: parseInt(year),
          user: employee.id,
        },
      });

      let attendanceList = response.data;
      if (!Array.isArray(attendanceList)) {
        attendanceList = attendanceList.results || [];
      }

      buildSummary(attendanceList);
    } catch (error) {
      console.error("Admin API failed, using fallback", error);
      buildSummaryFromEmployeeRecords();
    } finally {
      setLoading(false);
    }
  };

  const buildSummaryFromEmployeeRecords = () => {
    const [year, month] = selectedMonth.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();

    let s = {
      verifiedFull: 0,
      full: 0,
      verifiedHalf: 0,
      half: 0,
      leave: 0,
      notMarked: 0,
      holidays: 0,
      rows: []
    };

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${selectedMonth}-${String(d).padStart(2, "0")}`;
      const date = new Date(dateKey);
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      
      const record = employee.records?.[dateKey];

      let status = "NOT_MARKED";
      let punchIn = "-";
      let punchOut = "-";
      let totalWorkingTime = "-";
      let punchInLocation = "-";
      let punchOutLocation = "-";
      let note = "-";

      if (isSunday) {
        status = "HOLIDAY";
        s.holidays++;
      } else if (record) {
        const st = (record.status || "").toLowerCase();
        if (st === "full") status = record.is_verified ? "VERIFIED" : "FULL_DAY";
        else if (st === "half") status = record.is_verified ? "VERIFIED_HALF" : "HALF_DAY";
        else if (st === "leave") status = "LEAVE";

        punchIn = formatTime(record.punch_in);
        punchOut = formatTime(record.punch_out);
        totalWorkingTime = record.total_working_hours || record.working_hours || "-";
        punchInLocation = record.punch_in_location || record.location || "-";
        punchOutLocation = record.punch_out_location || "-";
        note = record.admin_note || "-";
      }

      if (status === "VERIFIED") s.verifiedFull++;
      else if (status === "FULL_DAY") s.full++;
      else if (status === "VERIFIED_HALF") s.verifiedHalf++;
      else if (status === "HALF_DAY") s.half++;
      else if (status === "LEAVE") s.leave++;
else if (status === "NOT_MARKED") {
  // do nothing here
}

      s.rows.push({
        date: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        day: date.toLocaleDateString("en-IN", { weekday: "long" }),
        status,
        punchIn,
        punchOut,
        totalWorkingTime,
        punchInLocation,
        punchOutLocation,
        note
      });
    }

    setSummary(s);
  };

  const buildSummary = (attendanceRecords) => {
    const [year, month] = selectedMonth.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();

    // Create a map of dates to records for easy lookup
    const recordsMap = {};
    attendanceRecords.forEach(record => {
      const date = record.date || record.attendance_date;
      if (date) {
        const formattedDate = typeof date === "string" ? date.slice(0, 10) : date;
        recordsMap[formattedDate] = {
          ...record,
          punch_in: record.punch_in || record.punch_in_time || record.in_time,
          punch_out: record.punch_out || record.punch_out_time || record.out_time,
          status: record.status || record.attendance_status,
          verification_status: record.verification_status || record.is_verified,
          is_verified: record.is_verified || record.verified,
          total_working_hours: record.total_working_hours || record.working_hours,
          punch_in_location: record.punch_in_location || record.location,
          punch_out_location: record.punch_out_location,
          admin_note: record.admin_note
        };
      }
    });

    let s = {
      verifiedFull: 0,
      full: 0,
      verifiedHalf: 0,
      half: 0,
      leave: 0,
      notMarked: 0,
      holidays: 0,
      rows: []
    };

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${selectedMonth}-${String(d).padStart(2, "0")}`;
      const date = new Date(dateKey);
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      
      const record = recordsMap[dateKey];

      let status = "NOT_MARKED";
      let punchIn = "-";
      let punchOut = "-";
      let totalWorkingTime = "-";
      let punchInLocation = "-";
      let punchOutLocation = "-";
      let note = "-";

      if (isSunday) {
        status = "HOLIDAY";
        s.holidays++;
      } else if (record) {
        const st = (record.status || "").toLowerCase();
        if (st === "full") status = record.is_verified ? "VERIFIED" : "FULL_DAY";
        else if (st === "half") status = record.is_verified ? "VERIFIED_HALF" : "HALF_DAY";
        else if (st === "leave") status = "LEAVE";

        punchIn = formatTime(record.punch_in);
        punchOut = formatTime(record.punch_out);
        totalWorkingTime = record.total_working_hours || "-";
        punchInLocation = record.punch_in_location || "-";
        punchOutLocation = record.punch_out_location || "-";
        note = record.admin_note || "-";
      }

      if (status === "VERIFIED") s.verifiedFull++;
      else if (status === "FULL_DAY") s.full++;
      else if (status === "VERIFIED_HALF") s.verifiedHalf++;
      else if (status === "HALF_DAY") s.half++;
      else if (status === "LEAVE") s.leave++;
      else if (status === "NOT_MARKED") s.notMarked++;

      s.rows.push({
        date: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        day: date.toLocaleDateString("en-IN", { weekday: "long" }),
        status,
        punchIn,
        punchOut,
        totalWorkingTime,
        punchInLocation,
        punchOutLocation,
        note
      });
    }

    setSummary(s);
  };

  const formatTime = (timeValue) => {
    if (!timeValue || timeValue === "-") return "-";

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
      return "-";
    }
  };

  const getMonthName = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={styles.title}>Loading Attendance Summary...</h2>
        </div>
        <div style={styles.loading}>
          <p>Loading data for {employee.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={styles.title}>Attendance Summary for {employee.name}</h2>
          <div style={styles.subtitle}>
            <Calendar size={14} />
            <span style={styles.monthBadge}>{getMonthName()}</span>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div style={styles.employeeInfo}>
        <div style={styles.infoItem}>
          <User size={16} />
          <span style={styles.infoLabel}>User ID:</span>
          <span style={styles.infoValue}>{employee.userId}</span>
        </div>
        <div style={styles.infoItem}>
          <Clock size={16} />
          <span style={styles.infoLabel}>Duty Time:</span>
          <span style={styles.infoValue}>{employee.dutyStart} - {employee.dutyEnd}</span>
        </div>
        <div style={styles.infoItem}>
          <Hash size={16} />
          <span style={styles.infoLabel}>Total Days:</span>
          <span style={styles.infoValue}>{summary.rows.length - summary.holidays}</span>
        </div>
      </div>

      {/* Summary Cards - Single Row with Colors */}
      <div style={styles.summaryCardsRow}>
        {/* Full Days (Unverified) */}
        <div style={{...styles.colorCard, background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'}}>
          <div style={styles.colorCardTitle}>Full Days(Unverified)</div>
          <div style={styles.colorCardNumber}>{summary.full}</div>
        </div>

        {/* Verified Full Days */}
        <div style={{...styles.colorCard, background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'}}>
          <div style={styles.colorCardTitle}>Verified Full Days</div>
          <div style={styles.colorCardNumber}>{summary.verifiedFull}</div>
        </div>

        {/* Half Days (Unverified) */}
        <div style={{...styles.colorCard, background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'}}>
          <div style={styles.colorCardTitle}>Half Days(Unverified)</div>
          <div style={styles.colorCardNumber}>{summary.half}</div>
        </div>

        {/* Verified Half Days */}
        <div style={{...styles.colorCard, background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'}}>
          <div style={styles.colorCardTitle}>Verified Half Days</div>
          <div style={styles.colorCardNumber}>{summary.verifiedHalf}</div>
        </div>
      </div>

      {/* Second Row Cards */}
      <div style={styles.summaryCardsRow}>
        {/* Leaves */}
        <div style={{...styles.colorCard, ...styles.halfWidthCard, background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'}}>
          <div style={styles.colorCardTitle}>Leaves</div>
          <div style={styles.colorCardNumber}>{summary.leave}</div>
        </div>

        {/* Not Marked */}
        <div style={{...styles.colorCard, ...styles.halfWidthCard, background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'}}>
          <div style={styles.colorCardTitle}>Not Marked</div>
          <div style={styles.colorCardNumber}>{summary.notMarked}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Location Info */}
      <div style={styles.locationInfo}>
        <span style={styles.locationText}>Vojsin ☑ Vojsin ☑ --- Vojsin ☑ Vojsin ☑ Vojsin ☑ ---</span>
      </div>

      {/* Table */}
      <div style={styles.tableSection}>
        <h3 style={styles.tableTitle}>Date</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Day</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Punch In Time</th>
                <th style={styles.th}>Punch Out Time</th>
                <th style={styles.th}>Total Working Time</th>
                <th style={styles.th}>Punch In Location</th>
                <th style={styles.th}>Punch Out Location</th>
                <th style={styles.th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.map((r, i) => {
                const isHoliday = r.status === "HOLIDAY";
                const isLeave = r.status === "LEAVE";
                const isVerified = r.status === "VERIFIED";
                const isHalfDay = r.status === "HALF_DAY";
                const isNotMarked = r.status === "NOT_MARKED";
                
                let rowBg = "white";
                if (isHoliday) rowBg = "#e0f2fe";
                else if (isLeave) rowBg = "#fee2e2";
                
                return (
                  <tr key={i} style={{...styles.tr, backgroundColor: rowBg}}>
                    <td style={styles.td}>{r.date}</td>
                    <td style={styles.td}>{r.day}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: isLeave ? '#ef4444' : isVerified ? '#3b82f6' : isHalfDay ? '#f59e0b' : isHoliday ? '#06b6d4' : isNotMarked ? '#6b7280' : '#10b981',
                      }}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td style={styles.td}>{r.punchIn}</td>
                    <td style={styles.td}>{r.punchOut}</td>
                    <td style={styles.td}>{r.totalWorkingTime}</td>
                    <td style={styles.td}>{r.punchInLocation}</td>
                    <td style={styles.td}>{r.punchOutLocation}</td>
                    <td style={styles.noteCell}>{r.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* Clean Minimal Styles */
const styles = {
  page: {
    padding: "24px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: "#374151",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e5e7eb",
  },

  backBtn: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },

  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#000000",
    margin: "0 0 8px 0",
  },

  subtitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#6b7280",
  },

  monthBadge: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    padding: "4px 12px",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "500",
  },

  employeeInfo: {
    display: "flex",
    gap: "32px",
    marginBottom: "28px",
    padding: "16px 20px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  infoLabel: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "600",
  },

  summaryCardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "14px",
  },

  colorCard: {
    borderRadius: "6px",
    padding: "16px 18px",
    color: "#374151",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },

  halfWidthCard: {
    gridColumn: "span 2",
  },

  colorCardTitle: {
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#6b7280",
  },

  colorCardNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1f2937",
  },

  divider: {
    height: "1px",
    backgroundColor: "#e5e7eb",
    margin: "28px 0",
  },

  locationInfo: {
    marginBottom: "24px",
    padding: "12px 16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    textAlign: "center",
  },

  locationText: {
    fontSize: "14px",
    color: "#4b5563",
    fontWeight: "500",
  },

  tableSection: {
    marginBottom: "40px",
  },

  tableTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 16px 0",
  },

  tableWrapper: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
    fontSize: "13px",
  },

  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #f3f4f6",
  },

  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    display: "inline-block",
  },

  noteCell: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "top",
    whiteSpace: "normal",
    maxWidth: "300px",
    lineHeight: "1.4",
    fontSize: "12px",
  },

  loading: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
  },

  noData: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
  },
};
