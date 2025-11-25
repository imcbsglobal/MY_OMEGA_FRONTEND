import { useEffect, useState } from "react";
import api from "../../api/client";

export default function BreakList() {
  const [breakData, setBreakData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBreakList = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hr/break-list/?month=11&year=2025"); 
      setBreakData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load break list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBreakList();
  }, []);

  return (
    <div style={styles.container}>
      {/* ---------------- HEADER ---------------- */}
      <div style={styles.header}>
        <h2 style={styles.title}>Break List</h2>
      </div>

      {/* ---------------- TABLE ---------------- */}
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
            {breakData.map((row, i) => (
              <tr key={row.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{i + 1}</td>
                <td style={styles.tableCell}>{row.user_name}</td>
                <td style={styles.tableCell}>{row.break_in}</td>
                <td style={styles.tableCell}>{row.break_out || "-"}</td>
                <td style={styles.tableCell}>{row.total_break || "-"}</td>
                <td style={styles.tableCell}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && breakData.length === 0 && (
          <div style={styles.noResults}>No Breaks Found</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- STYLES (EXACT SAME AS LEAVELIST) ---------------- */
const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },

  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    padding: "8px 0",
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
  },

  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    height: "60px",
  },

  tableCell: {
    padding: "14px 16px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#334155",
  },

  noResults: {
    padding: "35px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};
