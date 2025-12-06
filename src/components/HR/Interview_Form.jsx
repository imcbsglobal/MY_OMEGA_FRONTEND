import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function OfferLetterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    candidate: "",
    job_title: "",
    department: "",
    joining_date: "",
    salary: "",
    work_start_time: "09:30",
    work_end_time: "17:30",
    notice_period: "",
    body: "Dear Candidate,",
    terms_condition: "As per company policy",
    subject: "Job Offer Letter",
  });

  const [candidateList, setCandidateList] = useState([]);
  const [jobTitles, setJobTitles] = useState([]); // ✅ Store job titles from master
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch selected candidates
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/offer-letter/selected-candidates/");
      setCandidateList(res.data.data);
    } catch (err) {
      console.error("Error fetching selected candidates", err);
      setError("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch job titles from master data API
  const fetchJobTitles = async () => {
    try {
      // Assuming your API endpoint for master job titles
      const res = await api.get("/master/job-titles/");
      
      // Adjust based on your API response structure
      const titles = res.data.data || res.data || [];
      setJobTitles(titles);
      console.log("Job titles loaded:", titles);
    } catch (err) {
      console.error("Error fetching job titles from master", err);
      // Optionally, you can set a default list as fallback
      setError("Failed to load job titles from master");
    }
  };

  // Fetch candidate CV details
  const fetchCandidateDetails = async (candidateId) => {
    if (!candidateId) return;

    try {
      setLoading(true);
      const res = await api.get(`/cv-management/cvs/${candidateId}/`);

      setFormData((prev) => ({
        ...prev,
        candidate: candidateId,
        job_title: res.data.data.job_title || "",
        department: res.data.data.department || "",
        salary: res.data.data.expected_salary || "",
        notice_period: "30",
      }));

      setError("");
    } catch (err) {
      console.error("Error fetching candidate details", err);
      setError("Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobTitles(); // ✅ Load job titles when component mounts
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCandidateChange = (e) => {
    const candidateId = e.target.value;
    setFormData(prev => ({
      ...prev,
      candidate: candidateId,
    }));

    if (candidateId) {
      fetchCandidateDetails(candidateId);
    } else {
      setFormData(prev => ({
        ...prev,
        job_title: "",
        department: "",
        salary: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.candidate) {
      alert("Please select a candidate");
      return;
    }

    const dataToSend = {
      candidate: formData.candidate,
      position: formData.job_title, // ✅ This will be the selected job title from dropdown
      department: formData.department,
      salary: Number(formData.salary),
      joining_data: formData.joining_date,
      work_start_time: formData.work_start_time,
      work_end_time: formData.work_end_time,
      notice_period: parseInt(formData.notice_period, 10) || 30,
      subject: formData.subject,
      body: formData.body,
      terms_condition: formData.terms_condition || "As per company policy",
    };

    console.log("Submitting data:", dataToSend);

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
      console.error("Submit error details:", error?.response?.data);
      alert(
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Offer Letter API Error"
      );
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isEdit ? "Edit Offer Letter" : "Add Offer Letter"}</h2>

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Candidate Dropdown */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Candidate:</label>
            <select
              style={styles.input}
              name="candidate"
              value={formData.candidate}
              onChange={handleCandidateChange}
              required
              disabled={loading}
            >
              <option value="">-- Select Candidate --</option>
              {candidateList.map((item) => (
                <option key={item.candidate_id} value={item.candidate_id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Job Title Dropdown - Shows all titles from master */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Title:</label>
            <select
              style={styles.input}
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Job Title --</option>
              {jobTitles.map((job, index) => {
                // Handle different response formats
                const title = job.title || job.name || job.job_title || job;
                const value = job.id ? String(job.id) : title;
                
                return (
                  <option key={index} value={value}>
                    {title}
                  </option>
                );
              })}
            </select>
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
              placeholder="e.g., Engineering"
            />
          </div>

          {/* Joining Date */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Joining Date:</label>
            <input
              type="date"
              style={styles.input}
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Salary */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Salary:</label>
            <input
              type="number"
              style={styles.input}
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              placeholder="e.g., 100000"
              min="0"
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
              type="number"
              style={styles.input}
              name="notice_period"
              value={formData.notice_period}
              onChange={handleChange}
              placeholder="e.g., 30"
              min="0"
            />
          </div>

          <button
            type="submit"
            style={styles.saveBtn}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

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
  errorBox: {
    backgroundColor: "#fee",
    border: "1px solid #f99",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "20px",
    color: "#c00",
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