import React, { useState } from "react";
import api from "@/api/client";

export default function EarlyRequest() {
  const [form, setForm] = useState({
    date: "",
    minutesEarly: "",
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
      early_by_minutes: parseInt(form.minutesEarly, 10),
      reason: form.reason,
    };

    console.log("🔥 PAYLOAD SENT:", payload);

    try {
      await api.post("/hr/early-requests/", payload);
      window.history.back(); // success toast handled globally
    } catch (err) {
      // error toast is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h4 style={styles.title}>Early Request</h4>
          <button style={styles.backButton} onClick={() => window.history.back()}>
            ← Back to List
          </button>
        </div>

        <div style={styles.infoBanner}>
          <strong>Requesting as Admin</strong> — Your early leave request will be reviewed.
        </div>

        <form onSubmit={handleSubmit}>
          <section style={styles.section}>
            <h5 style={styles.sectionTitle}>Early Leave Information</h5>

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
                <label style={styles.label}>Minutes Early *</label>
                <input
                  type="number"
                  name="minutesEarly"
                  value={form.minutesEarly}
                  onChange={handleChange}
                  min="1"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ ...styles.formGroup, marginTop: "20px" }}>
              <label style={styles.label}>Reason *</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows="3"
                required
                style={styles.textarea}
              />
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
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ✅ Styles */
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
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "750px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { fontSize: "20px", fontWeight: "600", margin: 0 },
  backButton: {
    background: "#f3f4f6",
    color: "#111827",
    padding: "6px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
  },
  infoBanner: {
    backgroundColor: "#eef5ff",
    color: "#1e3a8a",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "25px",
    fontSize: "14px",
  },
  section: { marginBottom: "25px" },
  sectionTitle: { fontWeight: "600", marginBottom: "10px" },
  formRow: { display: "flex", gap: "15px", flexWrap: "wrap" },
  formGroup: { display: "flex", flexDirection: "column", flex: 1 },
  label: { fontSize: "13.5px", fontWeight: "500", marginBottom: "5px" },
  input: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
  },
  textarea: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    resize: "none",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "20px",
  },
  btnLight: {
    background: "#f3f4f6",
    padding: "10px 18px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
  },
  btnPrimary: {
    background: "#2563eb",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};
