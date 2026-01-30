import React, { useState, useEffect } from "react";
import api from "@/api/client";

export default function LeaveRequest() {
  const [form, setForm] = useState({
    leaveMaster: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(true);

  // Fetch logged-in user's information
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        let response;
        try {
          response = await api.get("/users/me/");
        } catch {
          try {
            response = await api.get("/auth/me/");
          } catch {
            try {
              response = await api.get("/api/users/current/");
            } catch {
              response = await api.get("/users/current/");
            }
          }
        }
        setEmployee(response.data);
        console.log("✅ User data loaded:", response.data);
      } catch (err) {
        console.error("❌ Failed to fetch user info:", err);
        const token = localStorage.getItem("accessToken") || 
                     localStorage.getItem("access") || 
                     localStorage.getItem("token");
        
        if (token) {
          setEmployee({ 
            name: "Current User",
            note: "User details will be fetched from authentication token"
          });
        }
      } finally {
        setFetchingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch available leave types from Leave Master
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        setLoadingLeaveTypes(true);
        console.log("🔍 Fetching leave types from Leave Master...");
        
        // Call the active-leaves endpoint
        const response = await api.get("/hr/leave-masters/active-leaves/");
        
        console.log("📦 Leave types response:", response.data);
        
        if (response.data.success && response.data.data) {
          // Filter to show only CASUAL LEAVE and SICK LEAVE
          const filteredLeaves = response.data.data.filter(
            leave => leave.leave_name && 
                     (leave.leave_name.toUpperCase().includes('CASUAL') || 
                      leave.leave_name.toUpperCase().includes('SICK'))
          );
          setLeaveTypes(filteredLeaves);
          console.log(`✅ Loaded ${filteredLeaves.length} leave types (filtered to casual and sick)`);
        } else {
          console.warn("⚠️ No leave types found");
          setLeaveTypes([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch leave types:", err);
        console.error("Error details:", err?.response?.data);
        setLeaveTypes([]);
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employee) {
      return;
    }

    if (!form.leaveMaster) {
      alert("❌ Please select a leave type");
      return;
    }

    setLoading(true);

    const payload = {
      leave_master: parseInt(form.leaveMaster),
      from_date: form.startDate,
      to_date: form.endDate,
      reason: form.reason,
    };

    console.log("🔥 PAYLOAD SENT:", payload);

    try {
      await api.post("/hr/leave/", payload);
      alert("✅ Leave request submitted successfully!");
      window.history.back();
    } catch (err) {
      console.error("❌ Leave request failed:", err);
      console.error("Error response:", err?.response?.data);
      alert(
        "❌ Failed to submit leave request. " +
        (err?.response?.data?.detail || err?.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ textAlign: "center", padding: "20px" }}>Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ textAlign: "center", padding: "20px", color: "#dc2626" }}>
            Failed to load user information. Please login again.
          </p>
          <div style={{ textAlign: "center" }}>
            <button 
              onClick={() => window.location.href = "/login"} 
              style={styles.btnPrimary}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h4 style={styles.title}>Leave Request</h4>
          <button style={styles.backButton} onClick={() => window.history.back()}>
            ← Back to List
          </button>
        </div>

        <div style={styles.infoBanner}>
          <strong>Requesting as: {employee.name || employee.username || employee.email || "Current User"}</strong>
          {(employee.emp_id || employee.id) && ` (ID: ${employee.emp_id || employee.id})`}
        </div>

        <section style={styles.section}>
          <h5 style={styles.sectionTitle}>Leave Details</h5>
          <div style={styles.formRow}>

            <div style={styles.formGroup}>
              <label style={styles.label}>Leave Type *</label>
              {loadingLeaveTypes ? (
                <select style={styles.input} disabled>
                  <option>Loading leave types...</option>
                </select>
              ) : leaveTypes.length === 0 ? (
                <div>
                  <select style={styles.input} disabled>
                    <option>No leave types available</option>
                  </select>
                  <p style={styles.warningText}>
                    ⚠️ No leave types found. Please contact HR to add leave types in the Leave Master section.
                  </p>
                </div>
              ) : (
                <select
                  name="leaveMaster"
                  value={form.leaveMaster}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((leave) => (
                    <option key={leave.id} value={leave.id}>
                      {leave.leave_name}
                      {leave.leave_date && ` (${new Date(leave.leave_date).toLocaleDateString()})`}
                    </option>
                  ))}
                </select>
              )}
              {form.leaveMaster && leaveTypes.length > 0 && (
                <p style={styles.helpText}>
                  {(() => {
                    const selectedLeave = leaveTypes.find(l => l.id === parseInt(form.leaveMaster));
                    return selectedLeave ? (
                      <>
                        <strong>Category:</strong> {selectedLeave.category_display} | 
                        <strong> Status:</strong> {selectedLeave.payment_status_display}
                        {selectedLeave.description && (
                          <><br/><strong>Description:</strong> {selectedLeave.description}</>
                        )}
                      </>
                    ) : null;
                  })()}
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

          </div>
        </section>

        <section style={styles.section}>
          <h5 style={styles.sectionTitle}>Reason for Leave</h5>
          <div style={styles.formGroup}>
            <label style={styles.label}>Reason *</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows="4"
              style={styles.textarea}
              required
              placeholder="Please provide detailed reason for your leave request"
            />
            <span style={styles.fieldHint}>Provide a clear and detailed reason for your leave request</span>
          </div>
        </section>

        <div style={styles.buttonRow}>
          <button type="button" onClick={() => window.history.back()} style={styles.btnLight}>
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            style={styles.btnPrimary} 
            disabled={loading || loadingLeaveTypes || leaveTypes.length === 0}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* =======================
   STYLES
======================= */
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#ffe0e0",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "100%",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    position: "relative",
    "@media (max-width: 640px)": {
      maxWidth: "100%",
      borderRadius: "12px",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
    color: "#111827",
  },
  backButton: {
    background: "#f3f4f6",
    color: "#111827",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  infoBanner: {
    backgroundColor: "#ffe0e0",
    color: "#c1121f",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "25px",
    fontSize: "14px",
    lineHeight: "1.5",
    border: "1px solid #ffb3b3",
  },
  section: {
    marginBottom: "25px",
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: "15px",
    color: "#111827",
    fontSize: "16px",
  },
  formRow: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: "150px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    transition: "border-color 0.2s",
    outline: "none",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    resize: "vertical",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    outline: "none",
  },
  fieldHint: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },
  btnLight: {
    background: "#f3f4f6",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    transition: "all 0.2s",
  },
  btnPrimary: {
    background: "#dc2626",
    color: "#fff",
    padding: "10px 24px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  helpText: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "5px",
    lineHeight: "1.4"
  },
  warningText: {
    fontSize: "12px",
    color: "#dc2626",
    marginTop: "5px",
    padding: "8px",
    backgroundColor: "#fef2f2",
    borderRadius: "4px"
  }
};