import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    location: "",
    personalPhone: "",
    residentialPhone: "",
    jobTitle: "",
    dutyTime: "",
    joiningDate: "",
    bankAccount: "",
    bankDetails: "",
    aadharUrl: "",
    aadharFileName: "",
    createdUser: "myomega@gmail.com",
    createdDate: "",
  });

  useEffect(() => {
    if (isEditMode) {
      loadEmployeeData();
    }
  }, [id]);

  const loadEmployeeData = () => {
    try {
      const storedData = localStorage.getItem('employee-management-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const employee = data.find(item => item.id === parseInt(id));
        if (employee) {
          setEmployeeData(employee);
        } else {
          alert('Employee not found');
          navigate('/employee-management');
        }
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      alert('Failed to load employee data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setEmployeeData((prev) => ({ ...prev, aadharUrl: fileUrl, aadharFileName: file.name }));
    }
  };

  const handleRemoveFile = () => {
    if (employeeData.aadharUrl) {
      URL.revokeObjectURL(employeeData.aadharUrl);
    }
    setUploadedFile(null);
    setEmployeeData((prev) => ({ ...prev, aadharUrl: "", aadharFileName: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!employeeData.name.trim() || !employeeData.email.trim()) {
      alert("Please fill in name and email");
      return;
    }

    try {
      const storedData = localStorage.getItem('employee-management-data');
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
        // Update existing employee
        data = data.map(employee => 
          employee.id === parseInt(id) ? { ...employee, ...employeeData } : employee
        );
      } else {
        // Add new employee
        const newEmployee = {
          ...employeeData,
          id: Date.now(),
          createdDate: currentDate,
          createdUser: "myomega@gmail.com"
        };
        data.push(newEmployee);
      }

      localStorage.setItem('employee-management-data', JSON.stringify(data));
      alert(isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!');
      navigate('/employee-management');
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/employee-management');
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>{isEditMode ? "Edit Employee" : "Add New Employee"}</h2>
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
                value={employeeData.name} 
                onChange={handleInputChange} 
                placeholder="Enter full name"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input 
                style={styles.input} 
                type="email"
                name="email" 
                value={employeeData.email} 
                onChange={handleInputChange} 
                placeholder="Enter email address"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input 
                style={styles.input} 
                name="location" 
                value={employeeData.location} 
                onChange={handleInputChange} 
                placeholder="Enter location"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Personal Phone</label>
              <input 
                style={styles.input} 
                name="personalPhone" 
                value={employeeData.personalPhone} 
                onChange={handleInputChange} 
                placeholder="Enter personal phone"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Residential Phone</label>
              <input 
                style={styles.input} 
                name="residentialPhone" 
                value={employeeData.residentialPhone} 
                onChange={handleInputChange} 
                placeholder="Enter residential phone"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Job Title</label>
              <input 
                style={styles.input} 
                name="jobTitle" 
                value={employeeData.jobTitle} 
                onChange={handleInputChange} 
                placeholder="Enter job title"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Duty Time</label>
              <input 
                style={styles.input} 
                name="dutyTime" 
                value={employeeData.dutyTime} 
                onChange={handleInputChange} 
                placeholder="e.g., 9:00 AM - 6:00 PM"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Joining Date</label>
              <input 
                style={styles.input} 
                type="date" 
                name="joiningDate" 
                value={employeeData.joiningDate} 
                onChange={handleInputChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bank Account</label>
              <input 
                style={styles.input} 
                name="bankAccount" 
                value={employeeData.bankAccount} 
                onChange={handleInputChange} 
                placeholder="Enter bank account number"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Bank Details</label>
              <input 
                style={styles.input} 
                name="bankDetails" 
                value={employeeData.bankDetails} 
                onChange={handleInputChange} 
                placeholder="Enter bank name & branch"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Aadhar Document</label>
            <input 
              style={styles.fileInput} 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png" 
              onChange={handleFileUpload}
            />
            {(uploadedFile || employeeData.aadharFileName) && (
              <div style={styles.filePreview}>
                <span style={styles.fileName}>
                  {uploadedFile ? uploadedFile.name : employeeData.aadharFileName}
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
              {isEditMode ? "Update Employee" : "Submit Employee"}
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