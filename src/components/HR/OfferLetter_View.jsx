import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function OfferLetterView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("offer-letter-management-data")) || [];
    const found = storedData.find((r) => r.id === parseInt(id));
    if (found) setRecord(found);
  }, [id]);

  if (!record)
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.errorText}>Record not found</p>
          <button style={styles.secondaryBtn} onClick={() => navigate("/offer-letter")}>
            Back
          </button>
        </div>
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Offer Letter Details</h2>
      </div>

      <div style={styles.card}>
        <div style={styles.grid}>
          {Object.entries(record).map(([key, value]) => (
            <div key={key} style={styles.fieldGroup}>
              <label style={styles.label}>{formatLabel(key)}</label>
              {key.toLowerCase().includes("url") ? (
                <a href={value} target="_blank" rel="noreferrer" style={styles.link}>
                  View File
                </a>
              ) : (
                <p style={styles.value}>{value || "N/A"}</p>
              )}
            </div>
          ))}
        </div>

        <div style={styles.actions}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate(`/offer-letter/edit/${record.id}`)}
          >
            Edit
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate("/offer-letter")}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

function formatLabel(text) {
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// -------------------- STYLES --------------------
const styles = {
  page: {
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    width: "100%",
    maxWidth: "800px",
    textAlign: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "800px",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  value: {
    fontSize: "15px",
    color: "#111827",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "10px 12px",
  },
  link: {
    fontSize: "15px",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "500",
    backgroundColor: "#eef2ff",
    borderRadius: "8px",
    padding: "10px 12px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px",
  },
  primaryBtn: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "10px 22px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
  },
  secondaryBtn: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    padding: "10px 22px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
  },
  errorText: {
    textAlign: "center",
    color: "#dc2626",
    fontWeight: "600",
    fontSize: "16px",
  },
};
