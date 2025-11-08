import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequestLeave() {
  const navigate = useNavigate();

  const [leaveData, setLeaveData] = useState({
    employeeName: "Admin User",
    employeeId: "ADMIN001",
    leaveType: "Full Day",
    startDate: "",
    endDate: "",
    reason: "",
    note: "",
    status: "Auto-Approved (Admin)"
  });

  const leaveTypes = [
    "Full Day",
    "Half Day",
    "LATE REQUEST (IN WHAT TO)",
    "LEAVE REQUEST (INDUL 30 MINUTES)",
    "FIBLOW",
    "Sick Leave",
    "Emergency Leave"
  ];

  useEffect(() => {
    // Set current date as default for start and end date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setLeaveData(prev => ({
      ...prev,
      startDate: formattedDate,
      endDate: formattedDate
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!leaveData.leaveType || !leaveData.startDate || !leaveData.reason.trim()) {
      alert("Please fill in all required fields (marked with *)");
      return;
    }

    try {
      const storedData = localStorage.getItem('leave-management-data');
      let data = storedData ? JSON.parse(storedData) : [];

      const newLeave = {
        ...leaveData,
        id: Date.now(),
        status: "APPROVED", // Auto-approved for admin
        approvedBy: "System",
        readers: "Admin leave auto-approved",
        isMyLeave: true,
        actions: "Action Completed"
      };

      data.push(newLeave);
      localStorage.setItem('leave-management-data', JSON.stringify(data));
      
      alert('Leave request submitted successfully!');
      navigate('/leave-management');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/leave-management');
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'dd-mm-yyyy';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>Request New Leave</h2>
          <button onClick={handleCancel} style={styles.backButton}>
            ← Back to List
          </button>
        </div>

        <div style={styles.adminNotice}>
          <strong>Requesting as Admin</strong>
          <p>Your leave will be auto-approved by the system.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Employee Info Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Employee Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Employee Name</label>
                <div style={styles.readOnlyField}>
                  {leaveData.employeeName}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Employee ID</label>
                <div style={styles.readOnlyField}>
                  {leaveData.employeeId}
                </div>
              </div>
            </div>
          </div>

          {/* Leave Details Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Leave Details</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Leave Type *</label>
                <select 
                  style={styles.input} 
                  name="leaveType" 
                  value={leaveData.leaveType} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date *</label>
                <input 
                  style={styles.input} 
                  type="date" 
                  name="startDate" 
                  value={leaveData.startDate} 
                  onChange={handleInputChange}
                  required
                />
                <div style={styles.dateHint}>
                  {formatDateForDisplay(leaveData.startDate)}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>End Date</label>
                <input 
                  style={styles.input} 
                  type="date" 
                  name="endDate" 
                  value={leaveData.endDate} 
                  onChange={handleInputChange}
                  min={leaveData.startDate}
                />
                <div style={styles.dateHint}>
                  {formatDateForDisplay(leaveData.endDate)}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <div style={styles.readOnlyField}>
                  {leaveData.status}
                </div>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Leave Information</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Reason *</label>
              <textarea 
                style={styles.textarea} 
                name="reason" 
                value={leaveData.reason} 
                onChange={handleInputChange}
                rows="3" 
                placeholder="Bereavement"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Note</label>
              <textarea 
                style={styles.textarea} 
                name="note" 
                value={leaveData.note} 
                onChange={handleInputChange}
                rows="3" 
                placeholder="Add any additional details"
              />
            </div>
          </div>

          <div style={styles.formFooter}>
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Close
            </button>
            <button type="submit" style={styles.submitBtn}>
              Submit Request
            </button>
          </div>
        </form>
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
  formCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    maxWidth: "800px",
    margin: "0 auto",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
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
  adminNotice: {
    padding: "16px 24px",
    backgroundColor: "#dbeafe",
    borderLeft: "4px solid #3b82f6",
    margin: "0 24px",
    borderRadius: "4px",
  },
  form: {
    padding: "24px",
  },
  section: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
  },
  textarea: {
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  readOnlyField: {
    padding: "12px 14px",
    fontSize: "14px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    color: "#6b7280",
  },
  dateHint: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
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
  submitBtn: {
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