import React, { useState, useEffect } from "react";
import api from "../../api/client"; // ✅ axios instance
import { toast } from "react-toastify";

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

  // ✅ Prefill when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        fullName: editData.name || "",
        userId: editData.email || "",
        password: "",
        branch: editData.branch || "",
        userLevel: editData.user_level || "User",
        phoneNumber: editData.phone_number || "",
        status: editData.is_active ? "Active" : "Inactive",
      });
    }
  }, [editData]);

  // ✅ Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit handler (with confirm_password + no photo)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Password validation for new users
    if (!editData && !formData.password?.trim()) {
      alert("Please enter a password before creating a new user.");
      return;
    }

    try {
      const payload = {
        name: formData.fullName,
        username: formData.userId,
        email: formData.userId,
        password: formData.password,
        confirm_password: formData.password,
        branch: formData.branch,
        user_level: formData.userLevel,
        phone_number: formData.phoneNumber,
        is_active: formData.status === "Active",
      };

      const url = editData
        ? `/users/${editData.id}/`
        : `/users/`;

      const res = editData
        ? await api.patch(url, payload)
        : await api.post(url, payload);

      // 🔹 Success message
      alert(editData ? "✅ User updated successfully!" : "🎉 User added successfully!");
      toast.success(editData ? "User updated successfully!" : "User added successfully!");

      onSave && onSave(res.data);
    } catch (error) {
      console.error("User save failed:", error.response?.data || error.message);
      alert(JSON.stringify(error.response?.data || error.message, null, 2));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {editData ? "Edit User" : "Add New User"}
          </h2>
          <button onClick={onCancel} style={styles.backButton}>
            ← Back to List
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Full Name */}
            <div style={styles.field}>
              <label style={styles.label}>Full Name *</label>
              <input
                style={styles.input}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label}>Email (User ID) *</label>
              <input
                style={styles.input}
                name="userId"
                type="email"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                autoComplete="new-password"
                required={!editData}
              />
            </div>

            {/* Branch */}
            <div style={styles.field}>
              <label style={styles.label}>Branch *</label>
              <select
                style={styles.input}
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
              >
                <option value="">Select Branch</option>
                <option>MAIN</option>
              </select>
            </div>

            {/* User Level */}
            <div style={styles.field}>
              <label style={styles.label}>User Level</label>
              <select
                style={styles.input}
                name="userLevel"
                value={formData.userLevel}
                onChange={handleChange}
              >
                <option value="">Select User Level</option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>

            {/* Phone */}
            <div style={styles.field}>
              <label style={styles.label}>Phone</label>
              <input
                style={styles.input}
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Footer */}
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

// ✅ Styles (unchanged)
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
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "15px",
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
