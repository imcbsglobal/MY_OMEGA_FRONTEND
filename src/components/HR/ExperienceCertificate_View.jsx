import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ExperienceCertificateView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificateData();
  }, [id]);

  const loadCertificateData = () => {
    try {
      const storedData = localStorage.getItem('experience-certificate-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const certificate = data.find(item => item.id === parseInt(id));
        if (certificate) {
          setCertificateData(certificate);
        } else {
          alert('Certificate not found');
          navigate('/experience-certificate');
        }
      } else {
        alert('No certificate data available');
        navigate('/experience-certificate');
      }
    } catch (error) {
      console.error('Error loading certificate data:', error);
      alert('Failed to load certificate data');
      navigate('/experience-certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/experience-certificate');
  };

  const handleEdit = () => {
    navigate(`/experience-certificate/edit/${id}`);
  };

  const handleViewCertificate = () => {
    if (certificateData?.certificateUrl) {
      window.open(certificateData.certificateUrl, "_blank");
    } else {
      alert("Certificate not generated yet. Please generate the certificate first.");
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

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading certificate details...</div>
      </div>
    );
  }

  if (!certificateData) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.viewCard}>
        <div style={styles.viewHeader}>
          <h2 style={styles.viewTitle}>Certificate Details</h2>
          <div style={styles.headerActions}>
            <button onClick={handleEdit} style={styles.editButton}>
              ✏️ Edit Certificate
            </button>
            <button onClick={handleBack} style={styles.backButton}>
              ← Back to List
            </button>
          </div>
        </div>

        <div style={styles.viewBody}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.viewGrid}>
              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Name:</span>
                <span style={styles.viewValue}>{certificateData.name}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Phone Number:</span>
                <span style={styles.viewValue}>{certificateData.phoneNumber || "N/A"}</span>
              </div>

              <div style={{...styles.viewField, gridColumn: "1 / -1"}}>
                <span style={styles.viewLabel}>Address:</span>
                <span style={styles.viewValue}>{certificateData.address || "N/A"}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Employment Details</h3>
            <div style={styles.viewGrid}>
              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Job Title:</span>
                <span style={styles.viewValue}>{certificateData.jobTitle}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Joining Date:</span>
                <span style={styles.viewValue}>{certificateData.joiningDate || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>End Date:</span>
                <span style={styles.viewValue}>{certificateData.endDate || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Approval Status:</span>
                <span style={{...styles.viewValue, ...styles.statusBadge, ...getApprovalStyle(certificateData.approved)}}>
                  {certificateData.approved || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Certificate Attachment</h3>
            <div style={styles.certificateAttachmentSection}>
              {certificateData.certificateFileName ? (
                <div style={styles.certificateAttachmentBox}>
                  <div style={styles.certificateFileInfo}>
                    <span style={styles.fileIcon}>📄</span>
                    <div style={styles.fileDetails}>
                      <span style={styles.fileName}>{certificateData.certificateFileName}</span>
                      <span style={styles.fileType}>Document</span>
                    </div>
                  </div>
                  <button onClick={handleViewCertificate} style={styles.viewCertificateButton}>
                    View Certificate
                  </button>
                </div>
              ) : (
                <div style={styles.noAttachment}>Certificate not generated yet</div>
              )}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Additional Information</h3>
            <div style={styles.viewGrid}>
              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Added By:</span>
                <span style={styles.viewValue}>{certificateData.addedBy || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Approved By:</span>
                <span style={styles.viewValue}>{certificateData.approvedBy || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Created Date:</span>
                <span style={styles.viewValue}>{certificateData.createdDate || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.viewFooter}>
          <button onClick={handleBack} style={styles.closeBtn}>
            Close
          </button>
          <button onClick={handleEdit} style={styles.editBtn}>
            Edit Certificate
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
  viewCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  viewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  viewTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  backButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  editButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  viewBody: {
    padding: "24px",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "2px solid #e5e7eb",
  },
  viewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  viewField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  viewLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  viewValue: {
    fontSize: "15px",
    color: "#111827",
    fontWeight: "500",
  },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
    width: "fit-content",
  },
  certificateAttachmentSection: {
    marginTop: "12px",
  },
  certificateAttachmentBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  certificateFileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  fileIcon: {
    fontSize: "32px",
  },
  fileDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  fileName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
  },
  fileType: {
    fontSize: "13px",
    color: "#6b7280",
  },
  viewCertificateButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  noAttachment: {
    padding: "16px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "14px",
    fontStyle: "italic",
    backgroundColor: "#f9fafb",
    border: "1px dashed #d1d5db",
    borderRadius: "8px",
  },
  viewFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "20px 24px",
    borderTop: "1px solid #e5e7eb",
  },
  closeBtn: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  editBtn: {
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
};