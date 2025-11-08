import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ExperienceCertificateList() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 25;

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = () => {
    try {
      const storedData = localStorage.getItem('experience-certificate-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        setCertificates(data);
      } else {
        const initialData = [
          {
            id: 1,
            name: "John Doe",
            address: "123 Main Street, Kochi, Kerala 682001",
            phoneNumber: "9876543210",
            jobTitle: "Software Engineer",
            joiningDate: "2022-01-15",
            endDate: "2024-12-31",
            certificateUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            certificateFileName: "john_experience_cert.pdf",
            approved: "Approved",
            addedBy: "myomega@gmail.com",
            approvedBy: "admin@omega.com",
            createdDate: "21/10/2025, 09:45 AM",
          },
          {
            id: 2,
            name: "Jane Smith",
            address: "456 Park Avenue, Trivandrum, Kerala 695001",
            phoneNumber: "9123456780",
            jobTitle: "Product Manager",
            joiningDate: "2021-03-20",
            endDate: "2024-10-15",
            certificateUrl: "",
            certificateFileName: "",
            approved: "Pending",
            addedBy: "myomega@gmail.com",
            approvedBy: "",
            createdDate: "23/10/2025, 03:20 PM",
          },
        ];
        localStorage.setItem('experience-certificate-data', JSON.stringify(initialData));
        setCertificates(initialData);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCertificates = (data) => {
    try {
      localStorage.setItem('experience-certificate-data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving certificates:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleAddNewClick = () => {
    navigate('/experience-certificate/add');
  };

  const handleEditClick = (certificate) => {
    navigate(`/experience-certificate/edit/${certificate.id}`);
  };

  const handleViewClick = (certificate) => {
    navigate(`/experience-certificate/view/${certificate.id}`);
  };

  const handleGenerateCertificate = (id) => {
    const certificate = certificates.find(cert => cert.id === id);
    if (!certificate) return;

    // Generate a dummy certificate URL (in real app, this would call an API)
    const generatedUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const generatedFileName = `${certificate.name.replace(/\s+/g, '_')}_experience_certificate.pdf`;

    const updatedCertificates = certificates.map(cert => 
      cert.id === id 
        ? { ...cert, certificateUrl: generatedUrl, certificateFileName: generatedFileName }
        : cert
    );
    
    setCertificates(updatedCertificates);
    saveCertificates(updatedCertificates);
    alert("Certificate generated successfully!");
  };

  const handleViewCertificate = (certUrl, certFileName) => {
    if (certUrl) {
      window.open(certUrl, "_blank");
    } else {
      alert("Certificate not generated yet. Please generate the certificate first.");
    }
  };

  const handleApprove = (id) => {
    if (window.confirm("Are you sure you want to approve this certificate?")) {
      const updatedCertificates = certificates.map(cert => 
        cert.id === id 
          ? { ...cert, approved: "Approved", approvedBy: "admin@omega.com" }
          : cert
      );
      setCertificates(updatedCertificates);
      saveCertificates(updatedCertificates);
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      const updatedCertificates = certificates.filter(certificate => certificate.id !== id);
      setCertificates(updatedCertificates);
      saveCertificates(updatedCertificates);
    }
  };

  const getApprovalStyle = (status) => {
    const statusStyles = {
      Pending: { backgroundColor: "#fef3c7", color: "#92400e" },
      Approved: { backgroundColor: "#d1fae5", color: "#065f46" },
      Rejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
    };
    return statusStyles[status] || { backgroundColor: "#f3f4f6", color: "#374151" };
  };

  const filteredCertificates = certificates.filter(certificate => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      certificate.name?.toLowerCase().includes(query) ||
      certificate.address?.toLowerCase().includes(query) ||
      certificate.phoneNumber?.includes(query) ||
      certificate.jobTitle?.toLowerCase().includes(query) ||
      certificate.approved?.toLowerCase().includes(query) ||
      certificate.addedBy?.toLowerCase().includes(query) ||
      certificate.approvedBy?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCertificates = filteredCertificates.slice(startIndex, endIndex);

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

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading certificate data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Experience Certificate Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, phone, job title..."
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
              <th style={styles.tableHeader}>ADDRESS</th>
              <th style={styles.tableHeader}>PHONE NUMBER</th>
              <th style={styles.tableHeader}>JOB TITLE</th>
              <th style={styles.tableHeader}>JOINING DATE</th>
              <th style={styles.tableHeader}>END DATE</th>
              <th style={styles.tableHeader}>CERTIFICATE</th>
              <th style={styles.tableHeader}>APPROVE</th>
              <th style={styles.tableHeader}>ADDED BY</th>
              <th style={styles.tableHeader}>APPROVED BY</th>
              <th style={styles.tableHeader}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentCertificates.length === 0 ? (
              <tr>
                <td colSpan="12" style={styles.noResults}>
                  {searchQuery ? `No results found for "${searchQuery}"` : "No certificate records available"}
                </td>
              </tr>
            ) : (
              currentCertificates.map((certificate, index) => (
                <tr key={certificate.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{startIndex + index + 1}</td>
                  <td style={styles.tableCell}>{certificate.name}</td>
                  <td style={styles.tableCell}>{certificate.address || "N/A"}</td>
                  <td style={styles.tableCell}>{certificate.phoneNumber || "N/A"}</td>
                  <td style={styles.tableCell}>{certificate.jobTitle}</td>
                  <td style={styles.tableCell}>{certificate.joiningDate || "N/A"}</td>
                  <td style={styles.tableCell}>{certificate.endDate || "N/A"}</td>
                  <td style={styles.tableCell}>
                    <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                      <button 
                        style={styles.generateBtn}
                        onClick={() => handleGenerateCertificate(certificate.id)}
                      >
                        🔄 Generate
                      </button>
                      {certificate.certificateUrl && (
                        <button 
                          style={styles.viewCertBtn}
                          onClick={() => handleViewCertificate(certificate.certificateUrl, certificate.certificateFileName)}
                        >
                          📄 View
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{...styles.statusBadge, ...getApprovalStyle(certificate.approved)}}>
                      {certificate.approved || "N/A"}
                    </span>
                    {certificate.approved === "Pending" && (
                      <button 
                        style={styles.approveBtn}
                        onClick={() => handleApprove(certificate.id)}
                      >
                        ✓ Approve
                      </button>
                    )}
                  </td>
                  <td style={styles.tableCell}>{certificate.addedBy || "N/A"}</td>
                  <td style={styles.tableCell}>{certificate.approvedBy || "N/A"}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button onClick={() => handleViewClick(certificate)} style={styles.viewBtn}>View</button>
                      <button onClick={() => handleEditClick(certificate)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDeleteClick(certificate.id)} style={styles.deleteBtn}>Delete</button>
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
          Showing {filteredCertificates.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredCertificates.length)} of {filteredCertificates.length} entries
          {searchQuery && <span style={styles.searchIndicator}> (filtered from {certificates.length} total)</span>}
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
    marginBottom: "4px",
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
  viewCertBtn: {
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
  approveBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#059669",
    backgroundColor: "#d1fae5",
    border: "1px solid #a7f3d0",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "4px",
    display: "block",
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