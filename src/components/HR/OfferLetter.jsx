// OfferLetter.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import api from "../../api/client";
import jsPDF from "jspdf";

export default function OfferLetter() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

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
    if (!window.confirm("Are you sure you want to delete this record?")) return;
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
    (it.phone || "").toLowerCase().includes(q)
  );
});


  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [search]);

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>
          Loading offer letter data...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Offer Letter Management</h2>

        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, position, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>

          <button
            style={styles.addButton}
            onClick={() => navigate("/offer-letter/add")}
          >
            + Add New
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>SL NO</th>
              <th style={styles.tableHeader}>NAME</th>
              <th style={styles.tableHeader}>POSITION</th>
              <th style={styles.tableHeader}>CV</th>
              <th style={styles.tableHeader}>DEPARTMENT</th>
              <th style={styles.tableHeader}>SALARY</th>
              <th style={styles.tableHeader}>PHONE</th>
              <th style={styles.tableHeader}>GENERATE</th>
              <th
                style={{
                  ...styles.tableHeader,
                  textAlign: "center",
                  width: "120px",
                }}
              >
                ACTION
              </th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan="9" style={styles.noResults}>
                  {search
                    ? `No results for "${search}"`
                    : "No offer letter records found"}
                </td>
              </tr>
            ) : (
              pageItems.map((item, index) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{startIndex + index + 1}</td>
                  <td style={styles.tableCell}>{item.name}</td>
                  <td style={styles.tableCell}>{item.position}</td>
                  <td style={styles.tableCell}>
                    {item.cv ? (
                      <button
                        style={styles.viewCvBtn}
                        onClick={() => window.open(item.cv, "_blank")}
                      >
                        View CV
                      </button>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>N/A</span>
                    )}
                  </td>
                  <td style={styles.tableCell}>{item.department}</td>
                  <td style={styles.tableCell}>{item.salary}</td>
                  <td style={styles.tableCell}>{item.phone || "N/A"}</td>
                  <td style={styles.tableCell}>
                    <button
                      style={styles.generateBtn}
                      onClick={() => generateOfferPDF(item)}
                    >
                      Generate
                    </button>
                  </td>

                  <td style={styles.actionCell}>
                    <div style={styles.iconActions}>
                      <button
                        title="View"
                        onClick={() => navigate(`/offer-letter/view/${item.id}`)}
                        style={styles.iconBtn}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title="Edit"
                        onClick={() => navigate(`/offer-letter/edit/${item.id}`)}
                        style={styles.iconBtn}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        title="Delete"
                        onClick={() => handleDelete(item.id)}
                        style={{ ...styles.iconBtn, color: "#dc2626" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.paginationContainer}>
        <span style={styles.paginationInfo}>
          Showing {pageItems.length ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + itemsPerPage, filtered.length)} of{" "}
          {filtered.length} entries
        </span>
        <div style={styles.paginationButtons}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === 1 ? styles.paginationBtnDisabled : {}),
            }}
          >
            Prev
          </button>
          <div style={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    ...styles.pageNumberBtn,
                    ...(pageNum === currentPage
                      ? styles.pageNumberBtnActive
                      : {}),
                  }}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === totalPages
                ? styles.paginationBtnDisabled
                : {}),
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

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
    width: "320px",
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
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    backgroundColor: "#f3f4f6",
  },
  tableHeader: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  tableCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
  },
  actionCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    textAlign: "center",
    width: "120px",
  },
  viewCvBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  generateBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#2563eb",
    backgroundColor: "#dbeafe",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    padding: "16px 24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  paginationInfo: {
    fontSize: "14px",
    color: "#6b7280",
  },
  paginationButtons: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  paginationBtn: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  paginationBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  pageNumberBtn: {
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "40px",
  },
  pageNumberBtnActive: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
  iconActions: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};