import React, { useState } from "react";
import api from "@/api/client";

export default function LateRequest() {
  const [form, setForm] = useState({
    date: "",
    minutesLate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      date: form.date,
      late_by_minutes: parseInt(form.minutesLate),
      reason: form.reason,
    };

    console.log("🔥 PAYLOAD SENT:", payload);

    // Validate form
    if (!form.date || !form.minutesLate || !form.reason) {
      alert("❌ Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        date: form.date,
        late_by_minutes: parseInt(form.minutesLate),
        reason: form.reason,
      };

      console.log("📤 Submitting late request:", payload);

      // ✅ FIXED: Remove leading slash to avoid double slash
      await api.post("hr/late-requests/", payload);

      alert("✅ Late request submitted successfully!");
      window.history.back();
    } catch (err) {
      console.error("❌ Late request failed:", err);
      
      // Better error handling
      const errorMessage = err?.response?.data?.detail 
        || err?.response?.data?.error
        || err?.response?.data?.message
        || err?.message
        || "Unknown error occurred";
      
      alert(`❌ Failed to submit late request. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h4 style={styles.title}>Late Arrival Request</h4>
          <button style={styles.backButton} onClick={() => window.history.back()}>
            ← Back to List
          </button>
        </div>

        <div style={styles.infoBanner}>
          <strong>Late Arrival Request</strong> – Submit a request for arriving late to work.
        </div>

        <div>
          <section style={styles.section}>
            <h5 style={styles.sectionTitle}>Late Arrival Information</h5>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Minutes Late *</label>
                <input
                  type="number"
                  name="minutesLate"
                  value={form.minutesLate}
                  onChange={handleChange}
                  min="1"
                  max="240"
                  placeholder="e.g., 15"
                  required
                  style={styles.input}
                />
                <span style={styles.fieldHint}>How many minutes after your scheduled time?</span>
              </div>
            </div>

            <div style={{ ...styles.formGroup, marginTop: "20px" }}>
              <label style={styles.label}>Reason *</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows="4"
                placeholder="Please provide a reason for arriving late..."
                style={styles.textarea}
                required
              />
              <span style={styles.fieldHint}>Provide a clear reason for your late arrival</span>
            </div>
          </section>

          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.btnLight}
              onClick={() => window.history.back()}
            >
              Cancel
            </button>

            <button 
              type="button" 
              onClick={handleSubmit}
              style={styles.btnPrimary} 
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f9fafb",
    display: "flex",
    justifyContent: "center",
    minHeight: "calc(100vh - 120px)",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "30px 40px",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    width: "100%",
    maxWidth: "750px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { 
    fontSize: "20px", 
    fontWeight: "600", 
    margin: 0,
    color: "#111827"
  },
  backButton: {
    background: "#f3f4f6",
    color: "#111827",
    padding: "6px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  infoBanner: {
    backgroundColor: "#eef5ff",
    color: "#1e3a8a",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "25px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  section: { 
    marginBottom: "25px" 
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
    flexWrap: "wrap" 
  },
  formGroup: { 
    display: "flex", 
    flexDirection: "column", 
    flex: "1",
    minWidth: "200px",
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
    outline: "none",
    fontSize: "14px",
    transition: "border-color 0.2s",
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
  },
  btnLight: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  btnPrimary: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 24px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s",
  },
};