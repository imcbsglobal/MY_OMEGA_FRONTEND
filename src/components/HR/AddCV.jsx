import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddCV.scss";

function AddCV() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [newCV, setNewCV] = useState({
    name: "",
    jobTitle: "",
    place: "",
    createdUser: "myomega@gmail.com",
    gender: "",
    address: "",
    district: "",
    phoneNumber: "",
    education: "",
    experience: "",
    dob: "",
    remarks: "",
    cvSource: "DIRECT"
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCV(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmitCV = () => {
    if (!newCV.name.trim() || !newCV.jobTitle.trim()) {
      alert("Please fill in name and job title");
      return;
    }
    console.log("Submitting CV:", newCV);
    alert("CV added successfully!");
    navigate("/hr/cv-management");
  };

  const handleCancel = () => {
    navigate("/hr/cv-management");
  };

  return (
    <div className="add-cv-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={handleCancel}>
              <span className="back-icon">←</span>
            </button>
            <h1 className="page-title">Add New CV</h1>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        <div className="form-container">
          {/* Two Column Layout */}
          <div className="form-columns">
            {/* Left Column */}
            <div className="form-column">
              {/* Added By Section */}
              <div className="form-section">
                <div className="section-title">Added By</div>
                <div className="form-group readonly-field">
                  <input
                    type="text"
                    name="createdUser"
                    value={newCV.createdUser}
                    onChange={handleInputChange}
                    className="form-input"
                    readOnly
                  />
                </div>
              </div>

              {/* Name */}
              <div className="form-section">
                <div className="section-title">Name</div>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={newCV.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter name"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">
                    Gender <span className="optional-text">(Optional)</span>
                  </label>
                  <select
                    name="gender"
                    value={newCV.gender}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">
                    Address <span className="optional-text">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newCV.address}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-section">
                <div className="section-title">Phone Number</div>
                <div className="form-group">
                  <input
                    type="text"
                    name="phoneNumber"
                    value={newCV.phoneNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Place */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Place</label>
                  <input
                    type="text"
                    name="place"
                    value={newCV.place}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter place"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              {/* District */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">District</label>
                  <select
                    name="district"
                    value={newCV.district}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {districts.map((district, index) => (
                      <option key={index} value={district === "Select a district" ? "" : district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Education */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Education</label>
                  <input
                    type="text"
                    name="education"
                    value={newCV.education}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter education"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="form-section">
                <div className="section-title">Experience</div>
                <div className="form-group">
                  <input
                    type="text"
                    name="experience"
                    value={newCV.experience}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter experience"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={newCV.jobTitle}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter job title"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">
                    Date of Birth <span className="optional-text">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={newCV.dob}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              {/* CV Source */}
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">
                    CV From <span className="optional-text">(Optional)</span>
                  </label>
                  <select
                    name="cvSource"
                    value={newCV.cvSource}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="DIRECT">Direct</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WEBSITE">Website</option>
                    <option value="JOB_PORTAL">Job Portal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Sections */}
          <div className="full-width-sections">
            {/* CV Attachment */}
            <div className="form-section">
              <div className="section-title">CV Attachment</div>
              <div className="cv-upload-section">
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="cv-file-input"
                    className="file-input"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <div className="file-upload-display">
                    <label htmlFor="cv-file-input" className="file-upload-btn">
                      Choose File
                    </label>
                    <span className="file-separator">|</span>
                    <span className="file-name">
                      {uploadedFile ? uploadedFile.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="form-section">
              <div className="section-title">Remarks</div>
              <div className="form-group">
                <textarea
                  name="remarks"
                  value={newCV.remarks}
                  onChange={handleInputChange}
                  className="form-input textarea-input"
                  placeholder="Enter remarks"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="submit-section">
            <div className="submit-actions">
              <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
              <button className="btn-submit" onClick={handleSubmitCV}>Submit CV</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCV;