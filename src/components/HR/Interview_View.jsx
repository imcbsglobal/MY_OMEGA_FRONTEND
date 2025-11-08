import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function getResultStyle(result) {
  const resultStyles = {
    Pending: { backgroundColor: "#fef3c7", color: "#92400e" },
    Selected: { backgroundColor: "#d1fae5", color: "#065f46" },
    Rejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
  };
  return resultStyles[result] || { backgroundColor: "#f3f4f6", color: "#374151" };
}

export default function Interview_View() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviewData();
  }, [id]);

  const loadInterviewData = () => {
    try {
      const storedData = localStorage.getItem('interview-management-data');
      if (storedData) {
        const interviews = JSON.parse(storedData);
        const interview = interviews.find(item => item.id === parseInt(id));
        if (interview) {
          setInterviewData(interview);
        } else {
          alert("Interview not found");
          navigate('/interview-management');
        }
      } else {
        alert("No data found");
        navigate('/interview-management');
      }
    } catch (error) {
      console.error('Error loading interview:', error);
      alert('Failed to load interview data');
      navigate('/interview-management');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/interview-management');
  };

  const handleEdit = () => {
    navigate(`/interview-management/edit/${id}`);
  };

  const handleViewCV = () => {
    if (interviewData.cvAttachmentUrl) {
      window.open(interviewData.cvAttachmentUrl, "_blank");
    } else {
      alert("No CV attachment available");
    }
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading interview details...</div>
      </div>
    );
  }

  if (!interviewData) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.viewCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>Interview Details</h2>
          <div style={styles.headerActions}>
            <button onClick={handleEdit} style={styles.editButton}>
              ✏️ Edit
            </button>
            <button onClick={handleBack} style={styles.backButton}>
              ← Back to List
            </button>
          </div>
        </div>

        <div style={styles.viewGrid}>
          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Name</span>
            <span style={styles.viewValue}>{interviewData.name}</span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Job Title</span>
            <span style={styles.viewValue}>{interviewData.jobTitle}</span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Gender</span>
            <span style={styles.viewValue}>{interviewData.gender || "N/A"}</span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Phone Number</span>
            <span style={styles.viewValue}>{interviewData.phoneNumber || "N/A"}</span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Location</span>
            <span style={styles.viewValue}>{interviewData.place || "N/A"}</span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Interviewed By</span>
            <span style={styles.viewValue}>{interviewData.interviewedBy || "N/A"}</span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Result</span>
            <span style={{...styles.viewValue, ...styles.statusBadge, ...getResultStyle(interviewData.result)}}>
              {interviewData.result || "N/A"}
            </span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>CV Attachment</span>
            {interviewData.cvFileName ? (
              <button onClick={handleViewCV} style={styles.viewCvBtn}>
                📄 {interviewData.cvFileName}
              </button>
            ) : (
              <span style={styles.viewValue}>No CV attached</span>
            )}
          </div>

          <div style={{...styles.viewField, gridColumn: "1 / -1"}}>
            <span style={styles.viewLabel}>Remarks</span>
            <span style={styles.viewValue}>{interviewData.remarks || "N/A"}</span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Created By</span>
            <span style={styles.viewValue}>{interviewData.createdUser || "N/A"}</span>
          </div>

          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Created Date</span>
            <span style={styles.viewValue}>{interviewData.createdDate || "N/A"}</span>
          </div>
        </div>

        <div style={styles.viewFooter}>
          <button onClick={handleBack} style={styles.closeBtn}>
            Close
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
    padding: "32px",
    maxWidth: "1000px",
    margin: "0 auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e5e7eb",
  },
  title: {
    fontSize: "28px",
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
  viewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  },
  viewField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  viewLabel: {
    fontSize: "12px",
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
  viewCvBtn: {
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "fit-content",
    textAlign: "left",
  },
  viewFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "32px",
    paddingTop: "24px",
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
};