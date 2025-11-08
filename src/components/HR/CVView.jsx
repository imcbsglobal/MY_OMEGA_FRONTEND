import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CVView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCVData();
  }, [id]);

  const loadCVData = () => {
    try {
      const storedData = localStorage.getItem('cv-management-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const cv = data.find(item => item.id === parseInt(id));
        if (cv) {
          setCvData(cv);
        } else {
          alert('CV not found');
          navigate('/cv-management');
        }
      } else {
        alert('No CV data available');
        navigate('/cv-management');
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
      alert('Failed to load CV data');
      navigate('/cv-management');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/cv-management');
  };

  const handleEdit = () => {
    navigate(`/cv-management/edit/${id}`);
  };

  const handleViewCV = () => {
    if (cvData?.cvAttachmentUrl) {
      window.open(cvData.cvAttachmentUrl, "_blank");
    } else {
      alert("No CV attachment available");
    }
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
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading CV details...</div>
      </div>
    );
  }

  if (!cvData) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.viewCard}>
        <div style={styles.viewHeader}>
          <h2 style={styles.viewTitle}>CV Details</h2>
          <div style={styles.headerActions}>
            <button onClick={handleEdit} style={styles.editButton}>
              ✏️ Edit CV
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
                <span style={styles.viewValue}>{cvData.name}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Job Title:</span>
                <span style={styles.viewValue}>{cvData.jobTitle}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Gender:</span>
                <span style={styles.viewValue}>{cvData.gender || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Date of Birth:</span>
                <span style={styles.viewValue}>{cvData.dob || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Phone Number:</span>
                <span style={styles.viewValue}>{cvData.phoneNumber || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Email:</span>
                <span style={styles.viewValue}>{cvData.email || "N/A"}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Location Details</h3>
            <div style={styles.viewGrid}>
              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Place:</span>
                <span style={styles.viewValue}>{cvData.place || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>District:</span>
                <span style={styles.viewValue}>{cvData.district || "N/A"}</span>
              </div>

              <div style={{...styles.viewField, gridColumn: "1 / -1"}}>
                <span style={styles.viewLabel}>Address:</span>
                <span style={styles.viewValue}>{cvData.address || "N/A"}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Professional Details</h3>
            <div style={styles.viewGrid}>
              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Education:</span>
                <span style={styles.viewValue}>{cvData.education || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Experience:</span>
                <span style={styles.viewValue}>{cvData.experience || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>CV Source:</span>
                <span style={styles.viewValue}>{cvData.cvSource || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Interview Status:</span>
                <span style={{...styles.viewValue, ...styles.statusBadge, ...getStatusStyle(cvData.interviewStatus)}}>
                  {cvData.interviewStatus || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>CV Attachment</h3>
            <div style={styles.cvAttachmentSection}>
              {cvData.cvFileName ? (
                <div style={styles.cvAttachmentBox}>
                  <div style={styles.cvFileInfo}>
                    <span style={styles.fileIcon}>📄</span>
                    <div style={styles.fileDetails}>
                      <span style={styles.fileName}>{cvData.cvFileName}</span>
                      <span style={styles.fileType}>Document</span>
                    </div>
                  </div>
                  <button onClick={handleViewCV} style={styles.viewCvButton}>
                    View CV
                  </button>
                </div>
              ) : (
                <div style={styles.noAttachment}>No CV attachment available</div>
              )}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Additional Information</h3>
            <div style={styles.viewGrid}>
              <div style={{...styles.viewField, gridColumn: "1 / -1"}}>
                <span style={styles.viewLabel}>Remarks:</span>
                <span style={styles.viewValue}>{cvData.remarks || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Created By:</span>
                <span style={styles.viewValue}>{cvData.createdUser || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Created Date:</span>
                <span style={styles.viewValue}>{cvData.createdDate || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.viewFooter}>
          <button onClick={handleBack} style={styles.closeBtn}>
            Close
          </button>
          <button onClick={handleEdit} style={styles.editBtn}>
            Edit CV
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
  cvAttachmentSection: {
    marginTop: "12px",
  },
  cvAttachmentBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  cvFileInfo: {
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
  viewCvButton: {
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