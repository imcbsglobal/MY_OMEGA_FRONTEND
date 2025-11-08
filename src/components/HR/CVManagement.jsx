import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CVManagement() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 25;

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = () => {
    try {
      const storedData = localStorage.getItem('cv-management-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        setCvs(data);
      } else {
        const initialData = [
          {
            id: 1,
            name: "John Doe",
            jobTitle: "Software Engineer",
            cvAttachmentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            cvFileName: "john_cv.pdf",
            place: "Kochi",
            district: "Ernakulam",
            gender: "Male",
            interviewStatus: "Pending",
            phoneNumber: "9876543210",
            remarks: "Strong candidate with 5 years experience",
            address: "123 Main Street",
            education: "B.Tech Computer Science",
            experience: "5 years",
            dob: "1995-06-15",
            cvSource: "DIRECT",
            createdUser: "myomega@gmail.com",
            createdDate: "20/10/2025, 10:30 AM",
          },
          {
            id: 2,
            name: "Jane Smith",
            jobTitle: "Product Manager",
            cvAttachmentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            cvFileName: "jane_cv.pdf",
            place: "Trivandrum",
            district: "Thiruvananthapuram",
            gender: "Female",
            interviewStatus: "Completed",
            phoneNumber: "9123456780",
            remarks: "Excellent communication skills",
            address: "456 Park Avenue",
            education: "MBA",
            experience: "7 years",
            dob: "1992-03-22",
            cvSource: "REFERRAL",
            createdUser: "myomega@gmail.com",
            createdDate: "22/10/2025, 02:15 PM",
          },
        ];
        localStorage.setItem('cv-management-data', JSON.stringify(initialData));
        setCvs(initialData);
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
      setCvs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    navigate('/cv-management/add');
  };

  const handleEditClick = (cv) => {
    navigate(`/cv-management/edit/${cv.id}`);
  };

  const handleViewClick = (cv) => {
    navigate(`/cv-management/view/${cv.id}`);
  };

  const handleViewCVClick = (cvUrl, cvFileName) => {
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    } else {
      alert("No CV attachment available");
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const storedData = localStorage.getItem('cv-management-data');
        if (storedData) {
          const data = JSON.parse(storedData);
          const updatedCvs = data.filter(cv => cv.id !== id);
          localStorage.setItem('cv-management-data', JSON.stringify(updatedCvs));
          setCvs(updatedCvs);
        }
      } catch (error) {
        console.error('Error deleting CV:', error);
        alert('Failed to delete. Please try again.');
      }
    }
  };

  const filteredCvs = cvs.filter(cv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      cv.name?.toLowerCase().includes(query) ||
      cv.jobTitle?.toLowerCase().includes(query) ||
      cv.phoneNumber?.includes(query) ||
      cv.place?.toLowerCase().includes(query) ||
      cv.district?.toLowerCase().includes(query) ||
      cv.remarks?.toLowerCase().includes(query) ||
      cv.gender?.toLowerCase().includes(query) ||
      cv.interviewStatus?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCvs = filteredCvs.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      Pending: { backgroundColor: "#fef3c7", color: "#92400e" },
      Scheduled: { backgroundColor: "#dbeafe", color: "#1e40af" },
      Completed: { backgroundColor: "#d1fae5", color: "#065f46" },
      Rejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
    };
    return statusStyles[status] || { backgroundColor: "#f3f4f6", color: "#374151" };
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading CV data...</div>
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
              <th style={styles.tableHeader}>Sl NO</th>
              <th style={styles.tableHeader}>NAME</th>
              <th style={styles.tableHeader}>JOB TITLE</th>
              <th style={styles.tableHeader}>CV ATTACHMENT</th>
              <th style={styles.tableHeader}>LOCATION</th>
              <th style={styles.tableHeader}>GENDER</th>
              <th style={styles.tableHeader}>INTERVIEW STATUS</th>
              <th style={styles.tableHeader}>PHONE NUMBER</th>
              <th style={styles.tableHeader}>REMARKS</th>
              <th style={styles.tableHeader}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentCvs.length === 0 ? (
              <tr>
                <td colSpan="10" style={styles.noResults}>
                  {searchQuery ? `No results found for "${searchQuery}"` : "No CV records available"}
                </td>
              </tr>
            ) : (
              currentCvs.map((cv, index) => (
                <tr key={cv.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{startIndex + index + 1}</td>
                  <td style={styles.tableCell}>{cv.name}</td>
                  <td style={styles.tableCell}>{cv.jobTitle}</td>
                  <td style={styles.tableCell}>
                    <button 
                      style={styles.viewCvBtn}
                      onClick={() => handleViewCVClick(cv.cvAttachmentUrl, cv.cvFileName)}
                    >
                      📄 View CV
                    </button>
                  </td>
                  <td style={styles.tableCell}>{cv.place || "N/A"}</td>
                  <td style={styles.tableCell}>{cv.gender}</td>
                  <td style={styles.tableCell}>
                    <span style={{...styles.statusBadge, ...getStatusStyle(cv.interviewStatus)}}>
                      {cv.interviewStatus || "N/A"}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{cv.phoneNumber}</td>
                  <td style={styles.tableCell}>{cv.remarks}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button onClick={() => handleViewClick(cv)} style={styles.viewBtn}>View</button>
                      <button onClick={() => handleEditClick(cv)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDeleteClick(cv.id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.paginationContainer}>
        <div style={styles.paginationInfo}>
          Showing {filteredCvs.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredCvs.length)} of {filteredCvs.length} entries
          {searchQuery && <span style={styles.searchIndicator}> (filtered from {cvs.length} total)</span>}
        </div>
        <div style={styles.paginationButtons}>
          <button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
            style={{...styles.paginationBtn, ...(currentPage === 1 ? styles.paginationBtnDisabled : {})}}
          >
            Previous
          </button>
          
          <div style={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    style={{
                      ...styles.pageNumberBtn,
                      ...(pageNum === currentPage ? styles.pageNumberBtnActive : {})
                    }}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} style={styles.pageEllipsis}>...</span>;
              }
              return null;
            })}
          </div>

          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            style={{...styles.paginationBtn, ...(currentPage === totalPages ? styles.paginationBtnDisabled : {})}}
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
  searchIndicator: {
    color: "#6b7280",
    fontStyle: "italic",
    fontSize: "13px",
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
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
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
  pageEllipsis: {
    padding: "8px 4px",
    color: "#9ca3af",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};