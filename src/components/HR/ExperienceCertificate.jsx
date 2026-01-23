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
    <div style={modalStyles.overlay} className="overlay-print-container" onClick={onClose}>
      <style>{`
        @media print {
          * { margin: 0 !important; padding: 0 !important; }
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          /* hide everything by default */
          body * { display: none !important; }
          
          /* show only certificate overlay and its children */
          .overlay-print-container { display: block !important; position: static !important; width: 210mm !important; height: 297mm !important; background: white !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
          .overlay-print-container * { display: block !important; }
          
          /* hide print buttons */
          .no-print { display: none !important; }

          /* certificate modal takes full page */
          .certificate-modal { display: block !important; position: static !important; width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; overflow: hidden !important; background: white !important; }

          @page { size: A4; margin: 0mm; padding: 0mm; }
        }
      `}</style>
      <div style={modalStyles.modal} className="certificate-modal" onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose} className="no-print">✕</button>
        
        <div style={modalStyles.certificateContainer}>
          {/* Header Section */}
          <div style={modalStyles.header}>
            <div style={modalStyles.logoSection}>
              <img src="/assets/omega-logo.png" alt="Omega Logo" style={modalStyles.logo} />
            </div>
            <div style={modalStyles.companyInfo}>
              <h1 style={modalStyles.companyName}>BASIL ENTERPRISES</h1>
              <p style={modalStyles.companyAddress}>
                Omega Trade centre, Opp.City Hospital<br/>
                Madrasa road, Tirur - 676101<br/>
                Malappuram Dt Kerala, India
              </p>
            </div>
            <div style={modalStyles.contactInfo}>
              <p style={modalStyles.gstinLine}><strong>GSTIN :</strong> 32AEYFA5342P1ZN</p>
              <p style={modalStyles.contactLine}>
                <strong>Mob |</strong> 9961 282 899<br/>
                <span style={modalStyles.whatsappIcon}>📱</span> 0494 242 5702
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={modalStyles.divider}></div>

          {/* Certificate Title and Date */}
          <div style={modalStyles.titleSection}>
            <h2 style={modalStyles.certificateTitle}>Experience Certificate</h2>
            <div style={modalStyles.dateBox}>
              <strong>{new Date().getDate()}<sup>{(() => {
                const day = new Date().getDate();
                if (day === 1 || day === 21 || day === 31) return 'st';
                if (day === 2 || day === 22) return 'nd';
                if (day === 3 || day === 23) return 'rd';
                return 'th';
              })()}</sup></strong>
              <div>{new Date().toLocaleString('en-US', { month: 'short' })}{new Date().getFullYear()}</div>
            </div>
          </div>

          {/* TO WHOMSOEVER Section */}
          <div style={modalStyles.toWhomSection}>
            <p style={modalStyles.toWhomText}>To Whom soever It May Concern</p>
          </div>

          {/* Certificate Body */}
          <div style={modalStyles.bodySection}>
            <div style={modalStyles.contentWrapper}>
              <p style={modalStyles.openingText}>
                Dear sir/madam
              </p>

              <p style={modalStyles.bodyText}>
                <span style={modalStyles.indentSpace}></span>This is to certify that <strong>Mr. {certificate.emp_name || "[Employee Name]"} P.C S/O Saidulavi P.C</strong> worked as <strong>{certificate.emp_designation || "Warehouse Manager And Team Leader"}</strong> in our company from <strong>{(() => {
                  const startDate = new Date(certificate.joining_date || "2022-12-12");
                  return `${startDate.getDate()}${'th'} Dec ${startDate.getFullYear()}`;
                })()}</strong> to <strong>{(() => {
                  const endDate = certificate.end_date && certificate.end_date !== "present" ? new Date(certificate.end_date) : new Date("2023-12-31");
                  return `${endDate.getDate()}${'st'} Dec ${endDate.getFullYear()}`;
                })()}</strong> with our entire satisfaction.
              </p>

              <p style={modalStyles.bodyText}>
                <span style={modalStyles.indentSpace}></span>During his work period we found him a sincere, honest, hardworking, dedicated employee with well disciplined attitude and very good job knowledge.
              </p>

              <p style={modalStyles.bodyText}>
                <span style={modalStyles.indentSpace}></span>He is amiable in nature and character is well. We have no objection to allow him in any better position and have no liabilities in our company.
              </p>

              <p style={modalStyles.bodyText}>
                <span style={modalStyles.indentSpace}></span>We wish him all the best in his future endeavours.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div style={modalStyles.signatureSection}>
            <div style={modalStyles.signatureBlock}>
              <div style={modalStyles.signatureSpace}></div>
              <p style={modalStyles.signatureLabel}>Yours Truely</p>
              <p style={modalStyles.signatureName}>C. Aboobacker</p>
              <p style={modalStyles.signatureDesignation}>Proprietor Basil Enterprises</p>
            </div>
          </div>

          {/* Footer */}
          <div style={modalStyles.footer}>
            <div style={modalStyles.footerContent}>
              <p style={modalStyles.footerText}>
                www.myomega.in - email: hr@myomega.in
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
    position: "relative",
    zIndex: 1
  },
  closeBtn: { 
    position: "absolute", 
    top: "15px", 
    right: "15px", 
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
    zIndex: 1000, 
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    transition: "all 0.2s"
  },
  certificateContainer: { 
    padding: "40px 50px 100px 50px", 
    backgroundColor: "#ffffff", 
    minHeight: "297mm", 
    position: "relative",
    fontFamily: "'Times New Roman', serif",
    color: "#333"
  },
  
  // Header Section
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    paddingBottom: "15px", 
    marginBottom: "10px" 
  },
  logoSection: { 
    flex: "0 0 80px",
    display: "flex",
    alignItems: "flex-start"
  },
  logo: { 
    width: "70px", 
    height: "auto", 
    maxHeight: "70px", 
    objectFit: "contain" 
  },
  companyInfo: { 
    flex: 1, 
    textAlign: "center", 
    paddingLeft: "20px",
    paddingRight: "20px"
  },
  companyName: { 
    fontSize: "22px", 
    fontWeight: "700", 
    color: "#00BCD4", 
    margin: "0 0 8px 0", 
    letterSpacing: "2px",
    lineHeight: "1.2"
  },
  companyAddress: { 
    fontSize: "10px", 
    color: "#333", 
    margin: "0", 
    lineHeight: "1.5" 
  },
  contactInfo: {
    flex: "0 0 140px",
    textAlign: "right"
  },
  gstinLine: {
    fontSize: "9px",
    color: "#333",
    margin: "0 0 20px 0",
    lineHeight: "1.4"
  },
  contactLine: {
    fontSize: "10px",
    color: "#333",
    margin: "0",
    lineHeight: "1.5"
  },
  whatsappIcon: {
    fontSize: "12px",
    marginRight: "2px"
  },

  // Divider
  divider: {
    height: "3px",
    background: "linear-gradient(to right, #00BCD4, #00BCD4)",
    marginBottom: "20px"
  },

  // Title Section
  titleSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingTop: "10px"
  },
  certificateTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
    textDecoration: "underline"
  },
  dateBox: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    lineHeight: "1.3"
  },

  // To Whom Section
  toWhomSection: { 
    marginBottom: "25px",
    textAlign: "center",
    padding: "0"
  },
  toWhomText: { 
    fontSize: "13px", 
    fontWeight: "400", 
    color: "#333", 
    margin: 0,
    textDecoration: "underline"
  },

  // Body Section
  bodySection: { 
    paddingBottom: "20px",
    marginBottom: "20px"
  },
  contentWrapper: {
    position: "relative"
  },
  openingText: {
    fontSize: "13px",
    color: "#333",
    marginBottom: "20px",
    lineHeight: "1.8"
  },
  indentSpace: {
    display: "inline-block",
    width: "30px"
  },
  bodyText: {
    fontSize: "13px",
    lineHeight: "2",
    marginBottom: "20px",
    textAlign: "justify",
    color: "#333"
  },

  // Signature Section
  signatureSection: {
    marginTop: "40px",
    paddingTop: "10px",
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: "50px",
    marginBottom: "20px"
  },
  signatureBlock: {
    textAlign: "right",
    minWidth: "200px"
  },
  signatureSpace: {
    height: "60px",
    marginBottom: "0px"
  },
  signatureLabel: { 
    fontSize: "13px", 
    color: "#333", 
    fontWeight: "400",
    marginBottom: "2px",
    margin: 0
  },
  signatureName: {
    fontSize: "13px",
    color: "#333",
    fontWeight: "600",
    margin: 0,
    marginBottom: "2px"
  },
  signatureDesignation: {
    fontSize: "13px",
    color: "#333",
    fontWeight: "400",
    margin: 0
  },

  // Footer
  footer: {
    position: "fixed",
    bottom: "0",
    left: "50%",
    transform: "translateX(-50%)",
    width: "210mm",
    padding: "12px 0",
    textAlign: "center",
    background: "linear-gradient(to right, #00BCD4, #00BCD4)",
    marginTop: "auto"
  },
  footerContent: {
    textAlign: "center"
  },
  footerText: {
    fontSize: "10px",
    color: "white",
    margin: 0,
    fontWeight: "500"
  },

  // Print Button
  printButtonContainer: { 
    textAlign: "center", 
    marginTop: "30px", 
    paddingTop: "25px", 
    borderTop: "2px solid #e5e7eb",
    position: "relative",
    zIndex: 1,
    marginBottom: "50px"
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