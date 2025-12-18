// OfferLetter.jsx - UPDATED
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function OfferLetter() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/offer-letter/");
      const data = res?.data?.data || [];

      const mapped = data.map((it) => ({
        id: it.id,
        name: it.candidate_name,
        position: it.position,
        department: it.department,
        salary: it.salary,
        phone: it.candidate_phone,
        status: it.candidate_status,
        pdf: it.pdf_file,
        cv: it.candidate_cv,
        body: it.body,
        joining: it.joining_data,
        notice: it.notice_period,
      }));

      setItems(mapped);
    } catch (err) {
      console.error("Error loading offer letters:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to the view page which has the professional template
  const handleGenerate = (id) => {
    navigate(`/offer-letter/view/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer letter?")) return;
    try {
      await api.delete(`/offer-letter/${id}/`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const filtered = items.filter((it) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (it.name || "").toLowerCase().includes(q) ||
      (it.position || "").toLowerCase().includes(q) ||
      (it.department || "").toLowerCase().includes(q) ||
      (it.phone || "").toLowerCase().includes(q) ||
      (it.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Offer Letter Management</h2>

        <div style={styles.headerRight}>
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />

          <button
            style={styles.addButton}
            onClick={() => navigate("/offer-letter/add")}
          >
            + Add New
          </button>
        </div>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>SL NO</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Position</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Salary</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>CV</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Generate</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={styles.noData}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="10" style={styles.noData}>No records found</td></tr>
            ) : (
              filtered.map((item, index) => (
                <tr key={item.id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.position}</td>
                  <td style={styles.td}>{item.department}</td>
                  <td style={styles.td}>{item.salary}</td>
                  <td style={styles.td}>{item.phone}</td>
                  <td style={styles.td}>
                    {item.cv ? (
                      <button
                        style={styles.cvBtn}
                        onClick={() => window.open(item.cv, "_blank")}
                      >
                        View CV
                      </button>
                    ) : (
                      <span style={{ color: "#aaa" }}>N/A</span>
                    )}
                  </td>

                  <td style={styles.td}>{item.status}</td>

                  <td style={styles.td}>
                    <button
                      style={styles.generateBtn}
                      onClick={() => handleGenerate(item.id)}
                      title="Generate Professional Offer Letter"
                    >
                      Generate
                    </button>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => navigate(`/offer-letter/view/${item.id}`)}
                      >
                        View
                      </button>

                      <button
                        style={styles.editBtn}
                        onClick={() => navigate(`/offer-letter/edit/${item.id}`)}
                      >
                        Edit
                      </button>

                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.footerText}>
        Showing {filtered.length} of {items.length}
      </div>
    </div>
  );
}

const styles = {
  page: {
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

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  search: {
    padding: "12px 40px 12px 16px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    width: "320px",
    transition: "all 0.3s",
    fontWeight: "500",
    color: "#374151",
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

  tableCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    backgroundColor: "#f3f4f6",
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
  },

  td: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
  },

  noData: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },

  cvBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
  },

  generateBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#7c3aed",
    backgroundColor: "#f3e8ff",
    border: "1px solid #d8b4fe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  actionRow: {
    display: "flex",
    gap: "6px",
  },

  viewBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#059669",
    backgroundColor: "#d1fae5",
    border: "1px solid #a7f3d0",
    borderRadius: "6px",
    cursor: "pointer",
  },

  editBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#dbeafe",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
  },

  footerText: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#6b7280",
  },
};