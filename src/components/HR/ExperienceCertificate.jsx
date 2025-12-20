import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;

  const handlePrint = () => window.print();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const calculateTenure = (startDate, endDate) => {
    if (!startDate) return "N/A";
    const start = new Date(startDate);
    const end = endDate && endDate !== "present" ? new Date(endDate) : new Date();
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years > 0 && months > 0) {
      return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    return "Less than a month";
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose} className="no-print">✕</button>
        
        <div style={modalStyles.certificateContainer}>
          {/* Header Section */}
          <div style={modalStyles.header}>
            <div style={modalStyles.logoSection}>
              <img src="/assets/omega-logo.png" alt="Omega Logo" style={modalStyles.logo} />
            </div>
            <div style={modalStyles.companyInfo}>
              <h1 style={modalStyles.companyName}>BASIL ENTERPRISES</h1>
              <p style={modalStyles.companyDetails}><strong>GSTIN:</strong> 32AEYFA5342B1ZN</p>
              <p style={modalStyles.companyDetails}>
                Omega Trade Centre, Opp City Hospital<br/>
                Mavoor Road, Kozhikode - 673101<br/>
                Malappuram District, Kerala, India
              </p>
              <p style={modalStyles.companyDetails}>
                <strong>Phone:</strong> +91 9961 282 899 | <strong>Landline:</strong> 0494 242 5702<br/>
                <strong>Email:</strong> hr@myomega.in | <strong>Web:</strong> www.myomega.in
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={modalStyles.divider}></div>

          {/* Reference and Date */}
          <div style={modalStyles.refSection}>
            <div style={modalStyles.refNumber}>
              <strong>REF NO:</strong> BE/HR/EXP/{new Date().getFullYear()}/{String(certificate.id || Math.floor(Math.random() * 1000)).padStart(4, '0')}
            </div>
            <div style={modalStyles.dateSection}>
              <strong>Date:</strong> {getCurrentDate()}
            </div>
          </div>

          {/* TO WHOMSOEVER Section */}
          <div style={modalStyles.toWhomSection}>
            <h2 style={modalStyles.toWhomTitle}>EXPERIENCE CERTIFICATE</h2>
            <p style={modalStyles.toWhomText}>TO WHOMSOEVER IT MAY CONCERN</p>
          </div>

          {/* Certificate Body with Watermark */}
          <div style={modalStyles.bodySection}>
            <div style={modalStyles.watermark}>
              <img src="/assets/omega-logo.png" alt="Watermark" style={modalStyles.watermarkImg} />
            </div>

            <div style={modalStyles.contentWrapper}>
              <p style={modalStyles.openingText}>
                This is to certify that
              </p>

              <p style={modalStyles.employeeName}>
                <strong>Mr./Ms. {certificate.emp_name?.toUpperCase() || "[EMPLOYEE NAME]"}</strong>
              </p>

              <p style={modalStyles.bodyText}>
                was employed with <strong>Basil Enterprises</strong> in the capacity of <strong>{certificate.emp_designation || "[Designation]"}</strong> from{" "}
                <strong>{formatDate(certificate.joining_date) || "[Start Date]"}</strong> to{" "}
                <strong>{certificate.end_date === "present" ? "Present" : formatDate(certificate.end_date) || "[End Date]"}</strong>, 
                spanning a total period of approximately <strong>{calculateTenure(certificate.joining_date, certificate.end_date)}</strong>.
              </p>

              <p style={modalStyles.bodyText}>
                During the tenure with our organization, {certificate.emp_name?.split(' ')[0] || "[Name]"} demonstrated exceptional 
                dedication, professionalism, and proficiency in assigned responsibilities. {certificate.emp_name?.split(' ')[0] || "The employee"} 
                consistently exhibited strong work ethics, excellent communication skills, and the ability to work effectively both 
                independently and as part of a team.
              </p>

              <p style={modalStyles.bodyText}>
                {certificate.emp_name?.split(' ')[0] || "The employee"}'s contributions were valuable to our organization, 
                and {certificate.emp_name?.split(' ')[0]?.toLowerCase() === certificate.emp_name?.split(' ')[0] ? "they" : "he/she"} maintained 
                a high standard of performance throughout the employment period. {certificate.emp_name?.split(' ')[0] || "The employee"} 
                was found to be sincere, hardworking, and committed to organizational goals.
              </p>

              <p style={modalStyles.bodyText}>
                We hereby confirm that {certificate.emp_name?.split(' ')[0] || "the employee"} left our organization on good terms, 
                and all dues and obligations have been cleared. There are no pending disciplinary actions or financial matters.
              </p>

              <p style={modalStyles.closingText}>
                We wish {certificate.emp_name || "[Employee Name]"} all the very best for future endeavors and continued success 
                in professional career.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div style={modalStyles.signatureSection}>
            <div style={modalStyles.signatureBlock}>
              <p style={modalStyles.signatureText}>For <strong>BASIL ENTERPRISES</strong></p>
              <div style={modalStyles.signatureSpace}></div>
              <div style={modalStyles.signatureLine}></div>
              <p style={modalStyles.signatureLabel}>Authorized Signatory</p>
              <p style={modalStyles.signatureDesignation}>Human Resources Department</p>
            </div>
          </div>

          {/* Footer */}
          <div style={modalStyles.footer}>
            <div style={modalStyles.footerContent}>
              <p style={modalStyles.footerText}>
                <strong>Note:</strong> This is a system-generated certificate. For verification, please contact our HR department.
              </p>
              <p style={modalStyles.footerContact}>
                www.myomega.in | hr@myomega.in | +91 9961 282 899
              </p>
            </div>
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

export default function ExperienceCertificateList() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const itemsPerPage = 25;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [certRes, empRes] = await Promise.all([
        api.get("/certificate/experience-certificates/"),
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
          email: emp.email || emp.user?.email || "N/A"
        };
      });

      setEmployees(employeeMap);

      let certData = certRes?.data?.data || certRes?.data || [];
      if (!Array.isArray(certData)) certData = [];

      const enrichedCertificates = certData.map(cert => {
        const empInfo = employeeMap[cert.employee] || {};
        return {
          ...cert,
          emp_name: empInfo.name || cert.emp_name || "Unknown",
          emp_designation: empInfo.designation || cert.emp_designation || "N/A",
          emp_email: empInfo.email || cert.emp_email || "N/A"
        };
      });

      setCertificates(enrichedCertificates);
    } catch (err) {
      console.error("Load error:", err);
    }
    setLoading(false);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`/certificate/experience-certificates/${id}/`);
        setCertificates((prev) => prev.filter((cert) => cert.id !== id));
      } catch (err) {
        alert("Failed to delete certificate");
      }
    }
  };

  const filteredCertificates = certificates.filter(certificate => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      certificate.emp_name?.toLowerCase().includes(query) ||
      certificate.emp_designation?.toLowerCase().includes(query) ||
      certificate.emp_email?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCertificates = filteredCertificates.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading certificate data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header} className="no-print">
        <h2 style={styles.title}>Experience Certificate Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, job title, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <button onClick={() => navigate('/experience-certificate/add')} style={styles.addButton}>+ Add New</button>
        </div>
      </div>

      <div style={styles.tableContainer} className="no-print">
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>SL NO</th>
              <th style={styles.tableHeader}>NAME</th>
              <th style={styles.tableHeader}>EMAIL</th>
              <th style={styles.tableHeader}>JOB TITLE</th>
              <th style={styles.tableHeader}>JOINING DATE</th>
              <th style={styles.tableHeader}>END DATE</th>
              <th style={styles.tableHeader}>ISSUE DATE</th>
              <th style={styles.tableHeader}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentCertificates.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noResults}>
                  {searchQuery ? `No results found for "${searchQuery}"` : "No certificate records available"}
                </td>
              </tr>
            ) : (
              currentCertificates.map((certificate, index) => (
                <tr key={certificate.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{startIndex + index + 1}</td>
                  <td style={styles.tableCell}>{certificate.emp_name}</td>
                  <td style={styles.tableCell}>{certificate.emp_email}</td>
                  <td style={styles.tableCell}>{certificate.emp_designation}</td>
                  <td style={styles.tableCell}>{certificate.joining_date || "N/A"}</td>
                  <td style={styles.tableCell}>{certificate.end_date || "N/A"}</td>
                  <td style={styles.tableCell}>{certificate.issue_date || "N/A"}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button onClick={() => setSelectedCertificate(certificate)} style={styles.generateBtn}>View</button>
                      <button onClick={() => navigate(`/experience-certificate/edit/${certificate.id}`)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDeleteClick(certificate.id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.paginationContainer} className="no-print">
        <div style={styles.paginationInfo}>
          Showing {filteredCertificates.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredCertificates.length)} of {filteredCertificates.length} entries
        </div>
        <div style={styles.paginationButtons}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{...styles.paginationBtn, ...(currentPage === 1 ? styles.paginationBtnDisabled : {})}}
          >
            Previous
          </button>
          <div style={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{...styles.pageNumberBtn, ...(pageNum === currentPage ? styles.pageNumberBtnActive : {})}}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{...styles.paginationBtn, ...(currentPage === totalPages ? styles.paginationBtnDisabled : {})}}
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

const styles = {
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
  actionButtons: { display: "flex", gap: "6px" },
  generateBtn: { padding: "6px 12px", fontSize: "13px", fontWeight: "500", color: "#7c3aed", backgroundColor: "#ede9fe", border: "1px solid #ddd6fe", borderRadius: "6px", cursor: "pointer" },
  editBtn: { padding: "6px 12px", fontSize: "13px", fontWeight: "500", color: "#3b82f6", backgroundColor: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: "6px", cursor: "pointer" },
  deleteBtn: { padding: "6px 12px", fontSize: "13px", fontWeight: "500", color: "#dc2626", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer" },
  paginationContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", padding: "16px 24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  paginationInfo: { fontSize: "14px", color: "#6b7280" },
  paginationButtons: { display: "flex", alignItems: "center", gap: "8px" },
  paginationBtn: { padding: "8px 16px", fontSize: "14px", fontWeight: "500", color: "#374151", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer" },
  paginationBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  pageNumbers: { display: "flex", alignItems: "center", gap: "4px" },
  pageNumberBtn: { padding: "8px 12px", fontSize: "14px", fontWeight: "500", color: "#374151", backgroundColor: "white", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" },
  pageNumberBtnActive: { backgroundColor: "#3b82f6", color: "white", borderColor: "#3b82f6" },
  noResults: { padding: "40px", textAlign: "center", color: "#6b7280", fontSize: "16px", fontWeight: "500" },
};

const modalStyles = {
  overlay: { 
    position: "fixed", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: "rgba(0,0,0,0.75)", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 10000, 
    padding: "20px" 
  },
  modal: { 
    backgroundColor: "white", 
    borderRadius: "0", 
    width: "210mm", 
    minHeight: "297mm", 
    maxHeight: "95vh", 
    overflow: "auto", 
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", 
    position: "relative" 
  },
  closeBtn: { 
    position: "absolute", 
    top: "20px", 
    right: "20px", 
    fontSize: "28px", 
    fontWeight: "400", 
    color: "#666", 
    backgroundColor: "white", 
    border: "2px solid #ddd", 
    cursor: "pointer", 
    width: "44px", 
    height: "44px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    borderRadius: "50%", 
    zIndex: 100, 
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    transition: "all 0.2s"
  },
  certificateContainer: { 
    padding: "25mm 20mm", 
    backgroundColor: "#ffffff", 
    minHeight: "297mm", 
    position: "relative",
    fontFamily: "'Arial', 'Helvetica', sans-serif"
  },
  
  // Header Section
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    paddingBottom: "20px", 
    marginBottom: "15px" 
  },
  logoSection: { 
    flex: "0 0 140px",
    display: "flex",
    alignItems: "center"
  },
  logo: { 
    width: "140px", 
    height: "auto", 
    maxHeight: "90px", 
    objectFit: "contain" 
  },
  companyInfo: { 
    flex: 1, 
    textAlign: "right", 
    paddingLeft: "30px" 
  },
  companyName: { 
    fontSize: "24px", 
    fontWeight: "700", 
    color: "#00BCD4", 
    margin: "0 0 10px 0", 
    letterSpacing: "3px",
    lineHeight: "1.2"
  },
  companyDetails: { 
    fontSize: "11px", 
    color: "#444", 
    margin: "4px 0", 
    lineHeight: "1.6" 
  },

  // Divider
  divider: {
    height: "3px",
    background: "linear-gradient(to right, #00BCD4, #0097A7)",
    marginBottom: "25px",
    borderRadius: "2px"
  },

  // Reference Section
  refSection: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    fontSize: "12px", 
    color: "#333", 
    marginBottom: "35px", 
    fontWeight: "500",
    padding: "10px 0"
  },
  refNumber: {
    letterSpacing: "0.5px"
  },
  dateSection: {
    letterSpacing: "0.5px"
  },

  // To Whom Section
  toWhomSection: { 
    marginBottom: "35px",
    textAlign: "center",
    padding: "20px 0"
  },
  toWhomTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#00BCD4",
    margin: "0 0 15px 0",
    letterSpacing: "4px",
    textTransform: "uppercase"
  },
  toWhomText: { 
    fontSize: "13px", 
    fontWeight: "600", 
    color: "#333", 
    margin: 0,
    letterSpacing: "1px"
  },

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

  watermarkImg: { 
    width: "500px", 
    height: "auto" 
  },
  contentWrapper: {
    position: "relative",
    zIndex: 2
  },
  openingText: {
    fontSize: "13px",
    color: "#333",
    marginBottom: "15px",
    lineHeight: "1.8"
  },
  employeeName: { 
    fontSize: "16px", 
    fontWeight: "700", 
    color: "#000", 
    marginBottom: "25px", 
    position: "relative", 
    zIndex: 2,
    textAlign: "center",
    letterSpacing: "1px"
  },
 bodyText: {
  fontSize: "13px",
  lineHeight: "2.2",
  marginBottom: "24px",
  textAlign: "justify",
  position: "relative",
  zIndex: 2
},

  closingText: {
    fontSize: "13px",
    lineHeight: "2.2",
    color: "#333",
    marginTop: "25px",
    textAlign: "justify",
    position: "relative",
    zIndex: 2,
    fontWeight: "500"
  },

  // Signature Section
 signatureSection: {
  marginTop: "60px",
  paddingTop: "40px",
  display: "flex",
  justifyContent: "flex-start"
},

  signatureBlock: {
    textAlign: "center",
    minWidth: "250px"
  },
  signatureText: { 
    fontSize: "13px", 
    fontWeight: "600", 
    color: "#333", 
    marginBottom: "60px",
    textAlign: "left"
  },
  signatureSpace: {
    height: "50px",
    marginBottom: "5px"
  },
  signatureLine: { 
    width: "100%", 
    height: "2px", 
    backgroundColor: "#333", 
    marginBottom: "10px" 
  },
  signatureLabel: { 
    fontSize: "13px", 
    color: "#333", 
    fontWeight: "600",
    marginBottom: "5px"
  },
  signatureDesignation: {
    fontSize: "11px",
    color: "#666",
    fontStyle: "italic"
  },

  // Footer
  footer: {
  marginTop: "40px",
  padding: "12px 0",
  textAlign: "center",
  borderTop: "1px solid #00BCD4"
},

  footerContent: {
    textAlign: "center"
  },
  footerText: {
    fontSize: "10px",
    color: "white",
    margin: "0 0 8px 0",
    fontWeight: "500"
  },
  footerContact: {
    fontSize: "11px",
    color: "white",
    margin: 0,
    fontWeight: "600",
    letterSpacing: "0.5px"
  },

  // Print Button
  printButtonContainer: { 
    textAlign: "center", 
    marginTop: "30px", 
    paddingTop: "25px", 
    borderTop: "2px solid #e5e7eb" 
  },
  printButton: { 
    padding: "16px 50px", 
    fontSize: "16px", 
    fontWeight: "600", 
    color: "white", 
    background: "linear-gradient(135deg, #059669, #047857)",
    border: "none", 
    borderRadius: "12px", 
    cursor: "pointer", 
    boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
    transition: "all 0.3s",
    letterSpacing: "0.5px"
  },
}