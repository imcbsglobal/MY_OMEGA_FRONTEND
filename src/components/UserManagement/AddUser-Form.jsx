import React, { useState, useEffect } from "react";
import api from "../../api/client";

export default function AddUserForm({ onCancel, onSave, editData }) {
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    userId: "",
    password: "",
    branch: "",
    userLevel: "User",
    phoneNumber: "",
    status: "Active",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        fullName: editData.name,
        userId: editData.email,
        password: "",
        branch: editData.branch,
        userLevel: editData.user_level,
        phoneNumber: editData.phone_number,
        status: editData.is_active ? "Active" : "Inactive",
      });

      if (editData.profile_picture) {
        setProfilePicturePreview(editData.profile_picture);
      }
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "fullName") {
      setFormData((p) => ({ ...p, [name]: value.toUpperCase() }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    
    formDataToSend.append('name', formData.fullName);
    formDataToSend.append('email', formData.userId);
    formDataToSend.append('branch', formData.branch);
    formDataToSend.append('user_level', formData.userLevel);
    formDataToSend.append('phone_number', formData.phoneNumber);
    formDataToSend.append('is_active', formData.status === "Active");

    if (formData.password && formData.password.trim().length > 0) {
      formDataToSend.append('password', formData.password);
      formDataToSend.append('confirm_password', formData.password);
    }

    if (profilePicture) {
      formDataToSend.append('profile_picture', profilePicture);
    }

    try {
      if (editData) {
        await api.patch(`/users/${editData.id}/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert("User updated!");
      } else {
        if (!formData.password) {
          alert("Password is required for new users");
          return;
        }
        await api.post(`/users/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert("User created!");
      }

      onSave();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Save failed: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>{editData ? "Edit User" : "Add User"}</h2>
          <button onClick={onCancel} style={styles.backButton}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Profile Picture Section */}
          <div style={styles.pictureSection}>
            <label style={styles.sectionLabel}>Profile Picture</label>
            <div style={styles.pictureContainer}>
              <div style={styles.picturePreview}>
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile" 
                    style={styles.previewImage}
                  />
                ) : (
                  <div style={styles.placeholderAvatar}>
                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div style={styles.pictureActions}>
                <input
                  type="file"
                  id="userProfilePicture"
                  accept="image/*"
                  onChange={handlePictureChange}
                  style={styles.fileInput}
                />
                <label htmlFor="userProfilePicture" style={styles.uploadButton}>
                  📷 Choose Picture
                </label>
                {profilePicturePreview && (
                  <button 
                    type="button" 
                    onClick={handleRemovePicture}
                    style={styles.removeButton}
                  >
                    🗑️ Remove
                  </button>
                )}
                <div style={styles.helperText}>
                  Max 5MB (JPG, PNG)
                </div>
              </div>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name (UPPERCASE ONLY)</label>
              <input
                name="fullName"
                placeholder="FULL NAME"
                value={formData.fullName}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email (User ID)</label>
              <input
                name="userId"
                type="email"
                placeholder="Email (User ID)"
                value={formData.userId}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Password {!editData && <span style={styles.required}>*</span>}
              </label>
              <input
                name="password"
                type="password"
                placeholder={editData ? "Leave blank to keep current" : "Password"}
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required={!editData}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Branch</label>
              <select 
                name="branch" 
                value={formData.branch} 
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Branch</option>
                <option>Main</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>User Level</label>
              <select
                name="userLevel"
                value={formData.userLevel}
                onChange={handleChange}
                style={styles.input}
              >
                <option>User</option>
                <option>Admin</option>
                <option>Super Admin</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input
                name="phoneNumber"
                type="tel"
                placeholder="Phone"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onCancel} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              {editData ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "16px",
    background: "#f9fafb",
    minHeight: "100vh",
  },
  formCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    borderBottom: "1px solid #eee",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    margin: 0
  },
  backButton: {
    padding: "10px 16px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    width: "100%"
  },
  form: {
    padding: "16px",
  },
  pictureSection: {
    marginBottom: "20px",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "#fbfdff"
  },
  sectionLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
    display: "block"
  },
  pictureContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  picturePreview: {
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e5e7eb',
    background: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: '700',
    color: '#9ca3af',
    background: '#e5e7eb'
  },
  pictureActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%'
  },
  fileInput: {
    display: 'none'
  },
  uploadButton: {
    padding: '12px 16px',
    border: '1px solid #3b82f6',
    borderRadius: '6px',
    background: '#eff6ff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box'
  },
  removeButton: {
    padding: '12px 16px',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    background: '#fef2f2',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ef4444',
    width: '100%',
    boxSizing: 'border-box'
  },
  helperText: {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "6px",
    color: "#374151"
  },
  required: {
    color: "#ef4444"
  },
  input: {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box"
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingTop: "20px",
    marginTop: "20px",
    borderTop: "1px solid #eee",
  },
  cancelBtn: {
    padding: "12px 20px",
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    width: "100%",
    boxSizing: "border-box"
  },
  saveBtn: {
    padding: "12px 20px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box"
  },
};

// Apply media query styles for tablet and desktop
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(min-width: 768px)');
  if (mediaQuery.matches) {
    Object.assign(styles.container, { padding: "24px" });
    Object.assign(styles.header, { 
      flexDirection: "row", 
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px"
    });
    Object.assign(styles.title, { fontSize: "22px" });
    Object.assign(styles.backButton, { width: "auto" });
    Object.assign(styles.form, { padding: "20px" });
    Object.assign(styles.pictureSection, { padding: "20px", marginBottom: "24px" });
    Object.assign(styles.pictureContainer, { 
      flexDirection: 'row',
      alignItems: 'center',
      gap: '24px'
    });
    Object.assign(styles.pictureActions, { width: 'auto' });
    Object.assign(styles.uploadButton, { width: 'auto' });
    Object.assign(styles.removeButton, { width: 'auto' });
    Object.assign(styles.helperText, { textAlign: 'left' });
    Object.assign(styles.grid, { 
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "18px"
    });                         
    Object.assign(styles.footer, { 
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: "15px",
      paddingTop: "15px"
    });
    Object.assign(styles.cancelBtn, { width: "auto" });
    Object.assign(styles.saveBtn, { width: "auto" });
  }
}