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
    job_title_id: "",
    department: "",
    department_id: "",
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
  const [jobTitles, setJobTitles] = useState([]);
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

  // ✅ Fetch job titles from master data
  const fetchJobTitles = async () => {
    try {
      const res = await api.get("/cv-management/job-titles/");
      
      // Based on your JobTitles component, response format is: { data: [...] }
      const titles = Array.isArray(res.data.data) ? res.data.data : [];
      setJobTitles(titles);
      console.log("Job titles loaded from master:", titles);
    } catch (err) {
      console.error("Error fetching job titles from master", err);
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

  // Handle job title selection
  const handleJobTitleChange = (e) => {
    const selectedJobTitleId = e.target.value;
    
    if (!selectedJobTitleId) {
      // Clear both job title and department if no selection
      setFormData(prev => ({
        ...prev,
        job_title_id: "",
        job_title: "",
        department_id: "",
        department: "",
      }));
      return;
    }

    const selectedJobTitle = jobTitles.find(job => 
      job.uuid === selectedJobTitleId || job.id.toString() === selectedJobTitleId
    );

    if (selectedJobTitle) {
      setFormData(prev => ({
        ...prev,
        job_title_id: selectedJobTitleId,
        job_title: selectedJobTitle.title || "",
        department_id: selectedJobTitle.department || "",
        department: selectedJobTitle.department_detail?.name || "No Department",
      }));

      console.log("Selected job title:", selectedJobTitle);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobTitles();
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

    if (!formData.job_title_id) {
      alert("Please select a job title");
      return;
    }

    const dataToSend = {
      candidate: formData.candidate,
      position: formData.job_title,
      department: formData.department,
      department_id: formData.department_id,
      job_title_id: formData.job_title_id,
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
            <label style={styles.label}>
              Select Candidate <span style={{ color: "#ef4444" }}>*</span>
            </label>
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

          {/* ✅ Job Title Dropdown - From Master Data */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Job Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              style={styles.input}
              name="job_title_id"
              value={formData.job_title_id}
              onChange={handleJobTitleChange}
              required
            >
              <option value="">-- Select Job Title --</option>
              {jobTitles.map((item) => (
                <option 
                  key={item.uuid || item.id} 
                  value={item.uuid || item.id}
                >
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Department - Auto-filled from job title selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Department <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={styles.departmentContainer}>
              <input
                style={styles.departmentInput}
                name="department"
                value={formData.department}
                readOnly
                placeholder="Will be auto-filled from job title"
              />
              {formData.department_id && (
                <div style={styles.departmentBadge}>
                  ID: {formData.department_id}
                </div>
              )}
            </div>
            <small style={styles.hint}>
              Department is automatically set based on the selected job title
            </small>
          </div>

          {/* Joining Date */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Joining Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
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
            <label style={styles.label}>
              Salary <span style={{ color: "#ef4444" }}>*</span>
            </label>
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
            <div style={{...styles.formGroup, flex: 1}}>
              <label style={styles.label}>Work Start Time</label>
              <input
                type="time"
                style={styles.input}
                name="work_start_time"
                value={formData.work_start_time}
                onChange={handleChange}
              />
            </div>

            <div style={{...styles.formGroup, flex: 1}}>
              <label style={styles.label}>End Time</label>
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
            <label style={styles.label}>Notice Period (days)</label>
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

          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={() => navigate("/offer-letter")}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.saveBtn}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { 
    padding: "30px", 
    background: "#f3f4f6", 
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center"
  },
  card: {
    background: "#ffffff",
    width: "600px",
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
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px" 
  },
  formGroup: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "6px" 
  },
  label: { 
    fontSize: "15px", 
    fontWeight: "600",
    color: "#374151"
  },
  input: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    transition: "border-color 0.2s",
    backgroundColor: "#fff",
  },
  departmentContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  departmentInput: {
    flex: 1,
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    backgroundColor: "#f8fafc",
    color: "#374151",
    cursor: "not-allowed",
  },
  departmentBadge: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  row: { 
    display: "flex", 
    gap: "15px",
  },
  hint: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
    fontStyle: "italic",
  },
  buttonContainer: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },
  cancelBtn: {
    flex: 1,
    padding: "14px",
    background: "#6b7280",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    transition: "background-color 0.2s",
  },
  saveBtn: {
    flex: 1,
    padding: "14px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    transition: "background-color 0.2s",
  },
};