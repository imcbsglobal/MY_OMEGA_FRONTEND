import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Clock } from "lucide-react";
import api from "../../api/client";

const defaultMonthISO = () => new Date().toISOString().slice(0, 7);

export default function TotalSummary() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthISO());
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPresent: 0,
    totalHalfDay: 0,
    totalLeave: 0,
    totalAbsent: 0,
    avgAttendance: 0
  });

  useEffect(() => {
    fetchSummaryData();
  }, [selectedMonth]);

  async function fetchSummaryData() {
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
          fullDays: 0,
          halfDays: 0,
          leaves: 0,
          absent: 0,
          totalDays: 0,
          attendancePercentage: 0
        });
      });

      const daysInMonth = new Date(year, month, 0).getDate();
      const sundaysCount = countSundays(year, month);
      const workingDays = daysInMonth - sundaysCount;

      attendanceList.forEach((record) => {
        const empId = record.user || record.employee_id || record.user_id || record.user?.id || record.employee?.id;
        if (empId && empMap.has(empId)) {
          const emp = empMap.get(empId);
          const status = (record.status || "").toString().toLowerCase();
          
          if (status === "full" || status === "present") {
            emp.fullDays++;
          } else if (status === "half") {
            emp.halfDays++;
          } else if (status === "leave") {
            emp.leaves++;
          }
        }
      });

      let totalPresent = 0;
      let totalHalfDay = 0;
      let totalLeave = 0;
      let totalAbsent = 0;

      empMap.forEach((emp) => {
        emp.totalDays = emp.fullDays + emp.halfDays * 0.5;
        emp.absent = workingDays - emp.fullDays - emp.halfDays - emp.leaves;
        emp.attendancePercentage = workingDays > 0 ? ((emp.totalDays / workingDays) * 100).toFixed(1) : 0;
        
        totalPresent += emp.fullDays;
        totalHalfDay += emp.halfDays;
        totalLeave += emp.leaves;
        totalAbsent += emp.absent;
      });

      const sortedSummary = Array.from(empMap.values()).sort((a, b) => 
        (a.name || "").localeCompare(b.name || "")
      );

      setSummaryData(sortedSummary);
      setStats({
        totalEmployees: sortedSummary.length,
        totalPresent,
        totalHalfDay,
        totalLeave,
        totalAbsent,
        avgAttendance: sortedSummary.length > 0 
          ? (sortedSummary.reduce((sum, emp) => sum + parseFloat(emp.attendancePercentage), 0) / sortedSummary.length).toFixed(1)
          : 0
      });

    } catch (err) {
      console.error("Failed to fetch summary data:", err);
      alert("Failed to load summary data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function countSundays(year, month) {
    let count = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      if (new Date(year, month - 1, day).getDay() === 0) {
        count++;
      }
    }
    return count;
  }

  const getMonthName = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div style={{...styles.statCard, borderLeft: `4px solid ${color}`}}>
      <div style={styles.statIcon}>
        <Icon size={24} color={color} />
      </div>
      <div style={styles.statContent}>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statValue}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={styles.pageTitle}>Total Monthly Summary</h1>
        </div>
        <div style={styles.monthSelector}>
          <Calendar size={18} color="#6b7280" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthInput}
          />
        </div>
      </div>

      <div style={styles.monthDisplay}>
        <h2 style={styles.monthTitle}>{getMonthName(selectedMonth)}</h2>
      </div>

    

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Employee-wise Summary</h3>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>No</th>
                <th style={{...styles.th, textAlign: 'left'}}>Employee Name</th>
                <th style={styles.th}>Full Days</th>
                <th style={styles.th}>Half Days</th>
                <th style={styles.th}>Leaves</th>
                <th style={styles.th}>Absent</th>
                <th style={styles.th}>Total Present Days</th>
                <th style={styles.th}>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={styles.noData}>
                    Loading summary data...
                  </td>
                </tr>
              ) : summaryData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.noData}>
                    No data available for selected month
                  </td>
                </tr>
              ) : (
                summaryData.map((emp, index) => (
                  <tr key={emp.id} style={styles.tableRow}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={{...styles.td, textAlign: 'left', fontWeight: 500}}>{emp.name}</td>
                    <td style={styles.td}>{emp.fullDays}</td>
                    <td style={styles.td}>{emp.halfDays}</td>
                    <td style={styles.td}>{emp.leaves}</td>
                    <td style={styles.td}>{emp.absent}</td>
                    <td style={styles.td}>{emp.totalDays}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.percentageBadge,
                        backgroundColor: parseFloat(emp.attendancePercentage) >= 90 
                          ? '#dcfce7' 
                          : parseFloat(emp.attendancePercentage) >= 75 
                          ? '#fef3c7' 
                          : '#fee2e2',
                        color: parseFloat(emp.attendancePercentage) >= 90 
                          ? '#15803d' 
                          : parseFloat(emp.attendancePercentage) >= 75 
                          ? '#92400e' 
                          : '#991b1b'
                      }}>
                        {emp.attendancePercentage}%
                      </span>
                    </td>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    margin: 0,
  },
  monthSelector: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  monthInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  monthDisplay: {
    textAlign: "center",
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  monthTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#374151",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  statIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
  },
  tableContainer: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tableTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
  },
  th: {
    padding: "12px 16px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#000000",
    borderBottom: "2px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.15s",
  },
  td: {
    padding: "12px 16px",
    fontSize: "13px",
    color: "#374151",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  percentageBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  noData: {
    padding: "40px",
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
  },
};