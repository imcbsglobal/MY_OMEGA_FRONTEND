// src/pages/Interview_View.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function Interview_View() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/api/interview-management/${id}/`);
        setInterviewData(res.data.data);
        setStatus(res.data.data.status);
      } catch (err) {
        console.error("Error loading interview:", err);
        alert("Failed to load interview data!");
        navigate("/interview-management");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id, navigate]);

  const handleStatusUpdate = async () => {
    try {
      const res = await api.patch(
        `/api/interview-management/${id}/update-status/`,
        { status, remark }
      );
      alert(res.data.message || "Status updated successfully!");
      setInterviewData(res.data.data);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update interview status!");
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>
          Loading interview details...
        </p>
      </div>
    );
  }

  if (!interviewData) return null;

  return (
    <div style={styles.container}>
      <div style={styles.viewCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>Interview Details</h2>
          <button onClick={() => navigate("/interview-management")} style={styles.backButton}>
            ← Back to List
          </button>
        </div>

        <div style={styles.viewGrid}>
          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Name</span>
            <span style={styles.viewValue}>{interviewData.candidate?.name}</span>
          </div>
          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Email</span>
            <span style={styles.viewValue}>{interviewData.candidate?.email}</span>
          </div>
          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Job Title</span>
            <span style={styles.viewValue}>
              {interviewData.candidate?.job_title_name}
            </span>
          </div>
          <div style={styles.viewField}>
            <span style={styles.viewLabel}>Status</span>
            <span style={styles.viewValue}>{interviewData.status}</span>
          </div>
        </div>

        <div style={styles.viewFooter}>
          <h3>Update Status</h3>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.select}
          >
            <option value="pending">Pending</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add remark..."
            style={styles.textarea}
          />
          <button onClick={handleStatusUpdate} style={styles.updateBtn}>
            Update
          </button>
        </div>
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
  viewCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "1000px",
    margin: "0 auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e5e7eb",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "12px",
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
  editButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  viewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  },
  viewField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  viewLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  viewValue: {
    fontSize: "15px",
    color: "#111827",
    fontWeight: "500",
  },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
    width: "fit-content",
  },
  viewCvBtn: {
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "fit-content",
    textAlign: "left",
  },
  viewFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  closeBtn: {
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
};