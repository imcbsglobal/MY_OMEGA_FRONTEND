// src/pages/Interview_Form.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function Interview_Form() {
  const navigate = useNavigate();
  const [cvCandidates, setCvCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch CV list from API
  useEffect(() => {
    const fetchCvs = async () => {
      try {
        const res = await api.get("/interview-management/cvs-for-interview/");
        setCvCandidates(res.data.data || []);
      } catch (err) {
        console.error("Error fetching CV list:", err);
        alert("Failed to load candidate list.");
      }
    };
    fetchCvs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCandidate) {
      alert("Please select a candidate before saving.");
      return;
    }

    try {
      setLoading(true);
      const data = {
        candidate_id: selectedCandidate,
        scheduled_at: new Date().toISOString(),
      };
      const res = await api.post("/interview-management/start-interview/", data);
      alert(res.data.message || "Interview started successfully!");
      navigate("/interview-management");
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add Interview Management</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Name:</label>
            <select
              style={styles.select}
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
            >
              <option value="">-- Select Candidate --</option>
              {cvCandidates.length > 0 ? (
                cvCandidates.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.name} - {cv.job_title_name}
                  </option>
                ))
              ) : (
                <option disabled>No candidates available</option>
              )}
            </select>
          </div>

          <button type="submit" style={styles.saveBtn} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "100px",
  },
  card: {
    backgroundColor: "white",
    padding: "30px 50px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    minWidth: "420px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "25px",
  },
  formGroup: {
    textAlign: "left",
    marginBottom: "25px",
  },
  label: {
    display: "block",
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#111827",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    outline: "none",
  },
  saveBtn: {
    width: "100%",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 0",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
