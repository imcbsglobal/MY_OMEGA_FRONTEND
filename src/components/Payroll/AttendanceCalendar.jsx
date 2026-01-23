import React, { useState, useEffect } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import api from "../../api/client";

export default function AttendanceCalendar({ employeeId, month, year }) {
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    workingDays: 0,
    weekends: 0,
    holidays: 0,
  });

  // Minimal, soft palette grouped by category
  const baseStatusStyles = {
    working: {
      label: "Working",
      bg: "#e8f5ee",
      fg: "#166534",
      border: "#c6e9d9",
    },
    paidLeave: {
      label: "Paid Leave",
      bg: "#fff7e6",
      fg: "#b45309",
      border: "#f7e0b2",
    },
    unpaidLeave: {
      label: "Unpaid Leave",
      bg: "#f3f4f6",
      fg: "#4b5563",
      border: "#d1d5db",
    },
    holiday: {
      label: "Holiday/Weekend",
      bg: "#f7f7f7",
      fg: "#6b7280",
      border: "#e5e7eb",
    },
    absent: {
      label: "Absent",
      bg: "#fdecec",
      fg: "#b91c1c",
      border: "#f4c7c7",
    },
  };

  const mapStatusToStyle = (status) => {
    switch (status) {
      case "full":
      case "half":
      case "wfh":
        return baseStatusStyles.working;
      case "casual_leave":
      case "sick_leave":
      case "special_leave":
        return baseStatusStyles.paidLeave;
      case "mandatory_holiday":
      case "special_holiday":
      case "sunday":
      case "weekend":
        return baseStatusStyles.holiday;
      case "unpaid_leave":
        return baseStatusStyles.unpaidLeave;
      case "absent":
      default:
        return baseStatusStyles.absent;
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchAttendanceCalendar();
    }
  }, [employeeId, month, year]);

  const fetchAttendanceCalendar = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch attendance data for the employee for the given month/year
      const response = await api.get(
        `hr/attendance/?user_id=${employeeId}&month=${month}&year=${year}`
      );

      if (response.data) {
        const attendanceRecords = Array.isArray(response.data) 
          ? response.data 
          : response.data.results || [];
        processAttendanceData(attendanceRecords);
      }
    } catch (err) {
      console.error("Failed to fetch attendance calendar:", err);
      // Don't show error to user, just show empty calendar
      setCalendarData({});
      setStats({
        presentDays: 0,
        absentDays: 0,
        leaveDays: 0,
        paidLeaveDays: 0,
        unpaidLeaveDays: 0,
        workingDays: 0,
        weekends: 0,
        holidays: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = (attendanceRecords) => {
    const calendar = {};
    const statsObj = {
      presentDays: 0,
      absentDays: 0,
      leaveDays: 0,
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      workingDays: 0,
      weekends: 0,
      holidays: 0,
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    // Initialize all days with default absent style; mark weekends as holiday
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      const dayOfWeek = date.getDay();
      const baseStyle = mapStatusToStyle("absent");

      calendar[i] = {
        status: "absent",
        label: baseStyle.label,
        bg: baseStyle.bg,
        fg: baseStyle.fg,
        border: baseStyle.border,
      };

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const weekendStyle = mapStatusToStyle("weekend");
        calendar[i] = {
          status: "weekend",
          label: "Weekend",
          bg: weekendStyle.bg,
          fg: weekendStyle.fg,
          border: weekendStyle.border,
        };
        statsObj.weekends++;
      }
    }

    // Process actual attendance records
    if (Array.isArray(attendanceRecords)) {
      attendanceRecords.forEach((record) => {
        const recordDate = new Date(record.date);
        const day = recordDate.getDate();

        if (day >= 1 && day <= daysInMonth) {
          const status = record.status || "absent";
          const isPaid =
            record.is_paid_leave ||
            [
              "full",
              "half",
              "casual_leave",
              "sick_leave",
              "special_leave",
              "mandatory_holiday",
              "special_holiday",
              "sunday",
              "wfh",
            ].includes(status);

          const mapped = mapStatusToStyle(status);
          calendar[day] = {
            status: status,
            label: mapped.label,
            bg: mapped.bg,
            fg: mapped.fg,
            border: mapped.border,
          };

          // Update statistics
          switch (status) {
            case "full":
              statsObj.presentDays++;
              statsObj.workingDays++;
              break;
            case "half":
              statsObj.presentDays++;
              statsObj.workingDays += 0.5;
              break;
            case "absent":
              statsObj.absentDays++;
              break;
            case "casual_leave":
            case "sick_leave":
            case "special_leave":
              statsObj.leaveDays++;
              statsObj.paidLeaveDays++;
              break;
            case "unpaid_leave":
              statsObj.leaveDays++;
              statsObj.unpaidLeaveDays++;
              break;
            case "mandatory_holiday":
            case "special_holiday":
              statsObj.holidays++;
              break;
            case "sunday":
              statsObj.holidays++;
              break;
            case "wfh":
              statsObj.presentDays++;
              statsObj.workingDays++;
              break;
            default:
              break;
          }
        }
      });
    }

    setCalendarData(calendar);
    setStats(statsObj);
  };

  const getDaysArray = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    const days = [];
    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysArray();

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      padding: "12px",
      marginBottom: "12px",
      width: "100%",
      maxWidth: "640px",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
      }}>
        <Calendar style={{ width: "22px", height: "22px", color: "#2563eb" }} />
        <h2 style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#1f2937",
        }}>Attendance Calendar</h2>
      </div>

      {error && (
        <div style={{
          marginBottom: "12px",
          padding: "12px",
          backgroundColor: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <AlertCircle style={{ width: "20px", height: "20px", color: "#dc2626" }} />
          <span style={{ color: "#991b1b" }}>{error}</span>
        </div>
      )}

      {loading && (
        <div style={{
          textAlign: "center",
          padding: "20px",
        }}>
          <div style={{
            display: "inline-block",
            animation: "spin 1s linear infinite",
          }}>
            <Calendar style={{ width: "32px", height: "32px", color: "#2563eb" }} />
          </div>
          <p style={{
            marginTop: "6px",
            color: "#4b5563",
          }}>Loading attendance data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Statistics Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "10px",
            marginBottom: "14px",
          }}>
            {[
              { title: "Working Days", value: Math.round(stats.workingDays * 100) / 100, style: baseStatusStyles.working },
              { title: "Paid Leave", value: stats.paidLeaveDays, style: baseStatusStyles.paidLeave },
              { title: "Unpaid Leave", value: stats.unpaidLeaveDays, style: baseStatusStyles.unpaidLeave },
              { title: "Absent Days", value: stats.absentDays, style: baseStatusStyles.absent },
            ].map((card) => (
              <div key={card.title} style={{
                border: `1px solid ${card.style.border}`,
                backgroundColor: card.style.bg,
                borderRadius: "6px",
                padding: "10px",
              }}>
                <p style={{ color: "#374151", fontWeight: 600, marginBottom: "4px", fontSize: "12px" }}>{card.title}</p>
                <p style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: card.style.fg,
                }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px",
            }}>
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#374151",
                    padding: "4px 2px",
                    fontSize: "11px",
                  }}
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />;
                }

                const fallback = mapStatusToStyle("absent");
                const dayData = calendarData[day] || {
                  status: "absent",
                  label: fallback.label,
                  bg: fallback.bg,
                  fg: fallback.fg,
                  border: fallback.border,
                };

                return (
                  <div
                    key={day}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "5px",
                      border: `1px solid ${dayData.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: dayData.bg,
                      color: dayData.fg,
                      minHeight: "34px",
                    }}
                    title={dayData.label}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "12px",
          }}>
            <h3 style={{
              fontWeight: 700,
              color: "#1f2937",
              marginBottom: "6px",
              fontSize: "13px",
            }}>Legend</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "6px",
            }}>
              {Object.entries(baseStatusStyles).map(([key, value]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "3px",
                      backgroundColor: value.bg,
                      border: `1px solid ${value.border}`,
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#4b5563" }}>{value.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              fontSize: "12px",
              borderCollapse: "collapse",
            }}>
              <thead>
                <tr style={{
                  backgroundColor: "#f3f4f6",
                  borderBottom: "1px solid #e5e7eb",
                }}>
                  <th style={{
                    padding: "8px 10px",
                    textAlign: "left",
                    color: "#111827",
                    fontWeight: 600,
                  }}>Metric</th>
                  <th style={{
                    padding: "8px 10px",
                    textAlign: "center",
                    color: "#111827",
                    fontWeight: 600,
                  }}>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{
                    padding: "8px 10px",
                    color: "#374151",
                  }}>Total Working Days</td>
                  <td style={{
                    padding: "8px 10px",
                    textAlign: "center",
                    fontWeight: "bold",
                    color: baseStatusStyles.working.fg,
                  }}>
                    {Math.round(stats.workingDays * 100) / 100}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{
                    padding: "8px 10px",
                    color: "#374151",
                  }}>Paid Leave</td>
                  <td style={{
                    padding: "8px 10px",
                    textAlign: "center",
                    fontWeight: "bold",
                    color: baseStatusStyles.paidLeave.fg,
                  }}>
                    {stats.paidLeaveDays}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{
                    padding: "8px 10px",
                    color: "#374151",
                  }}>Unpaid Leave</td>
                  <td style={{
                    padding: "8px 10px",
                    textAlign: "center",
                    fontWeight: "bold",
                    color: baseStatusStyles.unpaidLeave.fg,
                  }}>
                    {stats.unpaidLeaveDays}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{
                    padding: "8px 10px",
                    color: "#374151",
                  }}>Holidays</td>
                  <td style={{
                    padding: "8px 10px",
                    textAlign: "center",
                    fontWeight: "bold",
                    color: baseStatusStyles.holiday.fg,
                  }}>
                    {stats.holidays}
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: "8px 10px",
                    color: "#374151",
                  }}>Total Absent Days</td>
                  <td style={{
                    padding: "8px 10px",
                    textAlign: "center",
                    fontWeight: "bold",
                    color: baseStatusStyles.absent.fg,
                  }}>
                    {stats.absentDays}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
