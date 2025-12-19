import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

// Certificate Modal Component
function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Download functionality will be implemented with backend integration");
  };

  const numberToWords = (num) => {
    const amount = parseFloat(num);

    if (amount === 50000) return "Fifty Thousand";
    if (amount === 65000) return "Sixty Five Thousand";
    if (amount === 52000) return "Fifty Two Thousand";
    if (amount === 55000) return "Fifty Five Thousand";
    if (amount === 60000) return "Sixty Thousand";
    if (amount === 70000) return "Seventy Thousand";
    if (amount === 75000) return "Seventy Five Thousand";
    if (amount === 80000) return "Eighty Thousand";

    return amount.toFixed(0);
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.modalHeader} className="no-print">
          <h2 style={modalStyles.modalTitle}>Salary Certificate</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={modalStyles.certificateContainer}>
          <div style={modalStyles.certificateBorder}>
            {/* Header with Centered Logo */}
            <div style={modalStyles.certificateHeader}>
              <div style={modalStyles.logoSection}>
                <img 
                  src="/assets/omega-logo.png" 
                  alt="Omega Logo" 
                  style={modalStyles.headerLogo}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{...modalStyles.logoFallback, display: 'none'}}>
                  <span style={modalStyles.omegaFallbackText}>OMEGA</span>
                </div>
              </div>
            </div>

            {/* Certificate Title */}
            <div style={modalStyles.titleSection}>
              <h1 style={modalStyles.certificateTitle}>Salary Certificate</h1>
              <div style={modalStyles.titleUnderline}></div>
            </div>

            {/* Date and Subtitle */}
            <div style={modalStyles.metaSection}>
              <p style={modalStyles.subtitle}>[Type the document subtitle]</p>
              <p style={modalStyles.dateText}>[Pick the date]</p>
            </div>

            {/* Certificate Body */}
            <div style={modalStyles.certificateBody}>
              <p style={modalStyles.bodyText}>
                This is to certify that <strong style={modalStyles.highlight}>Mr./Miss/Mrs. {certificate.emp_name || "[Name of Employee]"}</strong> (Employee #) is working with our esteem organization/company under the title of <strong style={modalStyles.highlight}>{certificate.emp_designation || "[Title of employee]"}</strong> since <strong style={modalStyles.highlight}>{certificate.emp_joining_date || "[Date of inception of job]"}</strong>. We found this gentleman fully committed to his/her job and totally sincere toward this organization/company.
              </p>

              <p style={modalStyles.bodyText}>
                The current monthly salary of <strong style={modalStyles.highlight}>{certificate.emp_name || "[Employee Name]"}</strong> is <strong style={modalStyles.highlight}>₹{certificate.salary || "[Amount]"}</strong> (Rupees {numberToWords(certificate.salary)} only).
              </p>

              <p style={modalStyles.bodyText}>
                We are issuing this letter on the specific request of our employee without accepting any liability on behalf of this letter or part of this letter on our organization/company.
              </p>
            </div>

            {/* Signature Section */}
            <div style={modalStyles.signatureSection}>
              <p style={modalStyles.signatureLabel}>Name: {certificate.generated_by_name || "[Authorized Person Name]"}</p>
              <p style={modalStyles.signatureLabel}>Title: [Designation]</p>
              <p style={modalStyles.signatureLabel}>Signature: _______________</p>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div style={modalStyles.bottomActions} className="no-print">
            <button onClick={handlePrint} style={modalStyles.bottomPrintButton}>
              🖨️ Print Certificate
            </button>
            {/* <button onClick={handleDownload} style={modalStyles.bottomDownloadButton}>
              ⬇️ Download PDF
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SalaryCertificate() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/certificate/salary-certificates/");
      setCertificates(res?.data?.data || []);
    } catch (err) {
      console.error("Load error:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/certificate/salary-certificates/${id}/`);
      setCertificates((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleEdit = (id) => navigate(`/salary-certificate/edit/${id}`);

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const filtered = certificates.filter((c) =>
    c.emp_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const rows = filtered.slice(start, end);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>
          Loading salary certificates...
        </p>
      </div>
    );
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h2 style={S.title}>Salary Certificate Management</h2>

        <div style={S.headerActions}>
          <div style={S.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={S.searchInput}
            />
            <span style={S.searchIcon}>🔍</span>
          </div>

        <button
  onClick={() => navigate("/salary-certificate/add")}
  style={S.addButton}
>
  + Add New
</button>
        </div>
      </div>

      <div style={S.tableContainer}>
        <table style={S.table}>
          <thead>
            <tr style={S.tableHeaderRow}>
              <th style={S.tableHeader}>SL NO</th>
              <th style={S.tableHeader}>NAME</th>
              <th style={S.tableHeader}>JOB TITLE</th>
              <th style={S.tableHeader}>JOINING DATE</th>
              <th style={S.tableHeader}>SALARY</th>
              <th style={S.tableHeader}>ISSUED DATE</th>
              <th style={S.tableHeader}>CERTIFICATE</th>
              <th style={S.tableHeader}>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="8" style={S.noResults}>
                  No results found
                </td>
              </tr>
            ) : (
              rows.map((item, idx) => (
                <tr key={item.id} style={S.tableRow}>
                  <td style={S.tableCell}>{start + idx + 1}</td>
                  <td style={S.tableCell}>{item.emp_name}</td>
                  <td style={S.tableCell}>{item.emp_designation}</td>
                  <td style={S.tableCell}>{item.emp_joining_date}</td>
                  <td style={S.tableCell}>₹{item.salary}</td>
                  <td style={S.tableCell}>{item.issued_date}</td>

                  <td style={S.tableCell}>
                    <button
                      style={S.viewCvBtn}
                      onClick={() => handleViewCertificate(item)}
                    >
                      View
                    </button>
                  </td>

                  <td style={S.tableCell}>
                    <div style={S.actionButtons}>
                      <button
                        style={S.editBtn}
                        onClick={() => handleEdit(item.id)}
                      >
                        Edit
                      </button>
                      <button
                        style={S.deleteBtn}
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

      <div style={S.paginationContainer}>
        <span style={S.paginationInfo}>
          Showing {rows.length ? start + 1 : 0} to {Math.min(end, filtered.length)} of{" "}
          {filtered.length} entries
        </span>

        <div style={S.paginationButtons}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...S.paginationBtn,
              ...(currentPage === 1 ? S.paginationBtnDisabled : {}),
            }}
          >
            Prev
          </button>

          <div style={S.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                style={{
                  ...S.pageNumberBtn,
                  ...(n === currentPage ? S.pageNumberBtnActive : {}),
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...S.paginationBtn,
              ...(currentPage === totalPages ? S.paginationBtnDisabled : {}),
            }}
          >
            Next
          </button>
        </div>
      </div>

      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------- */
/*  TABLE STYLES */
/* ------------------------------------------- */

const S = {
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

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
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

  addButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
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
  },

  tableCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
  },

  viewCvBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#7c3aed",
    backgroundColor: "#ede9fe",
    border: "1px solid #ddd6fe",
    borderRadius: "6px",
    cursor: "pointer",
  },

  actionButtons: {
    display: "flex",
    gap: "6px",
  },

  editBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#dbeafe",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
  },

  deleteBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
  },

  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
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
  },

  pageNumberBtnActive: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
};

/* ------------------------------------------- */
/*  MODAL STYLES */
/* ------------------------------------------- */

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: "20px",
  },

  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "95%",
    maxWidth: "800px",
    maxHeight: "95vh",
    overflow: "auto",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    borderBottom: "2px solid #e5e7eb",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 10,
  },

  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },

  closeBtn: {
    fontSize: "28px",
    fontWeight: "300",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "all 0.2s",
  },

  certificateContainer: {
    padding: "50px 40px",
    backgroundColor: "#ffffff",
  },

  certificateBorder: {
    maxWidth: "750px",
    margin: "0 auto",
    padding: "60px 80px",
    backgroundColor: "#ffffff",
  },

  certificateHeader: {
    marginBottom: "40px",
  },

  logoSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "30px",
  },

  headerLogo: {
    width: "180px",
    height: "auto",
    maxHeight: "100px",
    objectFit: "contain",
  },

  logoFallback: {
    width: "180px",
    height: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
  },

  omegaFallbackText: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#dc2626",
    fontStyle: "italic",
  },

  titleSection: {
    textAlign: "center",
    marginBottom: "30px",
  },

  certificateTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 10px 0",
    letterSpacing: "1px",
  },

  titleUnderline: {
    width: "80px",
    height: "2px",
    backgroundColor: "#d1d5db",
    margin: "0 auto",
  },

  metaSection: {
    marginBottom: "40px",
  },

  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "8px",
    fontWeight: "400",
  },

  dateText: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "20px",
    fontWeight: "400",
  },

  certificateBody: {
    marginBottom: "60px",
  },

  bodyText: {
    fontSize: "15px",
    lineHeight: "2",
    color: "#1f2937",
    marginBottom: "20px",
    textAlign: "justify",
    fontWeight: "400",
  },

  highlight: {
    color: "#000000",
    fontWeight: "600",
  },

  signatureSection: {
    marginTop: "60px",
  },

  signatureLabel: {
    fontSize: "15px",
    color: "#1f2937",
    margin: "8px 0",
    fontWeight: "400",
  },

  bottomActions: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginTop: "40px",
    paddingTop: "30px",
    borderTop: "2px solid #e5e7eb",
  },

  bottomPrintButton: {
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#059669",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  bottomDownloadButton: {
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};