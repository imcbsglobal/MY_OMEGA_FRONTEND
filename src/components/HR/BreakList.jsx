import { useEffect, useState } from "react";
import api from "../../api/client";

export default function BreakList() {
  const [breakData, setBreakData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("2025-11");

  const loadBreakList = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/hr/attendance/today_breaks/`);

      const data = Array.isArray(res.data?.breaks)
        ? res.data.breaks
        : [];

      setBreakData(data);

    } catch (err) {
      console.error(err);
      alert("Failed to load break list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBreakList();
  }, [selectedMonth]);

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return "-";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>Break Management</h2>
        <div style={styles.headerActions}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthInput}
          />
        </div>
      </div>

      {/* ONLY BREAK DETAILS TABLE */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHeaderRow}>
            <tr>
              <th style={styles.tableHeader}>SL</th>
              <th style={styles.tableHeader}>Employee</th>
              <th style={styles.tableHeader}>Break In</th>
              <th style={styles.tableHeader}>Break Out</th>
              <th style={styles.tableHeader}>Total Break</th>
              <th style={styles.tableHeader}>Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={styles.noResults}>Loading...</td>
              </tr>
            ) : breakData.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.noResults}>No Breaks Found</td>
              </tr>
            ) : (
              breakData.map((row, i) => {
                const breakIn = row.break_start;
                const breakOut = row.break_end;

                let totalMinutes = "-";
                if (breakOut) {
                  totalMinutes =
                    (new Date(breakOut) - new Date(breakIn)) / 60000;
                }

                return (
                  <tr key={row.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{i + 1}</td>
                    <td style={styles.tableCell}>{row.employee_name || "-"}</td>
                    <td style={styles.tableCell}>{formatTime(breakIn)}</td>
                    <td style={styles.tableCell}>
                      {breakOut ? formatTime(breakOut) : "-"}
                    </td>
                    <td style={styles.tableCell}>
                      {breakOut ? formatDuration(totalMinutes) : "-"}
                    </td>
                    <td style={styles.tableCell}>
                      {breakIn
                        ? new Date(breakIn).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* SAME STYLES — NO CHANGES */
const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8fafc",
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
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
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

  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    padding: "8px 0",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHeaderRow: {
    backgroundColor: "#f1f5f9",
  },

  tableHeader: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    borderBottom: "2px solid #e2e8f0",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    height: "60px",
    transition: "background-color 0.2s",
  },

  tableCell: {
    padding: "14px 16px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#334155",
    whiteSpace: "nowrap",
  },

  noResults: {
    padding: "35px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};
8