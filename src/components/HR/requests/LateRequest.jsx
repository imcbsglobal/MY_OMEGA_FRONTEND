import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/client";

export default function LateRequest() {
  const navigate = useNavigate();

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

    try {
      await api.post("/hr/late-requests/", payload);
      navigate(-1); // success toast handled globally
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
          <h4 style={styles.title}>Late Request</h4>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ← Back to List
          </button>
        </div>

        <div style={styles.infoBanner}>
          <strong>Requesting as Admin</strong> — Your request will be reviewed
          by the system.
        </div>

        <form onSubmit={handleSubmit}>
          <section style={styles.section}>
            <h5 style={styles.sectionTitle}>Late Information</h5>

            <div style={styles.formRow}>
              {/* DATE */}
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

              {/* MINUTES LATE */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Minutes Late *</label>
                <input
                  type="number"
                  name="minutesLate"
                  value={form.minutesLate}
                  onChange={handleChange}
                  min="1"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* REASON */}
            <div style={{ ...styles.formGroup, marginTop: "20px" }}>
              <label style={styles.label}>Reason *</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows="3"
                style={styles.textarea}
                required
              />
            </div>
          </section>

          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.btnLight}
              onClick={() => navigate(-1)}
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

/* SAME STYLES YOU HAD — NO CHANGES */
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
  title: { fontSize: "20px", fontWeight: "600", margin: 0 },
  backButton: {
    background: "#f3f4f6",
    color: "#111827",
    padding: "6px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: "14px",
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
  sectionTitle: { fontWeight: "600", marginBottom: "10px", color: "#111827" },
  formRow: { display: "flex", gap: "15px", flexWrap: "wrap" },
  formGroup: { display: "flex", flexDirection: "column", flex: "1" },
  label: { fontSize: "13.5px", fontWeight: "500", marginBottom: "5px" },
  input: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },
  textarea: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    resize: "none",
    fontSize: "14px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "20px",
  },
  btnLight: {
    background: "#f3f4f6",
    color: "#111827",
    padding: "10px 18px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontWeight: "500",
  },
  btnPrimary: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
  },
};
