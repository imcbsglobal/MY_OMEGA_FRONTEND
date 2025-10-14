///// AddEmployee.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddEmployee.scss";

function AddEmployee() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    address: "",
    personalPhone: "",
    residentialPhone: "",
    place: "",
    district: "",
    education: "",
    experience: "",
    jobTitle: "",
    dutyTimeStart: "",
    dutyTimeEnd: "",
    organization: "",
    joiningDate: "",
    dob: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
    aadharAttachment: "",
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = ({ target: { name, value, type, files } }) => {
    if (type === "file") {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPhotoPreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Generate ID if not provided
    const employeeData = {
      ...formData,
      id: formData.id || `EMP${Date.now()}`
    };
    
    // Here you would typically save to your backend
    console.log("New Employee:", employeeData);
    
    // Show success message
    alert("Employee added successfully!");
    
    // Navigate back to employee management
    navigate("/hr/employee-management");
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      navigate("/hr/employee-management");
    }
  };

  const triggerFileInput = () => {
    document.getElementById("photo-upload").click();
  };

  return (
    <div className="add-employee">
      {/* --------------  PAGE HEADER  -------------- */}
      <div className="page-header">
        <div className="page-header__content">
          <div className="header-top">
            {/* UPDATED: Back arrow button moved to left near title */}
            <h1 className="page-title">
              <button className="back-arrow-btn" onClick={handleCancel} title="Back to Employees">
                ←
              </button>
              Add New Employee
            </h1>
          </div>
        </div>
      </div>

      {/* --------------  CONTENT AREA  -------------- */}
      <div className="content-area">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Employee Information</h2>
            {/* REMOVED: Form actions from top */}
          </div>

          <form className="form-content" onSubmit={handleSubmit}>
            {/* --------------  PERSONAL INFORMATION  -------------- */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="photo-upload">
                <div className="photo-preview">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Employee preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <i className="fas fa-user"></i>
                      <div>No Photo</div>
                    </div>
                  )}
                </div>
                <div className="upload-controls">
                  <input
                    type="file"
                    id="photo-upload"
                    name="photo"
                    className="file-input"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <button type="button" className="upload-btn" onClick={triggerFileInput}>
                    Upload Photo
                  </button>
                  <div className="upload-hint">
                    Recommended: Square image, at least 300x300 pixels
                  </div>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Employee ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    className={`form-input ${errors.id ? "error" : ""}`}
                    placeholder="Auto-generated if empty"
                  />
                  {errors.id && <div className="error-message">{errors.id}</div>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? "error" : ""}`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="employee@company.com"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <div className="date-format">Format: MM/DD/YYYY</div>
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Residential Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Enter complete address"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Personal Phone</label>
                  <input
                    type="tel"
                    name="personalPhone"
                    value={formData.personalPhone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Residential Phone</label>
                  <input
                    type="tel"
                    name="residentialPhone"
                    value={formData.residentialPhone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+91 11 2345 6789"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">City/Place</label>
                  <input
                    type="text"
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter city"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter district"
                  />
                </div>
                
                <div className="form-group full-width attachment-group">
                  <label className="form-label">Aadhar Card Attachment</label>
                  <div className="attachment-input-group">
                    <input
                      type="text"
                      name="aadharAttachment"
                      value={formData.aadharAttachment}
                      onChange={handleChange}
                      className="form-input attachment-url"
                      placeholder="Enter document URL or upload file"
                    />
                    <button type="button" className="upload-btn">
                      Browse
                    </button>
                  </div>
                  <div className="attachment-hint">
                    Supported formats: PDF, JPG, PNG (Max 5MB)
                  </div>
                </div>
              </div>
            </div>

            {/* --------------  PROFESSIONAL INFORMATION  -------------- */}
            <div className="form-section">
              <h3 className="section-title">Professional Information</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Education</label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 5 years"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Department or unit"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Duty Start Time</label>
                  <input
                    type="text"
                    name="dutyTimeStart"
                    value={formData.dutyTimeStart}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 9:30 a.m."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Duty End Time</label>
                  <input
                    type="text"
                    name="dutyTimeEnd"
                    value={formData.dutyTimeEnd}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 5:30 p.m."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <div className="date-format">Format: MM/DD/YYYY</div>
                </div>
              </div>
            </div>

            {/* --------------  BANK DETAILS  -------------- */}
            <div className="form-section">
              <h3 className="section-title">Bank Details</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Bank Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter account number"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., SBIN0000123"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter bank name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter branch name"
                  />
                </div>
              </div>
            </div>

            {/* ADDED: Bottom action buttons */}
            <div className="form-actions-bottom">
              <button type="button" className="btn btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-submit">
                Save Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;