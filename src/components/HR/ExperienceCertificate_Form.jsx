import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ExperienceCertificateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [certificateData, setCertificateData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    jobTitle: "",
    joiningDate: "",
    endDate: "",
    certificateUrl: "",
    certificateFileName: "",
    approved: "Pending",
    addedBy: "myomega@gmail.com",
    approvedBy: "",
    createdDate: "",
  });

  useEffect(() => {
    if (isEditMode) {
      loadCertificateData();
    }
  }, [id]);

  const loadCertificateData = () => {
    try {
      const storedData = localStorage.getItem('experience-certificate-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const certificate = data.find(item => item.id === parseInt(id));
        if (certificate) {
          setCertificateData(certificate);
        } else {
          alert('Certificate not found');
          navigate('/experience-certificate');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!certificateData.name.trim() || !certificateData.jobTitle.trim()) {
      alert("Please fill in name and job title");
      return;
    }

    try {
      const storedData = localStorage.getItem('experience-certificate-data');
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
          addedBy: "myomega@gmail.com"
        };
        data.push(newCertificate);
      }

      localStorage.setItem('experience-certificate-data', JSON.stringify(data));
      alert(isEditMode ? 'Certificate updated successfully!' : 'Certificate added successfully!');
      navigate('/experience-certificate');
    } catch (error) {
      console.error('Error saving certificate:', error);
      alert('Failed to save certificate. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/experience-certificate');
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>{isEditMode ? "Edit Certificate" : "Add New Certificate"}</h2>
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
              <label style={styles.label}>Phone Number</label>
              <input 
                style={styles.input} 
                name="phoneNumber" 
                value={certificateData.phoneNumber} 
                onChange={handleInputChange} 
                placeholder="Enter phone number"
              />
            </div>

            <div style={{...styles.formGroup, gridColumn: "1 / -1"}}>
              <label style={styles.label}>Address</label>
              <textarea 
                style={styles.textarea} 
                name="address" 
                value={certificateData.address} 
                onChange={handleInputChange}
                rows="3" 
                placeholder="Enter full address"
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
              <label style={styles.label}>End Date</label>
              <input 
                style={styles.input} 
                type="date" 
                name="endDate" 
                value={certificateData.endDate} 
                onChange={handleInputChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Approval Status</label>
              <select 
                style={styles.input} 
                name="approved" 
                value={certificateData.approved} 
                onChange={handleInputChange}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
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