// src/pages/CVView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CV, toUi } from "../../api/cv";

export default function CVView() {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await CV.get(uuid);
        setCvData(toUi(data));
      } catch (e) {
        console.error(e);
        alert("CV not found");
        navigate("/cv-management");
      } finally {
        setLoading(false);
      }
    })();
  }, [uuid]);

  const handleBack = () => navigate("/cv-management");
  const handleEdit = () => navigate(`/cv-management/edit/${uuid}`);
  const handleViewCV = () => {
    if (cvData?.cvAttachmentUrl) window.open(cvData.cvAttachmentUrl, "_blank");
    else alert("No CV attachment available");
  };

  const styles = {
    container: {
      padding: "40px",
      maxWidth: "800px",
      margin: "0 auto",
      fontFamily: "Inter, sans-serif",
      color: "#1f2937",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "30px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "600",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
    },
    button: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
    },
    backButton: {
      backgroundColor: "#9ca3af",
    },
    section: {
      marginBottom: "20px",
    },
    label: {
      fontWeight: "600",
      color: "#374151",
    },
    value: {
      marginTop: "4px",
      color: "#111827",
    },
  };

  if (loading) {
    return (
      <div
        style={{
          ...styles.container,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: "18px", color: "#6b7280" }}>
          Loading CV details...
        </div>
      </div>
    );
  }

  if (!cvData) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>CV Details</h2>
          <div style={styles.buttonGroup}>
            <button onClick={handleBack} style={{ ...styles.button, ...styles.backButton }}>
              ← Back
            </button>
            <button onClick={handleEdit} style={styles.button}>
              Edit
            </button>
            <button onClick={handleViewCV} style={styles.button}>
              View CV
            </button>
          </div>
        </div>

        {Object.entries({
          Name: cvData.name,
          "Job Title": cvData.jobTitle,
          Gender: cvData.gender,
          Email: cvData.email,
          "Phone Number": cvData.phoneNumber,
          Place: cvData.place,
          District: cvData.district,
          Address: cvData.address,
          Education: cvData.education,
          Experience: cvData.experience,
          "Date of Birth": cvData.dob,
          "CV Source": cvData.cvSource,
          "Interview Status": cvData.interviewStatus,
          Remarks: cvData.remarks,
          "CV File Name": cvData.cvFileName,
        }).map(([label, value]) => (
          <div key={label} style={styles.section}>
            <div style={styles.label}>{label}</div>
            <div style={styles.value}>{value || "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
