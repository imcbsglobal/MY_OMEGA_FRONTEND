import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/client";

export default function RequestLeave() {
  const navigate = useNavigate();

  const [leaveData, setLeaveData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    note: "",
  });

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(true);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    setLeaveData((prev) => ({
      ...prev,
      startDate: formattedDate,
      endDate: formattedDate,
    }));

    // Fetch leave types
    const fetchLeaveTypes = async () => {
      try {
        setLoadingLeaveTypes(true);
        const response = await api.get("/hr/leave-masters/active-leaves/");
        
        if (response.data.success && response.data.data) {
          setLeaveTypes(response.data.data);
        } else {
          setLeaveTypes([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch leave types:", err);
        setLeaveTypes([]);
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ BACKEND SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leaveData.leaveType || !leaveData.startDate || !leaveData.reason.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        leave_master: parseInt(leaveData.leaveType),
        from_date: leaveData.startDate,
        to_date: leaveData.endDate,
        reason: leaveData.reason,
      };

      await api.post("/hr/leave/", payload);

      alert("Leave request submitted successfully!");
      navigate("/leave-management");
    } catch (error) {
      console.error("Error submitting leave:", error);
      alert("Failed to submit leave request.");
    }
  };

  const handleCancel = () => {
    navigate("/leave-management");
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "dd-mm-yyyy";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Leave Details */}
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
                  disabled={loadingLeaveTypes}
                >
                  <option value="">{loadingLeaveTypes ? "Loading..." : "Select Leave Type"}</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.leave_name}
                    </option>
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
                placeholder="Write your leave reason..."
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
                placeholder="Additional details (optional)"
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

/* ========================== STYLES ========================== */

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
  },
  textarea: {
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    resize: "vertical",
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
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
