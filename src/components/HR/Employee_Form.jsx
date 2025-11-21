// Employee_Form.jsx
// USER API ONLY - Fetches from User Management (CV section removed)

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    location: "",
    personal_phone: "",
    residential_phone: "",
    job_title: "",
    duty_time: "",
    joining_date: "",
    bank_account: "",
    bank_details: "",
    aadhar_url: "",
    aadhar_file_name: "",
  });

  const [loading, setLoading] = useState(false);

  // User Search States
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    if (isEdit) loadEmployee();
  }, [id]);

  // Search Users when user types
  useEffect(() => {
    if (userSearch.length >= 2) {
      searchUsers();
    } else {
      setUserResults([]);
      setShowUserDropdown(false);
    }
  }, [userSearch]);

  async function searchUsers() {
    setUserLoading(true);
    try {
      // ✅ FETCH FROM USER MANAGEMENT API
      const res = await api.get(`/users/`);
      console.log("User API Response:", res.data);
      
      // Handle all possible data structures
      let userData = res.data.data || res.data.results || res.data || [];
      
      if (!Array.isArray(userData)) {
        userData = [];
      }
      
      console.log("User Data Array:", userData);
      
      // Filter users by search query
      const query = userSearch.toLowerCase();
      const filtered = userData.filter(user => {
        const firstName = user.first_name || "";
        const lastName = user.last_name || "";
        const fullName = user.full_name || `${firstName} ${lastName}`.trim();
        const username = user.username || "";
        const email = user.email || "";
        
        return (
          fullName.toLowerCase().includes(query) ||
          firstName.toLowerCase().includes(query) ||
          lastName.toLowerCase().includes(query) ||
          username.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query)
        );
      });
      
      console.log("Filtered Users:", filtered);
      setUserResults(filtered);
      setShowUserDropdown(true);
    } catch (err) {
      console.error("User search error:", err);
      console.error("Error details:", err.response?.data);
      setUserResults([]);
    } finally {
      setUserLoading(false);
    }
  }

  function selectUser(user) {
    // ✅ AUTO-FILL FORM WITH USER DATA
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    const fullName = user.full_name || `${firstName} ${lastName}`.trim() || user.username || "";
    
    setForm({
      ...form,
      full_name: fullName,
      email: user.email || "",
      personal_phone: user.phone || user.mobile || user.phone_number || user.contact || "",
      location: user.address || user.location || user.city || "",
      residential_phone: user.residential_phone || user.home_phone || "",
    });
    
    setUserSearch(fullName);
    setShowUserDropdown(false);
  }

  async function loadEmployee() {
    setLoading(true);
    try {
      const res = await api.get(`/employee-management/employees/${id}/`);
      setForm(res.data);
    } catch (err) {
      console.error("Load error:", err);
      alert("Failed to load employee");
      navigate("/employee-management");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const value = e.target.type === "file" ? e.target.files[0] : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.patch(`/employee-management/employees/${id}/`, form);
        alert("Employee updated successfully");
      } else {
        await api.post(`/employee-management/employees/`, form);
        alert("Employee created successfully");
      }

      navigate("/employee-management", { replace: true });
    } catch (err) {
      console.error("Save error:", err);
      alert(`Failed to save employee: ${err.response?.data?.detail || err.message}`);
      setLoading(false);
    }
  }

  if (loading && isEdit) {
    return (
      <div style={S.page}>
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          Loading employee data...
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>{isEdit ? "Edit Employee" : "Add New Employee"}</h2>

      <form onSubmit={handleSubmit} style={S.formCard}>

        {/* USER SEARCH SECTION - Only show when adding new employee */}
        {!isEdit && (
          <div style={S.userSearchBox}>
            <div style={S.searchHeader}>
              <span style={S.searchIcon}>👤</span>
              <span style={S.searchTitle}>Add Employee from User Account (Optional)</span>
            </div>
            
            <div style={{ position: "relative" }}>
              <label style={S.label}>Search User by Name or Email</label>
              <input
                type="text"
                placeholder="Type to search existing users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={S.searchInput}
                autoComplete="off"
              />
              
              {userLoading && (
                <div style={S.loadingText}>Searching users...</div>
              )}
              
              {showUserDropdown && userResults.length > 0 && (
                <div style={S.dropdown}>
                  {userResults.map((user) => {
                    const firstName = user.first_name || "";
                    const lastName = user.last_name || "";
                    const displayName = user.full_name || `${firstName} ${lastName}`.trim() || user.username;
                    
                    return (
                      <div
                        key={user.id || user.user_id}
                        onClick={() => selectUser(user)}
                        style={S.dropdownItem}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
                      >
                        <div style={S.itemName}>{displayName}</div>
                        <div style={S.itemDetails}>
                          {user.email && <span>{user.email}</span>}
                          {user.username && <span> • @{user.username}</span>}
                          {(user.phone || user.mobile) && <span> • {user.phone || user.mobile}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {showUserDropdown && userResults.length === 0 && !userLoading && (
                <div style={S.dropdown}>
                  <div style={S.noResults}>No users found</div>
                </div>
              )}
            </div>
          </div>
        )}

        <Section label="Personal Information" />

        <div style={S.row}>
          <Field label="Full Name *" name="full_name" value={form.full_name} onChange={handleChange} required />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        <div style={S.row}>
          <Field label="Job Title *" name="job_title" value={form.job_title} onChange={handleChange} required />
          <Field label="Joining Date *" name="joining_date" type="date" value={form.joining_date} onChange={handleChange} required />
        </div>

        <Section label="Contact Information" />

        <div style={S.row}>
          <Field label="Personal Phone" name="personal_phone" value={form.personal_phone} onChange={handleChange} />
          <Field label="Residential Phone" name="residential_phone" value={form.residential_phone} onChange={handleChange} />
        </div>

        <Field label="Location *" name="location" value={form.location} onChange={handleChange} required />

        <Section label="Employment Details" />

        <Field label="Duty Time" name="duty_time" value={form.duty_time} onChange={handleChange} placeholder="e.g., 9 AM - 5 PM" />

        <Section label="Bank Details" />

        <div style={S.row}>
          <Field label="Bank Account" name="bank_account" value={form.bank_account} onChange={handleChange} />
          <Field label="Bank Details" name="bank_details" value={form.bank_details} onChange={handleChange} />
        </div>

        <div style={S.btnRow}>
          <button type="button" style={S.cancelBtn} onClick={() => navigate("/employee-management")} disabled={loading}>
            ✖ Cancel
          </button>

          <button type="submit" style={S.saveBtn} disabled={loading}>
            {loading ? "Saving..." : "💾 Save Employee"}
          </button>
        </div>

      </form>
    </div>
  );
}

/* FIELD COMPONENT */
function Field({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <div style={S.fieldBox}>
      <label style={S.label}>{label}</label>
      <input 
        name={name} 
        type={type} 
        value={type !== "file" ? value : undefined} 
        onChange={onChange} 
        style={S.input}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

/* SECTION TITLE */
function Section({ label }) {
  return (
    <div style={S.sectionBox}>
      <div style={S.sectionTitle}>{label}</div>
    </div>
  );
}

/* STYLES */
const S = {
  page: {
    background: "#f7f9fb",
    padding: 24,
    minHeight: "100vh",
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
  },

  formCard: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
  },

  sectionBox: {
    background: "#f3f4f6",
    padding: "8px 12px",
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },

  row: {
    display: "flex",
    gap: 16,
    marginBottom: 16,
  },

  fieldBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
    color: "#374151",
  },

  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    outline: "none",
  },

  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },

  cancelBtn: {
    background: "#f3f4f6",
    padding: "10px 16px",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    fontSize: 14,
  },

  saveBtn: {
    background: "#3b82f6",
    padding: "10px 16px",
    borderRadius: 6,
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
  },

  // User Search Styles
  userSearchBox: {
    background: "#f0fdf4",
    border: "2px solid #86efac",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },

  searchHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  searchIcon: {
    fontSize: 20,
  },

  searchTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },

  searchInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    outline: "none",
    fontSize: 14,
  },

  loadingText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    maxHeight: 300,
    overflowY: "auto",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    zIndex: 100,
  },

  dropdownItem: {
    padding: 12,
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    background: "#ffffff",
  },

  itemName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 4,
  },

  itemDetails: {
    fontSize: 12,
    color: "#6b7280",
  },

  noResults: {
    padding: 12,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },
};