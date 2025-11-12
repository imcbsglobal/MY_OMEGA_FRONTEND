// src/pages/CVManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CV, toUi } from "../../api/cv";

export default function CVManagement() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 25;

  useEffect(() => {
    (async () => {
      try {
        const data = await CV.list();
        console.log("Fetched CV data:", data);
        setCvs(data.map(toUi));
      } catch (e) {
        console.error("Error loading CVs", e);
        setCvs([]);
        alert(e.response?.data?.detail || "Failed to load CVs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddNewClick = () => navigate("/cv-management/add");
  const handleEditClick = (cv) => navigate(`/cv-management/edit/${cv.uuid}`);
  const handleViewClick = (cv) => navigate(`/cv-management/view/${cv.uuid}`);
  const handleViewCVClick = (cvUrl) =>
    cvUrl ? window.open(cvUrl, "_blank") : alert("No CV attachment available");

  const handleDeleteClick = async (uuid) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await CV.remove(uuid);
      setCvs((prev) => prev.filter((x) => x.uuid !== uuid));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Failed to delete CV");
    }
  };

  const filtered = cvs.filter((cv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      cv.name?.toLowerCase().includes(q) ||
      cv.jobTitle?.toString()?.toLowerCase().includes(q) ||
      cv.phoneNumber?.includes(q) ||
      cv.place?.toLowerCase().includes(q) ||
      cv.district?.toLowerCase().includes(q) ||
      cv.remarks?.toLowerCase().includes(q) ||
      cv.gender?.toLowerCase().includes(q) ||
      cv.interviewStatus?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  if (loading) {
    return (
      <div
        style={{
          ...styles.container,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: "18px", color: "#6b7280" }}>
          Loading CV data...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>CV Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, job, phone, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <button onClick={handleAddNewClick} style={styles.addButton}>
            + Add New
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.thSmall}>#</th>
              <th style={styles.thName}>Name</th>
              <th style={styles.th}>Job Title</th>
              <th style={styles.th}>CV</th>
              <th style={styles.th}>Place</th>
              <th style={styles.th}>Gender</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.thRemarks}>Remarks</th>
              <th style={styles.thLarge}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan="10" style={styles.noResults}>
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "No CV records found"}
                </td>
              </tr>
            ) : (
              pageItems.map((cv, idx) => (
                <tr key={cv.uuid} style={styles.tableRow}>
                  <td style={styles.tdCenter}>{startIndex + idx + 1}</td>
                  <td style={styles.tdName}>{cv.name}</td>
                  <td style={styles.tdCenter}>{cv.jobTitle}</td>
                  <td style={styles.tdCenter}>
                    <button
                      style={styles.viewCvBtn}
                      onClick={() => handleViewCVClick(cv.cvAttachmentUrl)}
                    >
                      📄 View CV
                    </button>
                  </td>
                  <td style={styles.tdCenter}>{cv.place || "N/A"}</td>
                  <td style={styles.tdCenter}>{cv.gender}</td>
                  <td style={styles.tdCenter}>
                    <span style={styles.statusBadge}>{cv.interviewStatus}</span>
                  </td>
                  <td style={styles.tdCenter}>{cv.phoneNumber}</td>
                  <td style={styles.tdRemarks}>{cv.remarks}</td>
                  <td style={styles.tdCenter}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button onClick={() => handleViewClick(cv)} style={styles.viewBtn}>
                        View
                      </button>
                      <button onClick={() => handleEditClick(cv)} style={styles.editBtn}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cv.uuid)}
                        style={styles.deleteBtn}
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
            style={styles.paginationBtn}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                ...styles.pageNumberBtn,
                ...(pageNum === currentPage ? styles.pageNumberBtnActive : {}),
              }}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={styles.paginationBtn}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#111827" },
  headerActions: { display: "flex", alignItems: "center", gap: "12px" },
  searchContainer: { position: "relative", display: "flex", alignItems: "center" },
  searchInput: { padding: "12px 40px 12px 16px", borderRadius: "8px", border: "2px solid #e5e7eb", width: "320px", fontSize: "14px" },
  searchIcon: { position: "absolute", right: "14px", color: "#9ca3af" },
  addButton: { padding: "12px 24px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },

  // Table and Alignment
  tableContainer: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  th: { textAlign: "center", padding: "12px 8px", background: "#f3f4f6", fontWeight: "600", borderBottom: "2px solid #e5e7eb" },
  thSmall: { width: "60px", textAlign: "center", background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" },
  thName: { width: "180px", textAlign: "left", background: "#f3f4f6", borderBottom: "2px solid #e5e7eb", paddingLeft: "16px" },
  thRemarks: { width: "200px", textAlign: "left", background: "#f3f4f6", borderBottom: "2px solid #e5e7eb", paddingLeft: "16px" },
  thLarge: { width: "170px", textAlign: "center", background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" },

  tdCenter: { textAlign: "center", verticalAlign: "middle", padding: "10px 8px", borderBottom: "1px solid #e5e7eb" },
  tdName: { textAlign: "left", verticalAlign: "middle", padding: "10px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: "500" },
  tdRemarks: { textAlign: "left", verticalAlign: "middle", padding: "10px 16px", borderBottom: "1px solid #e5e7eb" },

  viewCvBtn: { padding: "6px 12px", backgroundColor: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: "6px" },
  viewBtn: { padding: "6px 12px", backgroundColor: "#d1fae5", color: "#059669", border: "1px solid #a7f3d0", borderRadius: "6px" },
  editBtn: { padding: "6px 12px", backgroundColor: "#dbeafe", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: "6px" },
  deleteBtn: { padding: "6px 12px", backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px" },

  noResults: { padding: "40px", textAlign: "center", color: "#6b7280", fontSize: "16px" },
  paginationContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", backgroundColor: "white", padding: "16px 24px", borderRadius: "12px" },
  paginationInfo: { fontSize: "14px", color: "#6b7280" },
  paginationButtons: { display: "flex", gap: "8px" },
  paginationBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "white" },
  pageNumberBtn: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "white" },
  pageNumberBtnActive: { backgroundColor: "#3b82f6", color: "white", borderColor: "#3b82f6" },
};
