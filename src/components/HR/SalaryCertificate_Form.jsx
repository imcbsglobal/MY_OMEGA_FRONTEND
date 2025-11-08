import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function SalaryCertificateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [certificateData, setCertificateData] = useState({
    name: "",
    jobTitle: "",
    joiningDate: "",
    location: "",
    employeeSalary: "",
    approvedBy: "",
    status: "Pending",
    certificateUrl: "",
    certificateFileName: "",
    createdUser: "myomega@gmail.com",
    createdDate: "",
  });

  useEffect(() => {
    if (isEditMode) {
      loadCertificateData();
    }
  }, [id]);

  const loadCertificateData = () => {
    try {
      const storedData = localStorage.getItem('salary-certificate-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const certificate = data.find(item => item.id === parseInt(id));
        if (certificate) {
          setCertificateData(certificate);
        } else {
          alert('Certificate not found');
          navigate('/salary-certificate');
        }
      }
    } catch (error) {
      console.error('Error loading certificate data:', error);
      alert('Failed to load certificate data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setCertificateData((prev) => ({ 
        ...prev, 
        certificateUrl: fileUrl, 
        certificateFileName: file.name 
      }));
    }
  };

  const handleRemoveFile = () => {
    if (certificateData.certificateUrl) {
      URL.revokeObjectURL(certificateData.certificateUrl);
    }
    setUploadedFile(null);
    setCertificateData((prev) => ({ ...prev, certificateUrl: "", certificateFileName: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!certificateData.name.trim() || !certificateData.jobTitle.trim()) {
      alert("Please fill in name and job title");
      return;
    }

    try {
      const storedData = localStorage.getItem('salary-certificate-data');
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
        // Update existing certificate
        data = data.map(cert => 
          cert.id === parseInt(id) ? { ...cert, ...certificateData } : cert
        );
      } else {
        // Add new certificate
        const newCertificate = {
          ...certificateData,
          id: Date.now(),
          createdDate: currentDate,
          createdUser: "myomega@gmail.com"
        };
        data.push(newCertificate);
      }

      localStorage.setItem('salary-certificate-data', JSON.stringify(data));
      alert(isEditMode ? 'Certificate updated successfully!' : 'Certificate added successfully!');
      navigate('/salary-certificate');
    } catch (error) {
      console.error('Error saving certificate:', error);
      alert('Failed to save certificate. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/salary-certificate');
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>{isEditMode ? "Edit Salary Certificate" : "Add New Salary Certificate"}</h2>
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
                value={certificateData.name} 
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
                value={certificateData.jobTitle} 
                onChange={handleInputChange} 
                placeholder="Enter job title"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Joining Date</label>
              <input 
                style={styles.input} 
                type="date"
                name="joiningDate" 
                value={certificateData.joiningDate} 
                onChange={handleInputChange} 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input 
                style={styles.input} 
                name="location" 
                value={certificateData.location} 
                onChange={handleInputChange} 
                placeholder="Enter location"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Employee Salary</label>
              <input 
                style={styles.input} 
                name="employeeSalary" 
                type="number"
                value={certificateData.employeeSalary} 
                onChange={handleInputChange} 
                placeholder="Enter salary amount"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Approved By</label>
              <input 
                style={styles.input} 
                name="approvedBy" 
                value={certificateData.approvedBy} 
                onChange={handleInputChange} 
                placeholder="Enter approver name"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select 
                style={styles.input} 
                name="status" 
                value={certificateData.status} 
                onChange={handleInputChange}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Certificate Attachment</label>
            <input 
              style={styles.fileInput} 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileUpload}
            />
            {(uploadedFile || certificateData.certificateFileName) && (
              <div style={styles.filePreview}>
                <span style={styles.fileName}>
                  {uploadedFile ? uploadedFile.name : certificateData.certificateFileName}
                </span>
                <button type="button" onClick={handleRemoveFile} style={styles.removeFileBtn}>
                  Remove
                </button>
              </div>
            )}
          </div>

          <div style={styles.formFooter}>
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              {isEditMode ? "Update Certificate" : "Submit Certificate"}
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