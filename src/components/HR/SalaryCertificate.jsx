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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose} className="no-print">✕</button>
        
        <div style={modalStyles.certificateContainer}>
          {/* Header Section */}
          <div style={modalStyles.header}>
            <div style={modalStyles.logoSection}>
              <img 
                src="/assets/omega-logo.png" 
                alt="Omega Logo" 
                style={modalStyles.logo}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div style={modalStyles.companyInfo}>
              <h1 style={modalStyles.companyName}>BASIL ENTERPRISES</h1>
              <p style={modalStyles.companyDetails}>
                <strong>GSTIN:</strong> 32AEYFA5342B1ZN
              </p>
              <p style={modalStyles.companyDetails}>
                Omega Trade centre, Opp City Hospital<br/>
                Mavoor road, Tvm - 673101<br/>
                Malappuram Dt Kerala, India
              </p>
              <p style={modalStyles.companyDetails}>
                <strong>Mob:</strong> 9961 282 899<br/>
                <strong>L-L:</strong> 0494 242 5702
              </p>
            </div>
          </div>

          {/* Reference and Date */}
          <div style={modalStyles.refSection}>
            <div>
              <strong>REF NO:</strong> BE/HR/SAL/{new Date().getFullYear()}/{Math.floor(Math.random() * 1000)}
            </div>
            <div>{getCurrentDate()}</div>
          </div>

          {/* TO WHOMSOEVER Section */}
          <div style={modalStyles.toWhomSection}>
            <p style={modalStyles.toWhomText}>TO WHOMSOEVER IT MAY CONCERN.</p>
          </div>

          {/* Certificate Body with Watermark */}
          <div style={modalStyles.bodySection}>
            <div style={modalStyles.watermark}>
              <img 
                src="/assets/omega-logo.png" 
                alt="Watermark" 
                style={modalStyles.watermarkImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <p style={modalStyles.employeeName}>
              <strong>Mr. {certificate.emp_name?.toUpperCase() || "[EMPLOYEE NAME]"}</strong>
            </p>

            <p style={modalStyles.bodyText}>
              This is to certify that Mr. <strong>{certificate.emp_name || "[Employee Name]"}</strong> was 
              employed with Basil Enterprises as the <strong>{certificate.emp_designation || "[Designation]"}</strong> from{" "}
              <strong>{formatDate(certificate.emp_joining_date) || "[Start Date]"}</strong> to present.
            </p>

            <p style={modalStyles.bodyText}>
              The current monthly salary of <strong>{certificate.emp_name || "[Employee Name]"}</strong> is{" "}
              <strong>₹{certificate.salary || "[Amount]"}</strong> (Rupees {numberToWords(certificate.salary)} only).
            </p>

            <p style={modalStyles.bodyText}>
              During his tenure, he has provided dedicated service with professionalism. 
              We wish him success in all future endeavors.
            </p>
          </div>

          {/* Signature Section */}
          <div style={modalStyles.signatureSection}>
            <p style={modalStyles.signatureText}>For BASIL ENTERPRISES</p>
            <div style={modalStyles.signatureLine}></div>
            <p style={modalStyles.signatureLabel}>Authorized Signatory</p>
          </div>

          {/* Footer */}
          <div style={modalStyles.footer}>
            <p>www.myomega.in ~ email: hr@myomega</p>
          </div>

          {/* Print Button */}
          <div style={modalStyles.printButtonContainer} className="no-print">
            <button onClick={handlePrint} style={modalStyles.printButton}>
              🖨️ Print Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SalaryCertificate() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [employees, setEmployees] = useState([]);
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
      const [certRes, empRes] = await Promise.all([
        api.get("/certificate/salary-certificates/"),
        api.get("/employee-management/employees/")
      ]);

      let employeeData = [];
      if (Array.isArray(empRes.data)) {
        employeeData = empRes.data;
      } else if (empRes?.data?.data && Array.isArray(empRes.data.data)) {
        employeeData = empRes.data.data;
      } else if (empRes?.data?.results && Array.isArray(empRes.data.results)) {
        employeeData = empRes.data.results;
      }

      const employeeMap = {};
      employeeData.forEach(emp => {
        const empId = emp.id || emp.employee_id || emp.user_id;
        employeeMap[empId] = {
          name: emp.name || emp.full_name || emp.user?.name || emp.user?.full_name || emp.username || emp.user?.username || "Unknown",
          designation: emp.designation || emp.job_title || emp.job_info?.designation || emp.job_info?.job_title || "N/A",
          joining_date: emp.joining_date || emp.date_joined || emp.user?.date_joined || "N/A",
          employee_id: emp.employee_id || "N/A"
        };
      });

      setEmployees(employeeMap);

      let certData = certRes?.data?.data || certRes?.data || [];
      if (!Array.isArray(certData)) {
        certData = [];
      }

      const enrichedCertificates = certData.map(cert => {
        const empInfo = employeeMap[cert.employee] || {};
        return {
          ...cert,
          emp_name: empInfo.name || "Unknown",
          emp_designation: empInfo.designation || "N/A",
          emp_joining_date: empInfo.joining_date || "N/A",
          emp_employee_id: empInfo.employee_id || "N/A"
        };
      });

      setCertificates(enrichedCertificates);
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
  const handleViewCertificate = (certificate) => setSelectedCertificate(certificate);

  const filtered = certificates.filter((c) =>
    c.emp_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.emp_designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const rows = filtered.slice(start, end);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>Loading salary certificates...</p>
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
          <button onClick={() => navigate("/salary-certificate/add")} style={S.addButton}>
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
                  {certificates.length === 0 ? "No salary certificates found. Click 'Add New' to create one." : "No results found"}
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
                  <td style={S.tableCell}>{item.issued_date || "N/A"}</td>
                  <td style={S.tableCell}>
                    <button style={S.viewCvBtn} onClick={() => handleViewCertificate(item)}>View</button>
                  </td>
                  <td style={S.tableCell}>
                    <div style={S.actionButtons}>
                      <button style={S.editBtn} onClick={() => handleEdit(item.id)}>Edit</button>
                      <button style={S.deleteBtn} onClick={() => handleDelete(item.id)}>Delete</button>
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
          Showing {rows.length ? start + 1 : 0} to {Math.min(end, filtered.length)} of {filtered.length} entries
        </span>
        <div style={S.paginationButtons}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{...S.paginationBtn, ...(currentPage === 1 ? S.paginationBtnDisabled : {})}}
          >
            Prev
          </button>
          <div style={S.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                style={{...S.pageNumberBtn, ...(n === currentPage ? S.pageNumberBtnActive : {})}}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{...S.paginationBtn, ...(currentPage === totalPages ? S.paginationBtnDisabled : {})}}
          >
            Next
          </button>
        </div>
      </div>

      {selectedCertificate && (
        <CertificateModal certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />
      )}
    </div>
  );
}

const S = {
  container: { padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0 },
  headerActions: { display: "flex", alignItems: "center", gap: "12px" },
  searchContainer: { position: "relative", display: "flex", alignItems: "center" },
  searchInput: { padding: "12px 40px 12px 16px", fontSize: "14px", border: "2px solid #e5e7eb", borderRadius: "8px", outline: "none", width: "320px", fontWeight: "500", color: "#374151" },
  searchIcon: { position: "absolute", right: "14px", fontSize: "18px", pointerEvents: "none", color: "#9ca3af" },
  addButton: { padding: "12px 24px", fontSize: "14px", fontWeight: "600", color: "white", backgroundColor: "#3b82f6", border: "none", borderRadius: "8px", cursor: "pointer" },
  tableContainer: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeaderRow: { backgroundColor: "#f3f4f6" },
  tableHeader: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", borderBottom: "2px solid #e5e7eb" },
  tableRow: { borderBottom: "1px solid #e5e7eb" },
  tableCell: { padding: "12px 16px", fontSize: "14px", color: "#374151" },
  viewCvBtn: { padding: "6px 12px", fontSize: "13px", fontWeight: "500", color: "#7c3aed", backgroundColor: "#ede9fe", border: "1px solid #ddd6fe", borderRadius: "6px", cursor: "pointer" },
  actionButtons: { display: "flex", gap: "6px" },
  editBtn: { padding: "6px 12px", fontSize: "13px", fontWeight: "500", color: "#3b82f6", backgroundColor: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: "6px" },
  deleteBtn: { padding: "6px 12px", fontSize: "13px", fontWeight: "500", color: "#dc2626", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px" },
  noResults: { padding: "40px", textAlign: "center", color: "#6b7280", fontSize: "16px", fontWeight: "500" },
  paginationContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", padding: "16px 24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  paginationInfo: { fontSize: "14px", color: "#6b7280" },
  paginationButtons: { display: "flex", alignItems: "center", gap: "8px" },
  paginationBtn: { padding: "8px 16px", fontSize: "14px", fontWeight: "500", color: "#374151", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer" },
  paginationBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  pageNumbers: { display: "flex", alignItems: "center", gap: "4px" },
  pageNumberBtn: { padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: "#374151", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" },
  pageNumberBtnActive: { backgroundColor: "#3b82f6", color: "white", borderColor: "#3b82f6" },
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000, padding: "20px" },
  modal: { backgroundColor: "white", borderRadius: "0", width: "210mm", minHeight: "297mm", maxHeight: "95vh", overflow: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", position: "relative" },
  closeBtn: { position: "absolute", top: "20px", right: "20px", fontSize: "32px", fontWeight: "300", color: "#666", backgroundColor: "white", border: "2px solid #ddd", cursor: "pointer", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
  certificateContainer: { padding: "20mm", backgroundColor: "#ffffff", minHeight: "297mm", position: "relative" },
  
  // Header
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "15px", borderBottom: "3px solid #00BCD4", marginBottom: "20px" },
  logoSection: { flex: "0 0 120px" },
  logo: { width: "120px", height: "auto", maxHeight: "80px", objectFit: "contain" },
  companyInfo: { flex: 1, textAlign: "right", paddingLeft: "20px" },
  companyName: { fontSize: "20px", fontWeight: "700", color: "#00BCD4", margin: "0 0 8px 0", letterSpacing: "2px" },
  companyDetails: { fontSize: "11px", color: "#333", margin: "3px 0", lineHeight: "1.4" },

  // Reference Section
  refSection: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#333", marginBottom: "30px", fontWeight: "500" },

  // To Whom Section
  toWhomSection: { marginBottom: "40px" },
  toWhomText: { fontSize: "13px", fontWeight: "600", color: "#333", margin: 0 },

  // Body Section
  bodySection: { 
  position: "relative",
  paddingBottom: "40px",
  marginBottom: "40px"
},

watermark: {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  opacity: 0.05,
  zIndex: 0,
  pointerEvents: "none"
},
  watermarkImg: { width: "400px", height: "auto" },
  employeeName: { fontSize: "14px", fontWeight: "700", color: "#000", marginBottom: "20px", position: "relative", zIndex: 2 },
bodyText: {
  fontSize: "13px",
  lineHeight: "2.2",
  marginBottom: "24px",
  textAlign: "justify",
  position: "relative",
  zIndex: 2
},

  // Signature Section
signatureSection: {
  marginTop: "60px",
  paddingTop: "40px",
  display: "flex",
  justifyContent: "flex-start"
},
  signatureText: { fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "50px" },
  signatureLine: { width: "200px", height: "1px", backgroundColor: "#333", marginBottom: "8px" },
  signatureLabel: { fontSize: "12px", color: "#333", fontWeight: "500" },

  // Footer
footer: {
  marginTop: "40px",
  padding: "12px 0",
  textAlign: "center",
  borderTop: "1px solid #00BCD4"
},

  // Print Button
  printButtonContainer: { textAlign: "center", marginTop: "30px", paddingTop: "20px", borderTop: "2px solid #e5e7eb" },
  printButton: { padding: "14px 40px", fontSize: "15px", fontWeight: "600", color: "white", backgroundColor: "#059669", border: "none", borderRadius: "10px", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
};