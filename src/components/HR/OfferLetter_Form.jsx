import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function OfferLetterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    candidate: "",
    position: "",
    department: "",
    joining_data: "",
    salary: "",
    work_start_time: "09:30",
    work_end_time: "17:30",
    notice_period: "",
    body: "Dear Candidate,",
    terms_condition: "",
    subject: "Job Offer Letter",
  });

  const [candidateList, setCandidateList] = useState([]);

  // Fetch selected candidates
  const fetchCandidates = async () => {
    try {
      const res = await api.get("/offer-letter/selected-candidates/");
      setCandidateList(res.data.data);
    } catch (err) {
      console.error("Error fetching selected candidates", err);
    }
  };

  // Fetch candidate CV details
  const fetchCandidateDetails = async (candidateId) => {
    try {
      const res = await api.get(`/cv-management/${candidateId}/`);

      setFormData((prev) => ({
        ...prev,
        candidate: candidateId,
        position: res.data.job_title || "",
        department: res.data.department || "",
        salary: res.data.expected_salary || "",
      }));
    } catch (err) {
      console.error("Error fetching candidate details", err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.candidate) {
      alert("Please select a candidate");
      return;
    }

    // Auto-fix time format (backend needs HH:MM:SS)
    const dataToSend = {
      ...formData,
      work_start_time: formData.work_start_time + ":00",
      work_end_time: formData.work_end_time + ":00",
    };

    try {
      if (isEdit) {
        await api.put(`/offer-letter/${id}/`, dataToSend);
        alert("Offer letter updated successfully");
      } else {
        await api.post("/offer-letter/", dataToSend);
        alert("Offer letter created successfully");
      }

      navigate("/offer-letter");
    } catch (error) {
      console.error("Submit error:", error?.response?.data);
      alert("Something went wrong");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isEdit ? "Edit Offer Letter" : "Add Offer Letter"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Candidate */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Candidate:</label>
            <select
              style={styles.input}
              name="candidate"
              value={formData.candidate}
              onChange={(e) => {
                handleChange(e);
                fetchCandidateDetails(e.target.value);
              }}
              required
            >
              <option value="">-- Select Candidate --</option>

              {candidateList.map((item) => (
                <option key={item.candidate_id} value={item.candidate_id}>
                  {item.name} — {item.job_title_name}
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Position:</label>
            <input
              style={styles.input}
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>

          {/* Department */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Department:</label>
            <input
              style={styles.input}
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          {/* Joining Date */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Joining Date:</label>
            <input
              type="date"
              style={styles.input}
              name="joining_data"
              value={formData.joining_data}
              onChange={handleChange}
              required
              pattern="\d{4}-\d{2}-\d{2}"
            />
          </div>

          {/* Salary */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Salary:</label>
            <input
              style={styles.input}
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
            />
          </div>

          {/* Work Start / End */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Work Start Time:</label>
              <input
                type="time"
                style={styles.input}
                name="work_start_time"
                value={formData.work_start_time}
                onChange={handleChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>End Time:</label>
              <input
                type="time"
                style={styles.input}
                name="work_end_time"
                value={formData.work_end_time}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notice Period */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Notice Period (days):</label>
            <input
              style={styles.input}
              name="notice_period"
              value={formData.notice_period}
              onChange={handleChange}
            />
          </div>

          <button type="submit" style={styles.saveBtn}>
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

/* Styles — unchanged */
const styles = {
  pageContainer: { padding: "30px", background: "#f3f4f6", minHeight: "100vh" },
  card: {
    background: "#ffffff",
    width: "550px",
    margin: "0 auto",
    borderRadius: "12px",
    padding: "35px 40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "26px",
    fontWeight: "700",
    color: "#333",
  },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "15px", fontWeight: "600" },
  input: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
  },
  row: { display: "flex", gap: "15px" },
  saveBtn: {
    width: "100%",
    padding: "14px",
    background: "#0f8a4b",
    color: "#fff",
    fontSize: "17px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
