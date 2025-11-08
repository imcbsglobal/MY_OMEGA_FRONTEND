import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Interview_Form() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [interviewData, setInterviewData] = useState({
    name: "",
    jobTitle: "",
    place: "",
    gender: "",
    interviewedBy: "",
    phoneNumber: "",
    remarks: "",
    result: "Pending",
    cvAttachmentUrl: "",
    cvFileName: "",
    createdUser: "myomega@gmail.com",
    createdDate: "",
  });

  useEffect(() => {
    if (isEditMode) {
      loadInterviewData();
    }
  }, [id]);

  const loadInterviewData = () => {
    try {
      const storedData = localStorage.getItem('interview-management-data');
      if (storedData) {
        const interviews = JSON.parse(storedData);
        const interview = interviews.find(item => item.id === parseInt(id));
        if (interview) {
          setInterviewData(interview);
        } else {
          alert("Interview not found");
          navigate('/interview-management');
        }
      }
    } catch (error) {
      console.error('Error loading interview:', error);
      alert('Failed to load interview data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setInterviewData((prev) => ({ ...prev, cvAttachmentUrl: fileUrl, cvFileName: file.name }));
    }
  };

  const handleRemoveFile = () => {
    if (interviewData.cvAttachmentUrl) {
      URL.revokeObjectURL(interviewData.cvAttachmentUrl);
    }
    setUploadedFile(null);
    setInterviewData((prev) => ({ ...prev, cvAttachmentUrl: "", cvFileName: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!interviewData.name.trim() || !interviewData.jobTitle.trim()) {
      alert("Please fill in name and job title");
      return;
    }

    try {
      const storedData = localStorage.getItem('interview-management-data');
      let interviews = storedData ? JSON.parse(storedData) : [];
      
      const currentDate = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      if (isEditMode) {
        interviews = interviews.map(interview => 
          interview.id === parseInt(id) ? { ...interview, ...interviewData } : interview
        );
      } else {
        const newInterview = {
          ...interviewData,
          id: Date.now(),
          createdDate: currentDate,
          createdUser: "myomega@gmail.com"
        };
        interviews.push(newInterview);
      }

      localStorage.setItem('interview-management-data', JSON.stringify(interviews));
      navigate('/interview-management');
    } catch (error) {
      console.error('Error saving interview:', error);
      alert('Failed to save interview. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/interview-management');
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>{isEditMode ? "Edit Interview" : "Add New Interview"}</h2>
          <button onClick={handleCancel} style={styles.backButton}>← Back to List</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input 
                style={styles.input} 
                name="name" 
                value={interviewData.name} 
                onChange={handleInputChange} 
                placeholder="Enter full name" 
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Job Title *</label>
              <input 
                style={styles.input} 
                name="jobTitle" 
                value={interviewData.jobTitle} 
                onChange={handleInputChange} 
                placeholder="Enter job title" 
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Gender</label>
              <select 
                style={styles.input} 
                name="gender" 
                value={interviewData.gender} 
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input 
                style={styles.input} 
                name="phoneNumber" 
                value={interviewData.phoneNumber} 
                onChange={handleInputChange} 
                placeholder="Enter phone number" 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input 
                style={styles.input} 
                name="place" 
                value={interviewData.place} 
                onChange={handleInputChange} 
                placeholder="Enter location" 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Interviewed By</label>
              <input 
                style={styles.input} 
                name="interviewedBy" 
                value={interviewData.interviewedBy} 
                onChange={handleInputChange} 
                placeholder="Enter interviewer name" 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Result</label>
              <select 
                style={styles.input} 
                name="result" 
                value={interviewData.result} 
                onChange={handleInputChange}
              >
                <option value="Pending">Pending</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>CV Attachment</label>
            <input 
              style={styles.fileInput} 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileUpload} 
            />
            {(uploadedFile || interviewData.cvFileName) && (
              <div style={styles.filePreview}>
                <span style={styles.fileName}>
                  {uploadedFile ? uploadedFile.name : interviewData.cvFileName}
                </span>
                <button type="button" onClick={handleRemoveFile} style={styles.removeFileBtn}>
                  Remove
                </button>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Remarks</label>
            <textarea 
              style={styles.textarea} 
              name="remarks" 
              value={interviewData.remarks} 
              onChange={handleInputChange} 
              rows="4" 
              placeholder="Enter any remarks" 
            />
          </div>

          <div style={styles.formFooter}>
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              {isEditMode ? "Update Interview" : "Submit Interview"}
            </button>
          </div>
        </form>
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
  formCard: {
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
  },
  textarea: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  fileInput: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
  },
  filePreview: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "8px",
    padding: "10px 14px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
  },
  fileName: {
    flex: 1,
    fontSize: "14px",
    color: "#374151",
  },
  removeFileBtn: {
    padding: "6px 14px",
    fontSize: "13px",
    color: "#dc2626",
    backgroundColor: "white",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
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
  submitBtn: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};