import React, { useState } from "react";
import {
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  X,
  Save,
  Camera,
  Upload,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  Building,
  CreditCard,
  FileText,
  Home,
  Award,
} from "lucide-react";
import "./AddUser.scss";

/**
 * Enhanced AddUser Component with all model fields
 * Supports both modal and full-page modes
 */
export default function AddUser({ onClose, onCreate }) {
  const [activeTab, setActiveTab] = useState("basic"); // basic, contact, professional, financial, documents
  
  const [form, setForm] = useState({
    // Basic Information
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userLevel: "User",
    isActive: true,
    isStaff: false,
    dob: "",
    photo: null,
    
    // Contact Information
    address: "",
    place: "",
    district: "",
    personalPhone: "",
    residentialPhone: "",
    phoneNumber: "",
    
    // Professional Information
    jobTitle: "",
    jobRole: "",
    organization: "",
    education: "",
    experience: "",
    joiningDate: "",
    dutyTimeStart: "",
    dutyTimeEnd: "",
    
    // Financial Information
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
    
    // Documents
    aadharAttachment: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setGlobalError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, photo: "Please select a valid image file." }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: "Image size must be less than 5MB." }));
        return;
      }

      setField("photo", file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setErrors((prev) => ({ ...prev, photo: "" }));
    }
  };

  const handleAadharChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, aadharAttachment: "File size must be less than 5MB." }));
        return;
      }

      setField("aadharAttachment", file);
      setAadharPreview(file.name);
      setErrors((prev) => ({ ...prev, aadharAttachment: "" }));
    }
  };

  const removePhoto = () => {
    setField("photo", null);
    setPhotoPreview(null);
  };

  const removeAadhar = () => {
    setField("aadharAttachment", null);
    setAadharPreview(null);
  };

  const validate = () => {
    const e = {};
    
    // Basic validation
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    if (!form.userLevel) e.userLevel = "Select a user level.";
    
    // Phone validation (if provided)
    if (form.personalPhone && !/^\+?[\d\s\-()]+$/.test(form.personalPhone)) {
      e.personalPhone = "Enter a valid phone number.";
    }
    if (form.residentialPhone && !/^\+?[\d\s\-()]+$/.test(form.residentialPhone)) {
      e.residentialPhone = "Enter a valid phone number.";
    }
    
    // IFSC validation (if provided)
    if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
      e.ifscCode = "Enter a valid IFSC code (e.g., SBIN0001234).";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) {
      // Find first tab with errors
      const errorKeys = Object.keys(errors);
      if (errorKeys.some(k => ['name', 'email', 'password', 'confirmPassword', 'userLevel', 'dob', 'photo'].includes(k))) {
        setActiveTab('basic');
      } else if (errorKeys.some(k => ['address', 'place', 'district', 'personalPhone', 'residentialPhone'].includes(k))) {
        setActiveTab('contact');
      } else if (errorKeys.some(k => ['jobTitle', 'jobRole', 'organization', 'education', 'experience'].includes(k))) {
        setActiveTab('professional');
      } else if (errorKeys.some(k => ['bankAccountNumber', 'ifscCode', 'bankName', 'branch'].includes(k))) {
        setActiveTab('financial');
      }
      return;
    }

    setLoading(true);
    setGlobalError("");

    try {
      const formData = new FormData();
      
      // Basic fields
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('confirm_password', form.confirmPassword);
      formData.append('user_level', form.userLevel);
      formData.append('is_active', form.isActive);
      formData.append('is_staff', form.isStaff);
      
      if (form.dob) formData.append('dob', form.dob);
      if (form.photo) formData.append('photo', form.photo);
      
      // Contact fields
      if (form.address) formData.append('address', form.address);
      if (form.place) formData.append('place', form.place);
      if (form.district) formData.append('district', form.district);
      if (form.personalPhone) formData.append('personal_phone', form.personalPhone);
      if (form.residentialPhone) formData.append('residential_phone', form.residentialPhone);
      if (form.phoneNumber) formData.append('phone_number', form.phoneNumber);
      
      // Professional fields
      if (form.jobTitle) formData.append('job_title', form.jobTitle);
      if (form.jobRole) formData.append('job_role', form.jobRole);
      if (form.organization) formData.append('organization', form.organization);
      if (form.education) formData.append('education', form.education);
      if (form.experience) formData.append('experience', form.experience);
      if (form.joiningDate) formData.append('joining_date', form.joiningDate);
      if (form.dutyTimeStart) formData.append('duty_time_start', form.dutyTimeStart);
      if (form.dutyTimeEnd) formData.append('duty_time_end', form.dutyTimeEnd);
      
      // Financial fields
      if (form.bankAccountNumber) formData.append('bank_account_number', form.bankAccountNumber);
      if (form.ifscCode) formData.append('ifsc_code', form.ifscCode);
      if (form.bankName) formData.append('bank_name', form.bankName);
      if (form.branch) formData.append('branch', form.branch);
      
      // Documents
      if (form.aadharAttachment) formData.append('aadhar_attachment', form.aadharAttachment);

      const token = localStorage.getItem('access') || localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      console.log('✅ User created successfully:', data);
      
      if (onCreate) onCreate(data);
      if (onClose) onClose();
      else {
        // Reset form
        setForm({
          name: "", email: "", password: "", confirmPassword: "",
          userLevel: "User", isActive: true, isStaff: false, dob: "",
          photo: null, address: "", place: "", district: "",
          personalPhone: "", residentialPhone: "", phoneNumber: "",
          jobTitle: "", jobRole: "", organization: "", education: "",
          experience: "", joiningDate: "", dutyTimeStart: "", dutyTimeEnd: "",
          bankAccountNumber: "", ifscCode: "", bankName: "", branch: "",
          aadharAttachment: null,
        });
        setPhotoPreview(null);
        setAadharPreview(null);
        setActiveTab("basic");
        alert('User created successfully!');
      }
    } catch (err) {
      console.error('❌ Error creating user:', err);
      
      if (err.message.includes('Session expired') || err.message.includes('authentication token')) {
        setGlobalError(err.message);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setGlobalError(err?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: UserIcon },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "financial", label: "Financial", icon: CreditCard },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="add-user-overlay">
      <div className="add-user-modal enhanced">
        <div className="add-user-header">
          <div>
            <h2>➕ Add New User</h2>
            <p className="subtitle">Fill in the details to create a new user account</p>
          </div>
          <button
            type="button"
            className="close-btn"
            aria-label="Close"
            onClick={() => onClose && onClose()}
          >
            <X />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form className="add-user-form enhanced" onSubmit={handleSubmit} noValidate>
          {globalError && <div className="error-box">{globalError}</div>}

          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="tab-content">
              <h3 className="section-title">
                <UserIcon size={20} /> Basic Information
              </h3>

              {/* Photo Upload */}
              <div className="form-group">
                <label className="field-label">Profile Photo</label>
                <div className="photo-upload-section">
                  <div className="photo-preview">
                    {photoPreview ? (
                      <div className="preview-container">
                        <img src={photoPreview} alt="Preview" className="preview-image" />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={removePhoto}
                          aria-label="Remove photo"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="photo-placeholder">
                        <Camera size={40} />
                        <span>No photo selected</span>
                      </div>
                    )}
                  </div>
                  <div className="photo-upload-controls">
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="photo" className="btn-upload">
                      <Upload size={18} />
                      Choose Photo
                    </label>
                    <small className="upload-hint">JPG, PNG or GIF (Max 5MB)</small>
                  </div>
                </div>
                {errors.photo && <small className="field-error">{errors.photo}</small>}
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="field-label" htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <div className="field">
                  <span className="icon"><UserIcon /></span>
                  <input
                    id="name"
                    className="input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </div>
                {errors.name && <small className="field-error">{errors.name}</small>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="field-label" htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <div className="field">
                  <span className="icon"><Mail /></span>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                </div>
                {errors.email && <small className="field-error">{errors.email}</small>}
              </div>

              {/* Password Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label" htmlFor="password">
                    Password <span className="required">*</span>
                  </label>
                  <div className="field">
                    <span className="icon"><Lock /></span>
                    <input
                      id="password"
                      type="password"
                      className="input"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                    />
                  </div>
                  {errors.password && <small className="field-error">{errors.password}</small>}
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="confirmPassword">
                    Confirm Password <span className="required">*</span>
                  </label>
                  <div className="field">
                    <span className="icon"><Lock /></span>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="input"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                    />
                  </div>
                  {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
                </div>
              </div>

              {/* DOB and User Level Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label" htmlFor="dob">
                    Date of Birth
                  </label>
                  <div className="field">
                    <span className="icon"><Calendar /></span>
                    <input
                      id="dob"
                      type="date"
                      className="input"
                      value={form.dob}
                      onChange={(e) => setField("dob", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="userLevel">
                    User Level <span className="required">*</span>
                  </label>
                  <div className="field">
                    <span className="icon"><Shield /></span>
                    <select
                      id="userLevel"
                      className="select"
                      value={form.userLevel}
                      onChange={(e) => setField("userLevel", e.target.value)}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  {errors.userLevel && <small className="field-error">{errors.userLevel}</small>}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="checks">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                  />
                  <span>Active Account</span>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.isStaff}
                    onChange={(e) => setField("isStaff", e.target.checked)}
                  />
                  <span>Staff Access</span>
                </label>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === "contact" && (
            <div className="tab-content">
              <h3 className="section-title">
                <Phone size={20} /> Contact Information
              </h3>

              {/* Address */}
              <div className="form-group">
                <label className="field-label" htmlFor="address">
                  Full Address
                </label>
                <div className="field">
                  <span className="icon"><Home /></span>
                  <textarea
                    id="address"
                    className="textarea"
                    rows="3"
                    placeholder="Enter complete residential address"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                  />
                </div>
              </div>

              {/* Place and District */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label" htmlFor="place">
                    Place / City
                  </label>
                  <div className="field">
                    <span className="icon"><MapPin /></span>
                    <input
                      id="place"
                      className="input"
                      placeholder="e.g., Mumbai"
                      value={form.place}
                      onChange={(e) => setField("place", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="district">
                    District
                  </label>
                  <div className="field">
                    <span className="icon"><MapPin /></span>
                    <input
                      id="district"
                      className="input"
                      placeholder="e.g., Mumbai"
                      value={form.district}
                      onChange={(e) => setField("district", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label" htmlFor="personalPhone">
                    Personal Phone
                  </label>
                  <div className="field">
                    <span className="icon"><Phone /></span>
                    <input
                      id="personalPhone"
                      type="tel"
                      className="input"
                      placeholder="+91 98765 43210"
                      value={form.personalPhone}
                      onChange={(e) => setField("personalPhone", e.target.value)}
                    />
                  </div>
                  {errors.personalPhone && <small className="field-error">{errors.personalPhone}</small>}
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="residentialPhone">
                    Residential Phone
                  </label>
                  <div className="field">
                    <span className="icon"><Phone /></span>
                    <input
                      id="residentialPhone"
                      type="tel"
                      className="input"
                      placeholder="+91 22 1234 5678"
                      value={form.residentialPhone}
                      onChange={(e) => setField("residentialPhone", e.target.value)}
                    />
                  </div>
                  {errors.residentialPhone && <small className="field-error">{errors.residentialPhone}</small>}
                </div>
              </div>

              {/* Legacy Phone Number */}
              <div className="form-group">
                <label className="field-label" htmlFor="phoneNumber">
                  Primary Phone (Legacy)
                </label>
                <div className="field">
                  <span className="icon"><Phone /></span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="input"
                    placeholder="Primary contact number"
                    value={form.phoneNumber}
                    onChange={(e) => setField("phoneNumber", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === "professional" && (
            <div className="tab-content">
              <h3 className="section-title">
                <Briefcase size={20} /> Professional Information
              </h3>

              {/* Job Title and Role */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label" htmlFor="jobTitle">
                    Job Title
                  </label>
                  <div className="field">
                    <span className="icon"><Briefcase /></span>
                    <input
                      id="jobTitle"
                      className="input"
                      placeholder="e.g., Senior Developer"
                      value={form.jobTitle}
                      onChange={(e) => setField("jobTitle", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="jobRole">
                    Job Role
                  </label>
                  <div className="field">
                    <span className="icon"><Briefcase /></span>
                    <input
                      id="jobRole"
                      className="input"
                      placeholder="e.g., Software Engineer"
                      value={form.jobRole}
                      onChange={(e) => setField("jobRole", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div className="form-group">
                <label className="field-label" htmlFor="organization">
                  Organization / Department
                </label>
                <div className="field">
                  <span className="icon"><Building /></span>
                  <input
                    id="organization"
                    className="input"
                    placeholder="e.g., IT Department"
                    value={form.organization}
                    onChange={(e) => setField("organization", e.target.value)}
                  />
                </div>
              </div>

              {/* Education and Experience */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label" htmlFor="education">
                    Education Qualification
                  </label>
                  <div className="field">
                    <span className="icon"><GraduationCap /></span>
                    <input
                      id="education"
                      className="input"
                      placeholder="e.g., B.Tech Computer Science"
                      value={form.education}
                      onChange={(e) => setField("education", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="experience">
                    Years of Experience
                  </label>
                  <div className="field">
                    <span className="icon"><Award /></span>
                    <input
                      id="experience"
                      className="input"
                      placeholder="e.g., 5 years"
                      value={form.experience}
                      onChange={(e) => setField("experience", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Joining Date */}
              <div className="form-group">
                <label className="field-label" htmlFor="joiningDate">
                  Joining Date
                </label>
                <div className="field">
                  <span className="icon"><Calendar /></span>
                  <input
                    id="joiningDate"
                    type="date"
                    className="input"
                    value={form.joiningDate}
                    onChange={(e) => setField("joiningDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Duty Time */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label" htmlFor="dutyTimeStart">
                    Duty Start Time
                  </label>
                  <div className="field">
                    <span className="icon"><Clock /></span>
                    <input
                      id="dutyTimeStart"
                      type="time"
                      className="input"
                      value={form.dutyTimeStart}
                      onChange={(e) => setField("dutyTimeStart", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="dutyTimeEnd">
                    Duty End Time
                  </label>
                  <div className="field">
                    <span className="icon"><Clock /></span>
                    <input
                      id="dutyTimeEnd"
                      type="time"
                      className="input"
                      value={form.dutyTimeEnd}
                      onChange={(e) => setField("dutyTimeEnd", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Information Tab */}
          {activeTab === "financial" && (
            <div className="tab-content">
              <h3 className="section-title">
                <CreditCard size={20} /> Financial Information
              </h3>

              {/* Bank Account Number */}
              <div className="form-group">
                <label className="field-label" htmlFor="bankAccountNumber">
                  Bank Account Number
                </label>
                <div className="field">
                  <span className="icon"><CreditCard /></span>
                  <input
                    id="bankAccountNumber"
                    className="input"
                    placeholder="Enter account number"
                    value={form.bankAccountNumber}
                    onChange={(e) => setField("bankAccountNumber", e.target.value)}
                  />
                </div>
              </div>

              {/* IFSC Code */}
              <div className="form-group">
                <label className="field-label" htmlFor="ifscCode">
                  IFSC Code
                </label>
                <div className="field">
                  <span className="icon"><CreditCard /></span>
                  <input
                    id="ifscCode"
                    className="input"
                    placeholder="e.g., SBIN0001234"
                    value={form.ifscCode}
                    onChange={(e) => setField("ifscCode", e.target.value.toUpperCase())}
                  />
                </div>
                {errors.ifscCode && <small className="field-error">{errors.ifscCode}</small>}
              </div>

              {/* Bank Name and Branch */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label" htmlFor="bankName">
                    Bank Name
                  </label>
                  <div className="field">
                    <span className="icon"><Building /></span>
                    <input
                      id="bankName"
                      className="input"
                      placeholder="e.g., State Bank of India"
                      value={form.bankName}
                      onChange={(e) => setField("bankName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="branch">
                    Branch
                  </label>
                  <div className="field">
                    <span className="icon"><MapPin /></span>
                    <input
                      id="branch"
                      className="input"
                      placeholder="e.g., Mumbai Main Branch"
                      value={form.branch}
                      onChange={(e) => setField("branch", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="tab-content">
              <h3 className="section-title">
                <FileText size={20} /> Documents
              </h3>

              {/* Aadhar Upload */}
              <div className="form-group">
                <label className="field-label">Aadhar Card Document</label>
                <div className="document-upload-section">
                  {aadharPreview ? (
                    <div className="document-preview">
                      <FileText size={40} />
                      <span className="document-name">{aadharPreview}</span>
                      <button
                        type="button"
                        className="remove-document-btn"
                        onClick={removeAadhar}
                        aria-label="Remove document"
                      >
                        <X size={16} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="document-placeholder">
                      <FileText size={40} />
                      <span>No document selected</span>
                    </div>
                  )}
                  <div className="document-upload-controls">
                    <input
                      type="file"
                      id="aadharAttachment"
                      name="aadharAttachment"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleAadharChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="aadharAttachment" className="btn-upload">
                      <Upload size={18} />
                      Choose Document
                    </label>
                    <small className="upload-hint">PDF, JPG, PNG, DOC (Max 5MB)</small>
                  </div>
                </div>
                {errors.aadharAttachment && (
                  <small className="field-error">{errors.aadharAttachment}</small>
                )}
              </div>

              <div className="info-box">
                <strong>📋 Document Guidelines:</strong>
                <ul>
                  <li>Ensure documents are clear and readable</li>
                  <li>Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Keep a backup of original documents</li>
                </ul>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <div className="action-buttons">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Creating...
                  </>
                ) : (
                  <>
                    <Save /> Create User
                  </>
                )}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => onClose && onClose()}
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            {/* Tab Navigation Buttons */}
            <div className="tab-nav-buttons">
              {activeTab !== "basic" && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1].id);
                    }
                  }}
                >
                  ← Previous
                </button>
              )}
              {activeTab !== "documents" && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id);
                    }
                  }}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}