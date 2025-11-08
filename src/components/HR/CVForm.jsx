import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CVForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [cvData, setCvData] = useState({
    name: "",
    jobTitle: "",
    place: "",
    createdUser: "myomega@gmail.com",
    createdDate: "",
    gender: "",
    address: "",
    district: "",
    phoneNumber: "",
    education: "",
    experience: "",
    dob: "",
    remarks: "",
    cvSource: "DIRECT",
    cvAttachmentUrl: "",
    cvFileName: "",
    interviewStatus: "Pending",
  });

  const districts = [
    "Select a district",
    "Thiruvananthapuram",
    "Kollam",
    "Pathanamthitta",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Ernakulam",
    "Thrissur",
    "Palakkad",
    "Malappuram",
    "Kozhikode",
    "Wayanad",
    "Kannur",
    "Kasaragod"
  ];

  useEffect(() => {
    if (isEditMode) {
      loadCVData();
    }
  }, [id]);

  const loadCVData = () => {
    try {
      const storedData = localStorage.getItem('cv-management-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const cv = data.find(item => item.id === parseInt(id));
        if (cv) {
          setCvData(cv);
        } else {
          alert('CV not found');
          navigate('/cv-management');
        }
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
      alert('Failed to load CV data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCvData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setCvData((prev) => ({ ...prev, cvAttachmentUrl: fileUrl, cvFileName: file.name }));
    }
  };

  const handleRemoveFile = () => {
    if (cvData.cvAttachmentUrl) {
      URL.revokeObjectURL(cvData.cvAttachmentUrl);
    }
    setUploadedFile(null);
    setCvData((prev) => ({ ...prev, cvAttachmentUrl: "", cvFileName: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cvData.name.trim() || !cvData.jobTitle.trim()) {
      alert("Please fill in name and job title");
      return;
    }

    try {
      const storedData = localStorage.getItem('cv-management-data');
      let data = storedData ? JSON.parse(storedData) : [];
      
      const currentDate = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      if (isEditMode) {
        // Update existing CV
        data = data.map(cv => 
          cv.id === parseInt(id) ? { ...cv, ...cvData } : cv
        );
      } else {
        // Add new CV
        const newCV = {
          ...cvData,
          id: Date.now(),
          createdDate: currentDate,
          createdUser: "myomega@gmail.com"
        };
        data.push(newCV);
      }

      localStorage.setItem('cv-management-data', JSON.stringify(data));
      alert(isEditMode ? 'CV updated successfully!' : 'CV added successfully!');
      navigate('/cv-management');
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('Failed to save CV. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/cv-management');
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>{isEditMode ? "Edit CV" : "Add New CV"}</h2>
          <button onClick={handleCancel} style={styles.backButton}>
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input 
                style={styles.input} 
                name="name" 
                value={cvData.name} 
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
                value={cvData.jobTitle} 
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
                value={cvData.gender} 
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
                value={cvData.phoneNumber} 
                onChange={handleInputChange} 
                placeholder="Enter phone number"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Place</label>
              <input 
                style={styles.input} 
                name="place" 
                value={cvData.place} 
                onChange={handleInputChange} 
                placeholder="Enter place"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>District</label>
              <select 
                style={styles.input} 
                name="district" 
                value={cvData.district} 
                onChange={handleInputChange}
              >
                {districts.map((dist, idx) => (
                  <option key={idx} value={dist === "Select a district" ? "" : dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <input 
                style={styles.input} 
                name="address" 
                value={cvData.address} 
                onChange={handleInputChange} 
                placeholder="Enter address"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Education</label>
              <input 
                style={styles.input} 
                name="education" 
                value={cvData.education} 
                onChange={handleInputChange} 
                placeholder="Enter education"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Experience</label>
              <input 
                style={styles.input} 
                name="experience" 
                value={cvData.experience} 
                onChange={handleInputChange} 
                placeholder="Enter experience"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date of Birth</label>
              <input 
                style={styles.input} 
                type="date" 
                name="dob" 
                value={cvData.dob} 
                onChange={handleInputChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>CV Source</label>
              <select 
                style={styles.input} 
                name="cvSource" 
                value={cvData.cvSource} 
                onChange={handleInputChange}
              >
                <option value="DIRECT">Direct</option>
                <option value="REFERRAL">Referral</option>
                <option value="WEBSITE">Website</option>
                <option value="JOB_PORTAL">Job Portal</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Interview Status</label>
              <select 
                style={styles.input} 
                name="interviewStatus" 
                value={cvData.interviewStatus} 
                onChange={handleInputChange}
              >
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
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
            {(uploadedFile || cvData.cvFileName) && (
              <div style={styles.filePreview}>
                <span style={styles.fileName}>
                  {uploadedFile ? uploadedFile.name : cvData.cvFileName}
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
              value={cvData.remarks} 
              onChange={handleInputChange}
              rows="3" 
              placeholder="Enter any remarks"
            />
          </div>

          <div style={styles.formFooter}>
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              {isEditMode ? "Update CV" : "Submit CV"}
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
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  formTitle: {
    fontSize: "24px",
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
  form: {
    padding: "24px",
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
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
  },
  textarea: {
    padding: "12px 14px",
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
    borderRadius: "8px",
  },
  fileName: {
    flex: 1,
    fontSize: "14px",
    color: "#374151",
  },
  removeFileBtn: {
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "white",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
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
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
};