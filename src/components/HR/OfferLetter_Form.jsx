// OfferLetter_Form.jsx - ENHANCED FIXED VERSION
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
    basic_pay: "",
    dearness_allowance: "",
    house_rent_allowance: "",
    special_allowance: "",
    conveyance_earnings: "",
    work_start_time: "09:30",
    work_end_time: "17:30",
    notice_period: "30",
    body: "Dear Candidate,",
    terms_condition: "As per company policy",
    subject: "Job Offer Letter",
  });

  const [candidateList, setCandidateList] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

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

  const fetchJobTitles = async () => {
    try {
      const res = await api.get("/cv-management/job-titles/");
      const titles = Array.isArray(res.data.data) ? res.data.data : [];
      setJobTitles(titles);
    } catch (err) {
      console.error("Error fetching job titles from master", err);
      setError("Failed to load job titles from master");
    }
  };

  const fetchCandidateDetails = async (candidateId) => {
    if (!candidateId) return;
    try {
      setLoading(true);
      const res = await api.get(`/cv-management/cvs/${candidateId}/`);
      const candidateData = res.data.data;
      
      console.log("=== FETCHED CANDIDATE DETAILS ===");
      console.log("Candidate data:", candidateData);
      
      setFormData((prev) => ({
        ...prev,
        candidate: candidateId,
        job_title: candidateData.job_title || "",
        department: candidateData.department || "",
        salary: candidateData.expected_salary || "",
        basic_pay: candidateData.expected_salary ? Math.round(parseFloat(candidateData.expected_salary) * 0.4) : "",
        dearness_allowance: candidateData.expected_salary ? Math.round(parseFloat(candidateData.expected_salary) * 0.2) : "",
        house_rent_allowance: candidateData.expected_salary ? Math.round(parseFloat(candidateData.expected_salary) * 0.3) : "",
        special_allowance: candidateData.expected_salary ? Math.round(parseFloat(candidateData.expected_salary) * 0.05) : "",
        conveyance_earnings: candidateData.expected_salary ? Math.round(parseFloat(candidateData.expected_salary) * 0.05) : "",
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

  const fetchOfferLetterData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/offer-letter/${id}/`);
      const data = res.data.data;
      
      console.log("=== FETCHED OFFER LETTER FOR EDIT ===");
      console.log("Full data:", data);
      console.log("Salary breakdown:", {
        basic_pay: data.basic_pay,
        dearness_allowance: data.dearness_allowance,
        house_rent_allowance: data.house_rent_allowance,
        special_allowance: data.special_allowance,
        conveyance_earnings: data.conveyance_earnings,
        salary: data.salary
      });

      setFormData({
        candidate: data.candidate || "",
        job_title: data.position || "",
        job_title_id: data.job_title_id || "",
        department: data.department || "",
        department_id: data.department_id || "",
        joining_date: data.joining_data || "",
        salary: data.salary || "",
        basic_pay: data.basic_pay || "",
        dearness_allowance: data.dearness_allowance || "",
        house_rent_allowance: data.house_rent_allowance || "",
        special_allowance: data.special_allowance || "",
        conveyance_earnings: data.conveyance_earnings || "",
        work_start_time: data.work_start_time || "09:30",
        work_end_time: data.work_end_time || "17:30",
        notice_period: data.notice_period || "30",
        body: data.body || "Dear Candidate,",
        terms_condition: data.terms_condition || "As per company policy",
        subject: data.subject || "Job Offer Letter",
      });
    } catch (err) {
      console.error("Error fetching offer letter data", err);
      setError("Failed to load offer letter data");
    } finally {
      setLoading(false);
    }
  };

  const handleJobTitleChange = (e) => {
    const selectedJobTitleId = e.target.value;
    if (!selectedJobTitleId) {
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
    }
  };

  const calculateTotalSalary = () => {
    const basic = parseFloat(formData.basic_pay) || 0;
    const da = parseFloat(formData.dearness_allowance) || 0;
    const hra = parseFloat(formData.house_rent_allowance) || 0;
    const special = parseFloat(formData.special_allowance) || 0;
    const conveyance = parseFloat(formData.conveyance_earnings) || 0;
    return basic + da + hra + special + conveyance;
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobTitles();
    if (isEdit) {
      fetchOfferLetterData();
    }
  }, [id]);

  useEffect(() => {
    const total = calculateTotalSalary();
    if (total > 0) {
      setFormData(prev => ({ ...prev, salary: total.toString() }));
    }
  }, [
    formData.basic_pay,
    formData.dearness_allowance,
    formData.house_rent_allowance,
    formData.special_allowance,
    formData.conveyance_earnings
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric fields - ensure they are valid numbers
    if (['basic_pay', 'dearness_allowance', 'house_rent_allowance', 'special_allowance', 'conveyance_earnings'].includes(name)) {
      // Allow empty string or valid numbers
      if (value === '' || !isNaN(parseFloat(value)) || !isNaN(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCandidateChange = (e) => {
    const candidateId = e.target.value;
    setFormData(prev => ({ ...prev, candidate: candidateId }));
    if (candidateId) {
      fetchCandidateDetails(candidateId);
    } else {
      setFormData(prev => ({ ...prev, job_title: "", department: "", salary: "", basic_pay: "", dearness_allowance: "", house_rent_allowance: "", special_allowance: "", conveyance_earnings: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError("");
    setValidationErrors({});
    
    if (!formData.candidate) {
      alert("Please select a candidate");
      return;
    }
    if (!formData.job_title_id) {
      alert("Please select a job title");
      return;
    }
    if (!formData.joining_date) {
      alert("Please select a joining date");
      return;
    }

    // Convert empty strings to 0 for numeric fields
    const basic_pay = parseFloat(formData.basic_pay) || 0;
    const dearness_allowance = parseFloat(formData.dearness_allowance) || 0;
    const house_rent_allowance = parseFloat(formData.house_rent_allowance) || 0;
    const special_allowance = parseFloat(formData.special_allowance) || 0;
    const conveyance_earnings = parseFloat(formData.conveyance_earnings) || 0;
    const salary = parseFloat(formData.salary) || 0;

    const dataToSend = {
      candidate: formData.candidate,
      position: formData.job_title || "",
      department: formData.department || "",
      department_id: formData.department_id || "",
      job_title_id: formData.job_title_id || "",
      salary: salary,
      basic_pay: basic_pay,
      dearness_allowance: dearness_allowance,
      house_rent_allowance: house_rent_allowance,
      special_allowance: special_allowance,
      conveyance_earnings: conveyance_earnings,
      joining_data: formData.joining_date,
      work_start_time: formData.work_start_time || "09:30:00",
      work_end_time: formData.work_end_time || "17:30:00",
      notice_period: parseInt(formData.notice_period, 10) || 30,
      subject: formData.subject || "Job Offer Letter",
      body: formData.body || "Dear Candidate,",
      terms_condition: formData.terms_condition || "As per company policy",
    };

    console.log("=== SUBMITTING OFFER LETTER ===");
    console.log("Salary breakdown being sent:", {
      basic_pay,
      dearness_allowance,
      house_rent_allowance,
      special_allowance,
      conveyance_earnings,
      salary
    });
    console.log("Full data payload:", JSON.stringify(dataToSend, null, 2));

    try {
      setLoading(true);
      
      let res;
      if (isEdit) {
        console.log(`PUT request to /offer-letter/${id}/`);
        res = await api.put(`/offer-letter/${id}/`, dataToSend);
        console.log("Update response:", res.data);
        alert("Offer letter updated successfully");
      } else {
        console.log("POST request to /offer-letter/");
        res = await api.post("/offer-letter/", dataToSend);
        console.log("Create response:", res.data);
        alert("Offer letter created successfully");
      }
      
      navigate("/offer-letter");
    } catch (error) {
      console.error("=== ERROR SUBMITTING ===");
      console.error("Error:", error);
      console.error("Response:", error.response?.data);
      
      if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(error.response.data, 'text/html');
        const errorText = doc.querySelector('body')?.textContent || 'Unknown server error';
        alert(`Server Error:\n\n${errorText.substring(0, 500)}...\n\nCheck console for details.`);
        setError(`Server returned an error page. Check console.`);
      } else {
        let errorMessage = "Failed to save offer letter.\n\n";
        
        if (error.response?.data) {
          const errors = error.response.data;
          
          if (typeof errors === 'object' && !Array.isArray(errors)) {
            setValidationErrors(errors);
            
            const errorMessages = Object.entries(errors)
              .map(([field, msgs]) => {
                const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                return `• ${field}: ${message}`;
              })
              .join('\n');
            
            errorMessage += errorMessages;
          } else if (typeof errors === 'string') {
            errorMessage += errors;
          } else {
            errorMessage += JSON.stringify(errors, null, 2);
          }
        } else {
          errorMessage += error.message || "Unknown error occurred";
        }
        
        console.error("Error message shown to user:", errorMessage);
        alert(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{isEdit ? "Edit Offer Letter" : "Create Offer Letter"}</h2>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.mainGrid}>
          {/* Left Column */}
          <div style={styles.column}>
            <div style={styles.field}>
              <label style={styles.label}>Candidate *</label>
              <select 
                style={validationErrors.candidate ? styles.inputError : styles.input}
                name="candidate" 
                value={formData.candidate} 
                onChange={handleCandidateChange} 
                required 
                disabled={loading || isEdit}
              >
                <option value="">Select Candidate</option>
                {candidateList.map((item) => (
                  <option key={item.candidate_id} value={item.candidate_id}>{item.name}</option>
                ))}
              </select>
              {validationErrors.candidate && (
                <span style={styles.errorText}>{validationErrors.candidate}</span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Job Title *</label>
              <select 
                style={validationErrors.position ? styles.inputError : styles.input}
                name="job_title_id" 
                value={formData.job_title_id} 
                onChange={handleJobTitleChange} 
                required
              >
                <option value="">Select Job Title</option>
                {jobTitles.map((item) => (
                  <option key={item.uuid || item.id} value={item.uuid || item.id}>{item.title}</option>
                ))}
              </select>
              {validationErrors.position && (
                <span style={styles.errorText}>{validationErrors.position}</span>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Department *</label>
              <input 
                style={styles.inputDisabled} 
                value={formData.department} 
                readOnly 
                placeholder="Auto-filled" 
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Joining Date *</label>
              <input 
                type="date" 
                style={validationErrors.joining_data ? styles.inputError : styles.input}
                name="joining_date" 
                value={formData.joining_date} 
                onChange={handleChange} 
                required 
              />
              {validationErrors.joining_data && (
                <span style={styles.errorText}>{validationErrors.joining_data}</span>
              )}
            </div>

            <div style={styles.rowFields}>
              <div style={styles.field}>
                <label style={styles.label}>Work Start</label>
                <input 
                  type="time" 
                  style={styles.input} 
                  name="work_start_time" 
                  value={formData.work_start_time} 
                  onChange={handleChange} 
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Work End</label>
                <input 
                  type="time" 
                  style={styles.input} 
                  name="work_end_time" 
                  value={formData.work_end_time} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Notice Period (days)</label>
              <input 
                type="number" 
                style={styles.input} 
                name="notice_period" 
                value={formData.notice_period} 
                onChange={handleChange} 
                placeholder="30" 
                min="0" 
              />
            </div>
          </div>

          {/* Right Column - Salary */}
          <div style={styles.column}>
            <div style={styles.salaryBox}>
              <h3 style={styles.salaryTitle}>Salary Breakdown</h3>
              
              <div style={styles.field}>
                <label style={styles.label}>Basic Pay</label>
                <input 
                  type="number" 
                  style={styles.input} 
                  name="basic_pay" 
                  value={formData.basic_pay} 
                  onChange={handleChange} 
                  placeholder="20000" 
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Dearness Allowance (DA)</label>
                <input 
                  type="number" 
                  style={styles.input} 
                  name="dearness_allowance" 
                  value={formData.dearness_allowance} 
                  onChange={handleChange} 
                  placeholder="6000" 
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>House Rent Allowance (HRA)</label>
                <input 
                  type="number" 
                  style={styles.input} 
                  name="house_rent_allowance" 
                  value={formData.house_rent_allowance} 
                  onChange={handleChange} 
                  placeholder="8000" 
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Special Allowance</label>
                <input 
                  type="number" 
                  style={styles.input} 
                  name="special_allowance" 
                  value={formData.special_allowance} 
                  onChange={handleChange} 
                  placeholder="2000" 
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Conveyance Earnings</label>
                <input 
                  type="number" 
                  style={styles.input} 
                  name="conveyance_earnings" 
                  value={formData.conveyance_earnings} 
                  onChange={handleChange} 
                  placeholder="10000" 
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.totalBox}>
                <span style={styles.totalLabel}>Total Salary</span>
                <span style={styles.totalValue}>₹ {calculateTotalSalary().toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={() => navigate("/offer-letter")} style={styles.btnCancel}>
            Cancel
          </button>
          <button type="submit" style={styles.btnSave} disabled={loading}>
            {loading ? "Saving..." : "Save Offer Letter"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  error: {
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "20px",
    color: "#991b1b",
    textAlign: "left",
    whiteSpace: "pre-wrap",
    fontSize: "14px",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
    marginBottom: "24px",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#fff",
    transition: "border-color 0.2s",
  },
  inputError: {
    padding: "10px 12px",
    border: "2px solid #ef4444",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#fef2f2",
    transition: "border-color 0.2s",
  },
  inputDisabled: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    cursor: "not-allowed",
  },
  errorText: {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "2px",
  },
  rowFields: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  salaryBox: {
    backgroundColor: "#f0f9ff",
    padding: "20px",
    borderRadius: "10px",
    border: "2px solid #bfdbfe",
  },
  salaryTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e40af",
    margin: "0 0 16px 0",
  },
  totalBox: {
    marginTop: "8px",
    padding: "16px",
    backgroundColor: "#dbeafe",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "2px solid #3b82f6",
  },
  totalLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e40af",
  },
  totalValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e40af",
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
  btnCancel: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  btnSave: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};