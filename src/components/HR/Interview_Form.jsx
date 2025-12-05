// src/pages/Interview_Form.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function Interview_Form() {
  const navigate = useNavigate();
  const [cvCandidates, setCvCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableCandidates();
  }, []);

  const fetchAvailableCandidates = async () => {
    try {
      // Use the new endpoint that filters for 'selected' candidates
      const res = await api.get("/interview-management/cvs-for-interview/");
      
      console.log("Full API response:", res.data);
      
      const list = res.data?.data || [];
      console.log("Available candidates for interview:", list);
      
      // Verify each candidate has correct ID format
      list.forEach(candidate => {
        console.log(`Candidate: ${candidate.name}, ID: ${candidate.id}, Type: ${typeof candidate.id}`);
      });
      
      setCvCandidates(list);
      
      if (list.length === 0) {
        console.warn("No candidates available. Make sure CVs have 'selected' status.");
      }
    } catch (err) {
      console.error("Error fetching CV list:", err);
      console.error("Error response:", err.response?.data);
      alert("Failed to load candidate list. Check console for details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCandidate) {
      alert("Please select a candidate before saving.");
      return;
    }

    try {
      setLoading(true);
      
      // Log the request data
      const requestData = {
        candidate_id: selectedCandidate,
        scheduled_at: new Date().toISOString(),
      };
      
      console.log("Starting interview with data:", requestData);
      console.log("Selected candidate ID type:", typeof selectedCandidate);
      
      const res = await api.post("/interview-management/start-interview/", requestData);
      
      console.log("Interview started successfully:", res.data);
      
      // Show success message
      const candidateName = cvCandidates.find(c => c.id === selectedCandidate)?.name || "Candidate";
      alert(`Interview started successfully for ${candidateName}!`);
      
      // Navigate to interview list
      navigate("/interview-management");
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      
      // Extract detailed error message
      let errorMsg = "Failed to start interview!";
      
      if (error.response?.data) {
        const data = error.response.data;
        console.log("Error data:", data);
        
        // Handle different error formats
        if (data.message) {
          errorMsg = data.message;
        } else if (data.details) {
          if (typeof data.details === 'string') {
            errorMsg = data.details;
          } else if (data.details.candidate_id) {
            errorMsg = Array.isArray(data.details.candidate_id) 
              ? data.details.candidate_id[0] 
              : data.details.candidate_id;
          } else {
            errorMsg = JSON.stringify(data.details);
          }
        } else if (data.error) {
          errorMsg = `Error: ${data.error}`;
        }
      }
      
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add Interview Management</h2>

        {cvCandidates.length === 0 && (
          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              ℹ️ No candidates available for interview. 
              <br />
              Please add candidates with "Selected" status in CV Management first.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Candidate:</label>
            <select
              style={styles.select}
              value={selectedCandidate}
              onChange={(e) => {
                const candidateId = e.target.value;
                console.log("Selected candidate ID:", candidateId, "Type:", typeof candidateId);
                setSelectedCandidate(candidateId);
              }}
              disabled={cvCandidates.length === 0}
            >
              <option value="">-- Select Candidate --</option>
              {cvCandidates.length > 0 ? (
                cvCandidates.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.name} - {cv.job_title_name || cv.job_title || "No Job Title"} ({cv.place || "No Location"})
                  </option>
                ))
              ) : (
                <option disabled>No candidates available</option>
              )}
            </select>
            <small style={styles.helpText}>
              Only candidates with "Selected" status are shown
            </small>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.saveBtn,
              ...(cvCandidates.length === 0 || loading ? styles.saveBtnDisabled : {})
            }}
            disabled={loading || cvCandidates.length === 0}
          >
            {loading ? "Saving..." : "Start Interview"}
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
  infoBox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
  },
  infoText: {
    fontSize: "14px",
    color: "#1e40af",
    margin: 0,
    lineHeight: "1.6",
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
  helpText: {
    display: "block",
    marginTop: "6px",
    fontSize: "13px",
    color: "#6b7280",
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
    transition: "background-color 0.2s",
  },
  saveBtnDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    opacity: 0.6,
  },
};