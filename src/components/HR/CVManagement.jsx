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
  
  const handleStatusChange = async (uuid, newStatus) => {
    try {
      await CV.update(
        uuid,
        { interview_status: newStatus.toLowerCase() },
        false
      );

      setCvs((prev) =>
        prev.map((cv) =>
          cv.uuid === uuid
            ? { ...cv, interviewStatus: newStatus.toLowerCase() }
            : cv
        )
      );
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  // Helper function to get status styles based on value
  const getStatusStyles = (status) => {
    const statusValue = status?.toLowerCase() || "pending";
    
    const styleMap = {
      pending: {
        backgroundColor: "#fef3c7",
        color: "#92400e",
        borderColor: "#fbbf24",
      },
      ongoing: {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
        borderColor: "#60a5fa",
      },
      selected: {
        backgroundColor: "#d1fae5",
        color: "#065f46",
        borderColor: "#34d399",
      },
      rejected: {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        borderColor: "#f87171",
      },
    };

    return styleMap[statusValue] || styleMap.pending;
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
      <div style={{ ...styles.container, textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>
          Loading CV data...
        </p>
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
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>SL NO</th>
              <th style={styles.tableHeader}>NAME</th>
              <th style={styles.tableHeader}>JOB TITLE</th>
              <th style={styles.tableHeader}>CV</th>
              <th style={styles.tableHeader}>PLACE</th>
              <th style={styles.tableHeader}>GENDER</th>
              <th style={styles.tableHeader}>STATUS</th>
              <th style={styles.tableHeader}>PHONE</th>
              <th style={styles.tableHeader}>ACTION</th>
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
              pageItems.map((cv, idx) => {
                const statusStyles = getStatusStyles(cv.interviewStatus);
                
                return (
                  <tr key={cv.uuid} style={styles.tableRow}>
                    {/* SL NO */}
                    <td style={styles.tableCell}>{startIndex + idx + 1}</td>

                    {/* NAME */}
                    <td style={styles.tableCell}>{cv.name}</td>

                    {/* JOB TITLE */}
                    <td style={styles.tableCell}>{cv.jobTitle}</td>

                    {/* CV */}
                    <td style={styles.tableCell}>
                      <button
                        style={styles.viewCvBtn}
                        onClick={() => handleViewCVClick(cv.cvAttachmentUrl)}
                      >
                        View CV
                      </button>
                    </td>

                    {/* PLACE */}
                    <td style={styles.tableCell}>{cv.place || "N/A"}</td>

                    {/* GENDER */}
                    <td style={styles.tableCell}>{cv.gender || "N/A"}</td>

                    {/* ✅ STATUS DROPDOWN */}
                    <td style={styles.tableCell}>
                      <select
                        value={cv.interviewStatus || "pending"}
                        onChange={(e) => handleStatusChange(cv.uuid, e.target.value)}
                        style={{
                          ...styles.statusDropdown,
                          ...statusStyles,
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    {/* PHONE */}
                    <td style={styles.tableCell}>{cv.phoneNumber || "N/A"}</td>

                    {/* ACTION */}
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
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
                );
              })
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
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === totalPages ? styles.paginationBtnDisabled : {}),
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
  statusDropdown: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.2s",
    width: "100%",
    maxWidth: "120px",
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
  actionButtons: {
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
    transition: "all 0.2s",
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
    transition: "all 0.2s",
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
};