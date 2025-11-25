import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

// Certificate Modal Component
function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
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
        <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>

        <div style={modalStyles.certificateContainer}>
          <div style={modalStyles.certificate}>
            <div style={modalStyles.header}>
              <h1 style={modalStyles.companyName}>ABC COMPANY</h1>
              <p style={modalStyles.tagline}>Excellence in Service</p>
            </div>

            <div style={modalStyles.divider}></div>

            <h2 style={modalStyles.certificateTitle}>SALARY CERTIFICATE</h2>

            <div style={modalStyles.content}>
              <p style={modalStyles.date}>
                <strong>Date:</strong> {certificate.issued_date}
              </p>

              <p style={modalStyles.toWhom}>To Whom It May Concern,</p>

              <p style={modalStyles.paragraph}>
                This is to certify that{" "}
                <strong>{certificate.emp_name}</strong> is working with our
                organization as{" "}
                <strong>{certificate.emp_designation}</strong> since{" "}
                <strong>{certificate.emp_joining_date}</strong>.
              </p>

              <p style={modalStyles.paragraph}>
                The current monthly salary of{" "}
                <strong>{certificate.emp_name}</strong> is{" "}
                <strong>₹{certificate.salary}</strong> (Rupees{" "}
                {numberToWords(certificate.salary)} only).
              </p>

              <p style={modalStyles.paragraph}>
                This certificate is issued upon the employee's request for
                official purposes.
              </p>

              <div style={modalStyles.employeeDetails}>
                <h3 style={modalStyles.detailsTitle}>Employee Details:</h3>
                <p><strong>Name:</strong> {certificate.emp_name}</p>
                <p><strong>Email:</strong> {certificate.emp_email}</p>
                <p><strong>Designation:</strong> {certificate.emp_designation}</p>
                <p><strong>Date of Joining:</strong> {certificate.emp_joining_date}</p>
              </div>

              <div style={modalStyles.footer}>
                <p style={modalStyles.regards}>Best Regards,</p>
                <div style={modalStyles.signature}>
                  <div style={modalStyles.signatureLine}></div>
                  <p style={modalStyles.signatureName}>{certificate.generated_by_name}</p>
                  <p style={modalStyles.signatureTitle}>HR Manager</p>
                  <p style={modalStyles.signatureCompany}>ABC Company</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={modalStyles.actions}>
          <button style={modalStyles.printBtn} onClick={handlePrint}>
            🖨️ Print Certificate
          </button>
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

  const handleEdit = (id) =>
    navigate(`/salary-certificate/edit/${id}`);

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
/*  SAME STYLES — UNCHANGED */
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
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
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
/*  MODAL STYLES (unchanged) */
/* ------------------------------------------- */

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },

  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  certificateContainer: {
    padding: "40px",
  },

  certificate: {
    border: "3px solid #3b82f6",
    borderRadius: "8px",
    padding: "40px",
    backgroundColor: "#ffffff",
  },

  header: {
    textAlign: "center",
    marginBottom: "20px",
  },

  companyName: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1e3a8a",
    letterSpacing: "2px",
    marginBottom: "8px",
  },

  tagline: {
    fontSize: "14px",
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: "8px",
  },

  divider: {
    height: "3px",
    backgroundColor: "#3b82f6",
    marginBottom: "20px",
  },

  certificateTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "20px",
    textAlign: "center",
  },

  content: {
    lineHeight: "1.8",
    color: "#374151",
  },

  date: {
    marginBottom: "20px",
  },

  toWhom: {
    fontWeight: "600",
    marginBottom: "20px",
  },

  paragraph: {
    marginBottom: "16px",
  },

  employeeDetails: {
    backgroundColor: "#f3f4f6",
    padding: "20px",
    borderRadius: "8px",
    marginTop: "30px",
  },

  detailsTitle: {
    fontWeight: "600",
    marginBottom: "12px",
  },

  footer: {
    marginTop: "40px",
  },

  regards: {
    marginBottom: "60px",
  },

  signature: {
    textAlign: "left",
  },

  signatureLine: {
    width: "200px",
    height: "2px",
    backgroundColor: "#374151",
    marginBottom: "8px",
  },

  signatureName: {
    fontWeight: "600",
  },

  signatureTitle: {
    color: "#64748b",
  },

  signatureCompany: {
    color: "#64748b",
  },

  actions: {
    padding: "20px",
    textAlign: "center",
  },

  printBtn: {
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
