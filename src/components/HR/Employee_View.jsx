import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EmployeeView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, [id]);

  const loadEmployeeData = () => {
    try {
      const storedData = localStorage.getItem('employee-management-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const employee = data.find(item => item.id === parseInt(id));
        if (employee) {
          setEmployeeData(employee);
        } else {
          alert('Employee not found');
          navigate('/employee-management');
        }
      } else {
        alert('No employee data available');
        navigate('/employee-management');
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      alert('Failed to load employee data');
      navigate('/employee-management');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/employee-management');
  };

  const handleEdit = () => {
    navigate(`/employee-management/edit/${id}`);
  };

  const handleViewAadhar = () => {
    if (employeeData?.aadharUrl) {
      window.open(employeeData.aadharUrl, "_blank");
    } else {
      alert("No Aadhar document available");
    }
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading employee details...</div>
      </div>
    );
  }

  if (!employeeData) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.viewCard}>
        <div style={styles.viewHeader}>
          <h2 style={styles.viewTitle}>Employee Details</h2>
          <div style={styles.headerActions}>
            <button onClick={handleEdit} style={styles.editButton}>
              ✏️ Edit Employee
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
                <span style={styles.viewValue}>{employeeData.name}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Email:</span>
                <span style={styles.viewValue}>{employeeData.email}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Personal Phone:</span>
                <span style={styles.viewValue}>{employeeData.personalPhone || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Residential Phone:</span>
                <span style={styles.viewValue}>{employeeData.residentialPhone || "N/A"}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Employment Details</h3>
            <div style={styles.viewGrid}>
              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Job Title:</span>
                <span style={styles.viewValue}>{employeeData.jobTitle || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Duty Time:</span>
                <span style={styles.viewValue}>{employeeData.dutyTime || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Joining Date:</span>
                <span style={styles.viewValue}>{employeeData.joiningDate || "N/A"}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Location:</span>
                <span style={styles.viewValue}>{employeeData.location || "N/A"}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Bank Details</h3>
            <div style={styles.viewGrid}>
              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Bank Account:</span>
                <span style={styles.viewValue}>{employeeData.bankAccount || "N/A"}</span>
              </div>

              <div style={{...styles.viewField, gridColumn: "1 / -1"}}>
                <span style={styles.viewLabel}>Bank Details:</span>
                <span style={styles.viewValue}>{employeeData.bankDetails || "N/A"}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Aadhar Document</h3>
            <div style={styles.aadharAttachmentSection}>
              {employeeData.aadharFileName ? (
                <div style={styles.aadharAttachmentBox}>
                  <div style={styles.aadharAttachmentInfo}>
                    <span style={styles.aadharFileName}>{employeeData.aadharFileName}</span>
                    <button onClick={handleViewAadhar} style={styles.viewAadharBtn}>
                      📄 View Aadhar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.noAadhar}>
                  No Aadhar document uploaded
                </div>
              )}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>System Information</h3>
            <div style={styles.viewGrid}>
              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Created By:</span>
                <span style={styles.viewValue}>{employeeData.createdUser}</span>
              </div>

              <div style={styles.viewField}>
                <span style={styles.viewLabel}>Created Date:</span>
                <span style={styles.viewValue}>{employeeData.createdDate}</span>
              </div>
            </div>
          </div>
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
    alignItems: "center",
    gap: "12px",
  },
  editButton: {
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
  viewBody: {
    padding: "24px",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e5e7eb",
  },
  viewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  viewField: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  viewLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6b7280",
  },
  viewValue: {
    fontSize: "16px",
    color: "#374151",
    fontWeight: "500",
  },
  aadharAttachmentSection: {
    marginTop: "8px",
  },
  aadharAttachmentBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#f9fafb",
  },
  aadharAttachmentInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aadharFileName: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
  },
  viewAadharBtn: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "white",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  noAadhar: {
    padding: "20px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "14px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px dashed #d1d5db",
  },
};