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
          setLeaveTypes(response.data.data);
          console.log(`✅ Loaded ${response.data.count} leave types`);
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
          <h4 style={styles.title}>Request New Leave</h4>
          <button style={styles.backButton} onClick={() => window.history.back()}>
            ← Back to List
          </button>
        </div>

        {/* Employee Info Banner */}
        <div style={styles.infoBanner}>
          <strong>Requesting as:</strong> {employee.name || employee.username || employee.email || "Current User"}
          {(employee.emp_id || employee.id) && ` (ID: ${employee.emp_id || employee.id})`}
        </div>

        <div>

          {/* Leave Details */}
          <section style={styles.section}>
            <h5 style={styles.sectionTitle}>Leave Details</h5>
            <div style={styles.formRow}>

              <div style={styles.formGroup}>
                <label style={styles.label}>Leave Type *</label>
                {loadingLeaveTypes ? (
                  <select style={styles.select} disabled>
                    <option>Loading leave types...</option>
                  </select>
                ) : leaveTypes.length === 0 ? (
                  <div>
                    <select style={styles.select} disabled>
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
                    style={styles.select}
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((leave) => (
                      <option key={leave.id} value={leave.id}>
                        {leave.leave_name} 
                        {leave.leave_date && ` (${new Date(leave.leave_date).toLocaleDateString()})`}
                        {leave.payment_status === 'paid' ? ' - Paid' : ' - Unpaid'}
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

          {/* Leave Info */}
          <section style={styles.section}>
            <h5 style={styles.sectionTitle}>Leave Information</h5>
            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
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
              </div>
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
    </div>
  );
}

/* =======================
   STYLES
======================= */
const styles = {
  container: { 
    padding: "40px", 
    backgroundColor: "#f9fafb", 
    display: "flex", 
    justifyContent: "center", 
    minHeight: "calc(100vh - 120px)" 
  },
  card: { 
    backgroundColor: "#ffffff", 
    padding: "30px 40px", 
    borderRadius: "10px", 
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)", 
    width: "100%", 
    maxWidth: "950px" 
  },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "20px" 
  },
  title: { 
    fontSize: "20px", 
    fontWeight: "600", 
    margin: 0 
  },
  backButton: { 
    background: "#f3f4f6", 
    color: "#111827", 
    padding: "6px 16px", 
    borderRadius: "6px", 
    border: "1px solid #d1d5db", 
    cursor: "pointer", 
    fontSize: "14px" 
  },
  infoBanner: { 
    backgroundColor: "#eef5ff", 
    color: "#1e3a8a", 
    padding: "10px 14px", 
    borderRadius: "8px", 
    marginBottom: "25px", 
    fontSize: "14px" 
  },
  section: { 
    marginBottom: "25px" 
  },
  sectionTitle: { 
    fontWeight: "600", 
    marginBottom: "10px", 
    color: "#111827" 
  },
  formRow: { 
    display: "flex", 
    gap: "15px", 
    flexWrap: "wrap" 
  },
  formGroup: { 
    display: "flex", 
    flexDirection: "column", 
    flex: "1" 
  },
  label: { 
    fontSize: "13.5px", 
    fontWeight: "500", 
    marginBottom: "5px" 
  },
  input: { 
    padding: "8px 10px", 
    borderRadius: "6px", 
    border: "1px solid #d1d5db", 
    outline: "none", 
    fontSize: "14px" 
  },
  select: { 
    padding: "8px 10px", 
    borderRadius: "6px", 
    border: "1px solid #d1d5db", 
    fontSize: "14px" 
  },
  textarea: { 
    padding: "8px 10px", 
    borderRadius: "6px", 
    border: "1px solid #d1d5db", 
    resize: "none", 
    fontSize: "14px" 
  },
  buttonRow: { 
    display: "flex", 
    justifyContent: "flex-end", 
    gap: "12px", 
    marginTop: "20px" 
  },
  btnLight: { 
    background: "#f3f4f6", 
    color: "#111827", 
    padding: "10px 18px", 
    borderRadius: "6px", 
    border: "1px solid #d1d5db", 
    cursor: "pointer", 
    fontWeight: "500" 
  },
  btnPrimary: { 
    background: "#2563eb", 
    color: "#ffffff", 
    padding: "10px 18px", 
    borderRadius: "6px", 
    border: "none", 
    cursor: "pointer", 
    fontWeight: "500" 
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