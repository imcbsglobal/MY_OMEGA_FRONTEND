import React, { useState, useEffect } from "react";
import api from "../../api/client";

export default function AddUserForm({ onCancel, onSave, editData }) {
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
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // base payload (no password)
  const payload = {
    name: formData.fullName,
    email: formData.userId,
    branch: formData.branch,
    user_level: formData.userLevel,
    phone_number: formData.phoneNumber,
    is_active: formData.status === "Active",
  };

  // 🔥 Only include password if user typed something
  if (formData.password && formData.password.trim().length > 0) {
    payload.password = formData.password;
    payload.confirm_password = formData.password;
  }

  try {
    if (editData) {
      await api.patch(`/users/${editData.id}/`, payload);
      alert("User updated!");
    } else {
      // 🔥 Backend requires password for new users
      payload.password = formData.password;
      payload.confirm_password = formData.password;

      await api.post(`/users/`, payload);
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
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                name="fullName"
                placeholder="Full Name"
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
                placeholder="Email (User ID)"
                value={formData.userId}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
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
              {editData ? "Update" : "Create"}
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
    justifyContent: "space-between",
    padding: "20px",
    borderBottom: "1px solid #eee",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
  },
  backButton: {
    padding: "10px 16px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  form: {
    padding: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "6px",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "15px",
    marginTop: "15px",
    borderTop: "1px solid #eee",
  },
  cancelBtn: {
    padding: "10px 20px",
    border: "1px solid #ccc",
    background: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "10px 20px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};