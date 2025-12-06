import React, { useState, useEffect } from "react";
import api from "@/api/client";

export default function LeaveRequest() {
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    note: "",
  });

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  // Fetch logged-in user's information
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Try multiple possible endpoints for getting current user
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
        console.error("Response:", err?.response?.data);
        
        // If all endpoints fail, we can still allow submission if token exists
        const token = localStorage.getItem("accessToken") || 
                     localStorage.getItem("access") || 
                     localStorage.getItem("token");
        
        if (token) {
          // Set a minimal employee object - backend will use token to identify user
          setEmployee({ 
            name: "Current User",
            note: "User details will be fetched from authentication token"
          });
        } else {
          alert("❌ No authentication found. Please login again.");
        }
      } finally {
        setFetchingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employee) {
      alert("⚠️ User information not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);

    // If we have employee.id, send it; otherwise backend should get user from token
    const payload = {
      leave_type: form.leaveType,
      from_date: form.startDate,
      to_date: form.endDate,
      reason: form.reason,
      note: form.note,
    };

    // Only add user field if we have an ID
    if (employee.id || employee.emp_id || employee.user_id) {
      payload.user = employee.id || employee.emp_id || employee.user_id;
    }

    console.log("🔥 PAYLOAD SENT:", payload);

    try {
      const response = await api.post("/hr/leave-requests/", payload);
      console.log("✅ Response:", response.data);
      alert("✅ Leave request submitted successfully!");
      window.history.back();
    } catch (err) {
      console.log("🔥 FULL BACKEND ERROR:", err?.response?.data);
      console.log("🔥 STATUS CODE:", err?.response?.status);
      
      const errorMsg = err?.response?.data?.detail || 
                      err?.response?.data?.message ||
                      JSON.stringify(err?.response?.data) ||
                      "Unknown error";
      
      alert(`❌ Failed to submit leave request.\n\nError: ${errorMsg}`);
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
                <select
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="emergency">Emergency Leave</option>
                </select>
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
                  rows="3"
                  style={styles.textarea}
                  required
                  placeholder="Brief reason for leave request"
                />
              </div>

              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Additional Details</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows="3"
                  style={styles.textarea}
                  placeholder="Any additional information (optional)"
                />
              </div>
            </div>
          </section>

          <div style={styles.buttonRow}>
            <button type="button" onClick={() => window.history.back()} style={styles.btnLight}>
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} style={styles.btnPrimary} disabled={loading}>
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
};