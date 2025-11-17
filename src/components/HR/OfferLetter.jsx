// OfferLetter.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import jsPDF from "jspdf";

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

  const generateOfferPDF = (item) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Job Offer Letter", 20, 20);

    doc.setFontSize(12);
    doc.text(`Candidate Name: ${item.name}`, 20, 40);
    doc.text(`Position: ${item.position}`, 20, 50);
    doc.text(`Department: ${item.department}`, 20, 60);
    doc.text(`Salary: ${item.salary}`, 20, 70);
    doc.text(`Joining Date: ${item.joining}`, 20, 80);
    doc.text(`Notice Period: ${item.notice} days`, 20, 90);
    doc.text("-------------------------------------------------", 20, 100);

    doc.text("Offer Letter Content:", 20, 120);

    const splitText = doc.splitTextToSize(item.body || "No content provided", 170);
    doc.text(splitText, 20, 130);

    doc.save(`${item.name}_OfferLetter.pdf`);
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
              <th style={styles.th}>#</th>
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
                      onClick={() => generateOfferPDF(item)}
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
    padding: "30px 40px",
    background: "#f3f4f6",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 24,
    alignItems: "center",
  },
  title: { fontSize: 26, fontWeight: 700 },
  headerRight: { display: "flex", gap: 12 },
  search: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  addButton: {
    padding: "10px 18px",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  tableCard: {
    background: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    background: "#f9fafb",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 13,
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
  },
  noData: { padding: 30, textAlign: "center", color: "#777" },
  cvBtn: {
    padding: "6px 10px",
    background: "#eef2ff",
    borderRadius: 6,
    border: "1px solid #c7d2fe",
    cursor: "pointer",
    color: "#1d4ed8",
  },
  generateBtn: {
    padding: "6px 12px",
    background: "#dbeafe",
    borderRadius: 6,
    border: "1px solid #bfdbfe",
    cursor: "pointer",
    color: "#2563eb",
    fontWeight: 600,
  },
  actionRow: { display: "flex", gap: 8 },
  viewBtn: {
    padding: "6px 12px",
    background: "#d1fae5",
    border: "1px solid #a7f3d0",
    color: "#047857",
    borderRadius: 6,
    cursor: "pointer",
  },
  editBtn: {
    padding: "6px 12px",
    background: "#e0e7ff",
    border: "1px solid #c7d2fe",
    color: "#1d4ed8",
    borderRadius: 6,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 12px",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 6,
    cursor: "pointer",
  },
  footerText: {
    marginTop: 12,
    fontSize: 13,
    color: "#6b7280",
  },
};
