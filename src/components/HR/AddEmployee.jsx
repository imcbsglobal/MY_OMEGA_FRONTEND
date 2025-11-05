import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./EmployeeManagement.scss";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

function AddEditEmployee() {
  const navigate = useNavigate();
  const location = useLocation();
  const editEmployee = location.state?.employee;
  const isEditMode = !!editEmployee;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Authentication
    email: "",
    password: "",
    confirm_password: "",
    
    // Personal Information
    name: "",
    dob: "",
    
    // Contact Information
    address: "",
    place: "",
    district: "",
    personal_phone: "",
    residential_phone: "",
    phone_number: "",
    
    // Professional Information
    user_level: "User",
    job_title: "",
    job_role: "",
    organization: "",
    education: "",
    experience: "",
    joining_date: "",
    duty_time_start: "",
    duty_time_end: "",
    
    // Financial Information
    bank_account_number: "",
    ifsc_code: "",
    bank_name: "",
    branch: "",
    
    // System Fields
    is_active: true,
    is_staff: false,
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadharAttachment, setAadharAttachment] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // Axios instance with auth
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle token expiry
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (isEditMode && editEmployee) {
      setFormData({
        email: editEmployee.email || "",
        password: "",
        confirm_password: "",
        name: editEmployee.name || "",
        dob: editEmployee.dob || "",
        address: editEmployee.address || "",
        place: editEmployee.place || "",
        district: editEmployee.district || "",
        personal_phone: editEmployee.personal_phone || "",
        residential_phone: editEmployee.residential_phone || "",
        phone_number: editEmployee.phone_number || "",
        user_level: editEmployee.user_level || "User",
        job_title: editEmployee.job_title || "",
        job_role: editEmployee.job_role || "",
        organization: editEmployee.organization || "",
        education: editEmployee.education || "",
        experience: editEmployee.experience || "",
        joining_date: editEmployee.joining_date || "",
        duty_time_start: editEmployee.duty_time_start || "",
        duty_time_end: editEmployee.duty_time_end || "",
        bank_account_number: editEmployee.bank_account_number || "",
        ifsc_code: editEmployee.ifsc_code || "",
        bank_name: editEmployee.bank_name || "",
        branch: editEmployee.branch || "",
        is_active: editEmployee.is_active ?? true,
        is_staff: editEmployee.is_staff ?? false,
      });
      
      if (editEmployee.photo_url) {
        setPhotoPreview(editEmployee.photo_url);
      }
      if (editEmployee.aadhar_attachment_url) {
        setAadharPreview(editEmployee.aadhar_attachment_url);
      }
    }
  }, [isEditMode, editEmployee]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAadharChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setAadharAttachment(file);
      if (file.type.startsWith('image/')) {
        setAadharPreview(URL.createObjectURL(file));
      } else {
        setAadharPreview(file.name);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    } else if (formData.password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          // Skip password fields if in edit mode and empty
          if (isEditMode && (key === 'password' || key === 'confirm_password') && !formData[key]) {
            return;
          }
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      if (photo) {
        submitData.append("photo", photo);
      }
      if (aadharAttachment) {
        submitData.append("aadhar_attachment", aadharAttachment);
      }

      let response;
      if (isEditMode) {
        response = await api.patch(`/users/${editEmployee.id}/`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Employee updated successfully!");
      } else {
        response = await api.post("/users/", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Employee created successfully!");
      }

      navigate("/hr/employees");
    } catch (error) {
      console.error("Error saving employee:", error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        setErrors(serverErrors);
        
        // Show first error message
        const firstErrorKey = Object.keys(serverErrors)[0];
        const firstError = serverErrors[firstErrorKey];
        if (Array.isArray(firstError)) {
          alert(firstError[0]);
        } else if (typeof firstError === 'string') {
          alert(firstError);
        } else {
          alert("Failed to save employee");
        }
      } else {
        alert("Failed to save employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      navigate("/hr/employees");
    }
  };

  return (
    <div className="employee-management">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            {isEditMode ? "Edit Employee" : "Add Employee"}
          </h1>
        </div>
      </div>

      <div className="content-area">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {/* Authentication Section */}
            <div className="form-section">
              <h3 className="section-title">Authentication Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "error" : ""}
                    disabled={isEditMode}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="user_level">User Level <span className="required">*</span></label>
                  <select
                    id="user_level"
                    name="user_level"
                    value={formData.user_level}
                    onChange={handleInputChange}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Password {!isEditMode && <span className="required">*</span>}
                    {isEditMode && <span className="optional">(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? "error" : ""}
                    placeholder={isEditMode ? "Leave blank to keep current password" : ""}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">
                    Confirm Password {!isEditMode && <span className="required">*</span>}
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={errors.confirm_password ? "error" : ""}
                  />
                  {errors.confirm_password && <span className="error-message">{errors.confirm_password}</span>}
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "error" : ""}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="photo">Photo</label>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {photoPreview && (
                    <div className="image-preview">
                      <img src={photoPreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="form-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter full address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="place">Place/City</label>
                  <input
                    type="text"
                    id="place"
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}
                    placeholder="e.g., Kozhikode"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="district">District</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="e.g., Kozhikode"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="personal_phone">Personal Phone</label>
                  <input
                    type="tel"
                    id="personal_phone"
                    name="personal_phone"
                    value={formData.personal_phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="residential_phone">Residential Phone</label>
                  <input
                    type="tel"
                    id="residential_phone"
                    name="residential_phone"
                    value={formData.residential_phone}
                    onChange={handleInputChange}
                    placeholder="+91 495 1234567"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="form-section">
              <h3 className="section-title">Professional Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="job_title">Job Title</label>
                  <input
                    type="text"
                    id="job_title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Developer"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="organization">Organization/Department</label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="e.g., Tech Department"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="education">Education</label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="e.g., B.Tech in Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Experience</label>
                  <input
                    type="text"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 5 years"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="joining_date">Joining Date</label>
                  <input
                    type="date"
                    id="joining_date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duty_time_start">Duty Start Time</label>
                  <input
                    type="time"
                    id="duty_time_start"
                    name="duty_time_start"
                    value={formData.duty_time_start}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duty_time_end">Duty End Time</label>
                  <input
                    type="time"
                    id="duty_time_end"
                    name="duty_time_end"
                    value={formData.duty_time_end}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="form-section">
              <h3 className="section-title">Financial Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bank_account_number">Bank Account Number</label>
                  <input
                    type="text"
                    id="bank_account_number"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ifsc_code">IFSC Code</label>
                  <input
                    type="text"
                    id="ifsc_code"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleInputChange}
                    placeholder="e.g., SBIN0001234"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bank_name">Bank Name</label>
                  <input
                    type="text"
                    id="bank_name"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    placeholder="e.g., State Bank of India"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="branch">Branch</label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Branch"
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="form-section">
              <h3 className="section-title">Documents</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="aadhar_attachment">Aadhar Card</label>
                  <input
                    type="file"
                    id="aadhar_attachment"
                    accept="image/*,application/pdf"
                    onChange={handleAadharChange}
                  />
                  {aadharPreview && (
                    <div className="file-preview">
                      {typeof aadharPreview === 'string' && aadharPreview.startsWith('http') ? (
                        aadharPreview.endsWith('.pdf') ? (
                          <p>📄 Current PDF: <a href={aadharPreview} target="_blank" rel="noopener noreferrer">View</a></p>
                        ) : (
                          <img src={aadharPreview} alt="Aadhar Preview" />
                        )
                      ) : (
                        <p>📄 {aadharPreview}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="form-section">
              <h3 className="section-title">Status</h3>
              <div className="form-grid">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_staff"
                      checked={formData.is_staff}
                      onChange={handleInputChange}
                    />
                    <span>Staff Access</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-small"></span>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  isEditMode ? "Update Employee" : "Create Employee"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEditEmployee;