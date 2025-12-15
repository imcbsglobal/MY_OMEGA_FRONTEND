// src/pages/CVForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CV, toApiPayload, toUi } from "../../api/cv";

export default function CVForm() {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const isEditMode = Boolean(uuid);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [jobTitles, setJobTitles] = useState([]);
  const [cvData, setCvData] = useState({
    name: "",
    jobTitleId: null,
    jobTitle: "",
    place: "",
    createdUser: "",
    createdDate: "",
    gender: "",
    address: "",
    district: "",
    phoneNumber: "",
    email: "",
    education: "",
    experience: "",
    dob: "",
    remarks: "",
    cvSource: "Direct",
    cvAttachmentUrl: "",
    cvFileName: "",
  });

  // ✅ Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await CV.jobTitles();
        setJobTitles(list || []);
      } catch (e) {
        console.warn("Failed to load job titles", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const data = await CV.get(uuid);
        setCvData(toUi(data));
      } catch (e) {
        console.error(e);
        showError("CV not found");
        navigate("/cv-management");
      }
    })();
  }, [uuid]);

  // ✅ Show custom modal
  const showError = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCvData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle phone number - only allow digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    if (value.length <= 10) {
      setCvData((prev) => ({ ...prev, phoneNumber: value }));
    }
  };

  const handleJobTitleChange = (e) => {
    const selectedValue = e.target.value;
    
    if (!selectedValue) {
      setCvData(prev => ({ 
        ...prev, 
        jobTitle: "",
        jobTitleId: null 
      }));
      return;
    }
    
    const selectedJob = jobTitles.find(job => 
      (job.id && String(job.id) === selectedValue) || 
      (job.name && job.name === selectedValue) ||
      (job.title && job.title === selectedValue)
    );
    
    if (selectedJob) {
      setCvData(prev => ({
        ...prev,
        jobTitle: selectedJob.name || selectedJob.title || selectedValue,
        jobTitleId: selectedJob.id || null
      }));
    } else {
      setCvData(prev => ({
        ...prev,
        jobTitle: selectedValue,
        jobTitleId: null
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      showError(`❌ File Size Too Large: The file "${file.name}" is ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed size is 2MB. Please compress or choose a smaller file.`);
      e.target.value = "";
      return;
    }

    setUploadedFile(file);
    setCvData((prev) => ({ ...prev, cvFileName: file.name }));
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setCvData((prev) => ({ ...prev, cvFileName: "" }));
  };

  const formatDobForApi = (dob) => {
    if (!dob) return "";
    const parts = dob.split("-");
    if (parts.length === 3) {
      const [a, b, c] = parts;
      if (Number(a) > 31) return dob;
      return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
    }
    return dob;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation with VERY specific error messages
    if (!cvData.name.trim()) {
      showError("Name is required. Please enter the candidate's full name in the 'Name' field.");
      return;
    }

    if (!cvData.jobTitleId) {
      showError("Job Title is required. Please select a job position from the 'Job Title' dropdown menu.");
      return;
    }

    if (!cvData.phoneNumber.trim()) {
      showError("Phone Number is required. Please enter a valid 10-digit mobile number in the 'Phone Number' field.");
      return;
    }

    if (!/^\d{10}$/.test(cvData.phoneNumber)) {
      showError(`Phone Number is invalid. You entered "${cvData.phoneNumber}". Please enter exactly 10 digits (e.g., 9876543210).`);
      return;
    }

    // ✅ Very specific date validation
    if (!cvData.dob || cvData.dob.trim() === "") {
      showError("Date of Birth is required. Please click on the 'Date of Birth' field and select a date from the calendar.");
      return;
    }

    const formattedDob = formatDobForApi(cvData.dob);
    if (!formattedDob.match(/^\d{4}-\d{2}-\d{2}$/)) {
      showError(`Date of Birth format is incorrect. The date "${cvData.dob}" could not be processed. Please select a valid date using the calendar picker.`);
      return;
    }

    try {
      const updatedData = { ...cvData, dob: formattedDob };

      if (isEditMode) {
        if (uploadedFile) {
          const form = toApiPayload(updatedData, uploadedFile);
          await CV.update(uuid, form, true);
        } else {
          const form = toApiPayload(updatedData, null);
          const json = Object.fromEntries(form.entries());
          await CV.update(uuid, json, false);
        }
        showError("✅ Success! The CV has been updated successfully in the system.");
      } else {
        const form = toApiPayload(updatedData, uploadedFile);
        await CV.create(form);
        showError("✅ Success! The CV has been added successfully to the database.");
      }

      window.dispatchEvent(new Event("cv-updated"));
      setTimeout(() => navigate("/cv-management"), 1500);
    } catch (error) {
      console.error("Error saving CV:", error);
      const msg =
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "❌ Failed to save CV. Please check your internet connection and try again.";
      showError(msg);
    }
  };

  const handleCancel = () => navigate("/cv-management");

  const styles = {
    container: {
      padding: "40px",
      fontFamily: "Inter, sans-serif",
      backgroundColor: "#f9fafb",
      minHeight: "100vh",
    },
    formCard: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "30px",
      maxWidth: "900px",
      margin: "0 auto",
    },
    formHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    formTitle: {
      fontSize: "24px",
      fontWeight: "600",
    },
    backButton: {
      backgroundColor: "#9ca3af",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontWeight: "600",
      color: "#374151",
    },
    input: {
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
    },
    fileInput: {
      marginTop: "8px",
    },
    filePreview: {
      marginTop: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#f3f4f6",
      padding: "8px 12px",
      borderRadius: "6px",
    },
    fileName: { fontSize: "14px", color: "#374151" },
    removeFileBtn: {
      backgroundColor: "#ef4444",
      color: "#fff",
      border: "none",
      padding: "4px 10px",
      borderRadius: "4px",
      cursor: "pointer",
    },
    textarea: {
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      padding: "8px 12px",
      fontSize: "14px",
    },
    formFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "20px",
    },
    cancelBtn: {
      backgroundColor: "#9ca3af",
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "6px",
      cursor: "pointer",
    },
    submitBtn: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "6px",
      cursor: "pointer",
    },
    // ✅ Modal Styles - Matching your app's design
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    },
    modalBox: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "24px",
      minWidth: "400px",
      maxWidth: "500px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    modalTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "12px",
    },
    modalMessage: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "20px",
      lineHeight: "1.5",
    },
    modalButton: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "10px 24px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      width: "100%",
    },
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
            {/* Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                style={styles.input}
                name="name"
                value={cvData.name}
                onChange={(e) =>
                  setCvData((prev) => ({
                    ...prev,
                    name: e.target.value.toUpperCase(),
                  }))
                }
                required
              />
            </div>

            {/* Job Title */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Job Title *</label>
              <select
                style={styles.input}
                name="jobTitle"
                value={cvData.jobTitleId || ""}
                onChange={handleJobTitleChange}
                required
              >
                <option value="">-- Select Job Title --</option>
                {jobTitles.map((job) => {
                  const displayName = job.name || job.title || String(job);
                  const value = job.id ? String(job.id) : displayName;
                  
                  return (
                    <option key={value} value={value}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Gender */}
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
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Phone Number */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                style={styles.input}
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                value={cvData.phoneNumber}
                onChange={handlePhoneChange}
                required
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                style={styles.input}
                name="email"
                value={cvData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Place / District */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Place</label>
              <input
                style={styles.input}
                name="place"
                value={cvData.place}
                onChange={handleInputChange}
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
                <option value="">Select District</option>
                <option value="Alappuzha">Alappuzha</option>
                <option value="Ernakulam">Ernakulam</option>
                <option value="Idukki">Idukki</option>
                <option value="Kannur">Kannur</option>
                <option value="Kasaragod">Kasaragod</option>
                <option value="Kollam">Kollam</option>
                <option value="Kottayam">Kottayam</option>
                <option value="Kozhikode">Kozhikode</option>
                <option value="Malappuram">Malappuram</option>
                <option value="Palakkad">Palakkad</option>
                <option value="Pathanamthitta">Pathanamthitta</option>
                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                <option value="Thrissur">Thrissur</option>
                <option value="Wayanad">Wayanad</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <input
                style={styles.input}
                name="address"
                value={cvData.address}
                onChange={handleInputChange}
              />
            </div>

            {/* Education / Experience */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Education</label>
              <input
                style={styles.input}
                name="education"
                value={cvData.education}
                onChange={handleInputChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Experience</label>
              <input
                style={styles.input}
                name="experience"
                value={cvData.experience}
                onChange={handleInputChange}
              />
            </div>

            {/* DOB */}
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

            {/* Source */}
            <div style={styles.formGroup}>
              <label style={styles.label}>CV Source</label>
              <select
                style={styles.input}
                name="cvSource"
                value={cvData.cvSource}
                onChange={handleInputChange}
              >
                <option value="Direct">Direct</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Job Portal">Job Portal</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>CV Attachment</label>
            <input
              style={styles.fileInput}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            {cvData.cvFileName && (
              <div style={styles.filePreview}>
                <span style={styles.fileName}>{cvData.cvFileName}</span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={styles.removeFileBtn}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Remarks</label>
            <textarea
              style={styles.textarea}
              name="remarks"
              value={cvData.remarks}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div style={styles.formFooter}>
            <button
              type="button"
              onClick={handleCancel}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              {isEditMode ? "Update CV" : "Submit CV"}
            </button>
          </div>
        </form>
      </div>

      {/* ✅ Custom Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Validation Alert</h3>
            <p style={styles.modalMessage}>{modalMessage}</p>
            <button style={styles.modalButton} onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}