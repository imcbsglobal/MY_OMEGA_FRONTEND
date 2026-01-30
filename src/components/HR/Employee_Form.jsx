// Employee_Form.jsx - FIXED EDIT MODE LOADING
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [jobTitles, setJobTitles] = useState([]);
  const [loadingJobTitles, setLoadingJobTitles] = useState(false);

  const [formData, setFormData] = useState({
    user: "",
    employee_id: "",
    employment_status: "Permanent",
    employment_type: "Full-time",
    department: "",
    designation: "",
    location: "",
    duty_time: "",
    reporting_manager: "",
    date_of_joining: "",
    date_of_leaving: "",
    probation_end_date: "",
    confirmation_date: "",
    basic_salary: "",
    allowances: "",
    gross_salary: "",
    pf_number: "",
    esi_number: "",
    pan_number: "",
    aadhar_number: "",
    account_holder_name: "",
    salary_account_number: "",
    salary_bank_name: "",
    salary_ifsc_code: "",
    salary_branch: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    blood_group: "",
    marital_status: "",
    notes: "",
    is_active: true,
    full_name: "",
    date_of_birth: "",
    personal_phone: "",
    residential_phone: "",
    phone_number: "",
    address: "",
    place: "",
    district: "",
    organization: "",
    avatar: null,
    avatar_preview: null
  });

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('users/');
      const userData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || response.data?.data || []);
      setUsers(userData);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to load users list");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchJobTitles = async () => {
    setLoadingJobTitles(true);
    try {
      const res = await api.get("cv-management/job-titles/");
      const data = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.results || res.data?.data || []);
      setJobTitles(data);
      console.log("Job titles loaded:", data);
    } catch (err) {
      console.error("Failed to fetch job titles:", err);
    } finally {
      setLoadingJobTitles(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchJobTitles();
    if (isEdit) loadEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadEmployee() {
    try {
      const res = await api.get(`/employee-management/employees/${id}/`);
      const data = res.data || {};
      
      console.log("=== LOADING EMPLOYEE FOR EDIT ===", JSON.stringify(data, null, 2));

     setFormData(prev => ({
  ...prev,
  ...data,                                // ⭐ AUTO-FILL EVERYTHING
  user: data.user ?? "",
  personal_phone: data.personal_phone ?? data.phone_number ?? "",
  avatar_preview: data.avatar_url ?? null,
  is_active: data.is_active ?? true
}));

    } catch (err) {
      console.error("loadEmployee:", err);
      alert("Failed to load employee data");
      navigate("/employee-management");
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (name === 'user' && value) {
      const selectedUser = users.find(u => u.id === parseInt(value));
      if (selectedUser) {
        setFormData(prev => ({ 
          ...prev, 
          user: value,
          employee_id: selectedUser.email || selectedUser.username || `EMP${selectedUser.id}`,
          full_name: selectedUser.name || selectedUser.full_name || selectedUser.username || ""
        }));
        return;
      }
    }
    
    // Handle job title selection - auto-fill department
    if (name === 'designation' && value) {
      const selectedJobTitle = jobTitles.find(job => 
        (job.title === value) || 
        (job.name === value) || 
        (job.id?.toString() === value)
      );
      
      if (selectedJobTitle) {
        console.log("Selected job title:", selectedJobTitle);
        console.log("Department detail:", selectedJobTitle.department_detail);
        
        const departmentName = selectedJobTitle.department_detail?.name || "";
        
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          department: departmentName
        }));
        return;
      }
    }
    
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Required field validation
    if (!formData.user) {
      alert("Please select a user");
      return;
    }

    if (!formData.employee_id) {
      alert("Employee ID is required");
      return;
    }

    if (!formData.full_name) {
      alert("Full Name is required");
      return;
    }

    if (!formData.date_of_birth) {
      alert("Date of Birth is required");
      return;
    }

    if (!formData.personal_phone) {
      alert("Personal Phone is required");
      return;
    }

    if (!formData.place) {
      alert("Place is required");
      return;
    }

    if (!formData.district) {
      alert("District is required");
      return;
    }

    if (!formData.designation) {
      alert("Job Title is required");
      return;
    }

    if (!formData.date_of_joining) {
      alert("Joining Date is required");
      return;
    }

    const fd = new FormData();

    // Add user as integer
    fd.append("user", parseInt(formData.user));

   const fieldsToSubmit = {
  employee_id: formData.employee_id,
  full_name: formData.full_name,
  date_of_birth: formData.date_of_birth,

  // 📞 CONTACT (FIXED)
  phone_number: formData.phone_number || formData.personal_phone,
  personal_phone: formData.personal_phone || formData.phone_number,
  residential_phone: formData.residential_phone,
  address: formData.address,
  place: formData.place,
  district: formData.district,

  // 🚨 EMERGENCY
  emergency_contact_name: formData.emergency_contact_name,
  emergency_contact_phone: formData.emergency_contact_phone,
  emergency_contact_relation: formData.emergency_contact_relation,

  // 💼 JOB
  designation: formData.designation,
  department: formData.department,
  date_of_joining: formData.date_of_joining,
  location: formData.location,
  duty_time: formData.duty_time,
  confirmation_date: formData.confirmation_date,
  employment_status: formData.employment_status,
  employment_type: formData.employment_type,
  organization: formData.organization || "",

  // 💰 SALARY
  basic_salary: formData.basic_salary,
  allowances: formData.allowances,
  gross_salary: formData.gross_salary,

  // 🏦 BANK
  account_holder_name: formData.account_holder_name,
  salary_account_number: formData.salary_account_number,
  salary_bank_name: formData.salary_bank_name,
  salary_ifsc_code: formData.salary_ifsc_code,
  salary_branch: formData.salary_branch,

  // 🆔 IDS
  pf_number: formData.pf_number,
  esi_number: formData.esi_number,
  pan_number: formData.pan_number,
  aadhar_number: formData.aadhar_number,

  // 📝 OTHER
  blood_group: formData.blood_group,
  marital_status: formData.marital_status,
  notes: formData.notes,
  is_active: formData.is_active
};


   Object.keys(fieldsToSubmit).forEach((key) => {
  fd.append(key, fieldsToSubmit[key] ?? "");
});


    // Add avatar if present
    if (formData.avatar && typeof formData.avatar !== "string") {
      fd.append("avatar", formData.avatar);
    }

    console.log("Submitting Employee Data:");
    for (let pair of fd.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      if (isEdit) {
        await api.patch(`/employee-management/employees/${id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Employee updated successfully");
      } else {
        await api.post("/employee-management/employees/", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Employee created successfully");
      }

      navigate("/employee-management");
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.data) {
        const errors = err.response.data;
        let errorMessage = "Failed to save employee:\n";
        
        Object.keys(errors).forEach(key => {
          if (Array.isArray(errors[key])) {
            errorMessage += `${key}: ${errors[key].join(", ")}\n`;
          } else {
            errorMessage += `${key}: ${errors[key]}\n`;
          }
        });
        
        alert(errorMessage);
      } else {
        alert("Failed to save employee. Please check the console for details.");
      }
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isEdit ? "Edit Employee" : "Add New Employee"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* User Selection */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>User Account</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Select User <span style={styles.required}>*</span>
                </label>
                <select
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  style={styles.input}
                  required={!isEdit}
                  disabled={isEdit}
                >
                  <option value="">Select a User</option>
                  {loadingUsers ? (
                    <option value="">Loading users...</option>
                  ) : (
                    users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.full_name || user.username || user.email} 
                        {user.email ? ` (${user.email})` : ''}
                      </option>
                    ))
                  )}
                </select>
                {!isEdit && (
                  <div style={styles.helperText}>
                    Selecting a user will auto-fill Employee ID and Full Name
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Employee ID <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="Auto-filled when user is selected"
                />
              </div>
            </div>
          </div>

          {/* Employee Photo Upload */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Employee Photo</h3>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f9fafb"
                }}
              >
                {formData.avatar_preview ||
                (formData.avatar && typeof formData.avatar === "string") ? (
                  <img
                    src={formData.avatar_preview || formData.avatar}
                    alt="preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: "#9ca3af" }}>No Photo</span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Upload Photo <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={!isEdit}
                  style={{
                    padding: "10px 0",
                    fontSize: 14,
                  }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData((prev) => ({
                        ...prev,
                        avatar: file,
                        avatar_preview: URL.createObjectURL(file),
                      }));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Full Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="Auto-filled when user is selected"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Date of Birth <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Blood Group</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Marital Status</label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Contact Information</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Phone (Personal) <span style={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="personal_phone"
                  value={formData.personal_phone}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone (Residential)</label>
                <input
                  type="tel"
                  name="residential_phone"
                  value={formData.residential_phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="3"
                  placeholder="Full residential address"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Place <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  District <span style={styles.required}>*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select a District</option>
                  <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                  <option value="Kollam">Kollam</option>
                  <option value="Pathanamthitta">Pathanamthitta</option>
                  <option value="Alappuzha">Alappuzha</option>
                  <option value="Kottayam">Kottayam</option>
                  <option value="Idukki">Idukki</option>
                  <option value="Ernakulam">Ernakulam</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Palakkad">Palakkad</option>
                  <option value="Malappuram">Malappuram</option>
                  <option value="Kozhikode">Kozhikode</option>
                  <option value="Wayanad">Wayanad</option>
                  <option value="Kannur">Kannur</option>
                  <option value="Kasaragod">Kasaragod</option>
                  <option value="manual">Other (Manual Entry)</option>
                </select>

                {formData.district === "manual" && (
                  <input
                    type="text"
                    name="district_manual"
                    placeholder="Enter district manually"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, district: e.target.value }))
                    }
                    style={{ ...styles.input, marginTop: "10px" }}
                  />
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Emergency Contact Relation</label>
                <input
                  type="text"
                  name="emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., Father, Mother, Spouse"
                />
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Job Information</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Job Title <span style={styles.required}>*</span>
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select Job Title</option>
                  {loadingJobTitles ? (
                    <option value="">Loading job titles...</option>
                  ) : (
                    jobTitles.map((title) => (
                      <option key={title.id ?? title.name} value={title.name ?? title.title ?? title.id}>
                        {title.name ?? title.title ?? title.id}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <div style={styles.departmentContainer}>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={styles.departmentInput}
                    placeholder="Auto-filled from job title"
                    readOnly
                  />
                  {formData.department && (
                    <div style={styles.departmentBadge}>
                      Auto-filled
                    </div>
                  )}
                </div>
                <div style={styles.helperText}>
                  Department is automatically filled when you select a job title
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Joining Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="date_of_joining"
                  value={formData.date_of_joining}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Organization name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Duty Time</label>
                <input
                  type="text"
                  name="duty_time"
                  value={formData.duty_time}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmation Date</label>
                <input
                  type="date"
                  name="confirmation_date"
                  value={formData.confirmation_date}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Employment Status</label>
                <select
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Probation">Probation</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Employment Type</label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Salary Information</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Basic Salary</label>
                <input
                  type="number"
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Gross Salary</label>
                <input
                  type="number"
                  name="gross_salary"
                  value={formData.gross_salary}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Bank Details</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Salary Account Number</label>
                <input
                  type="text"
                  name="salary_account_number"
                  value={formData.salary_account_number}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Bank Name</label>
                <input
                  type="text"
                  name="salary_bank_name"
                  value={formData.salary_bank_name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>IFSC Code</label>
                <input
                  type="text"
                  name="salary_ifsc_code"
                  value={formData.salary_ifsc_code}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Branch</label>
                <input
                  type="text"
                  name="salary_branch"
                  value={formData.salary_branch}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Government IDs */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Government IDs</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>PF Number</label>
                <input
                  type="text"
                  name="pf_number"
                  value={formData.pf_number}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>ESI Number</label>
                <input
                  type="text"
                  name="esi_number"
                  value={formData.esi_number}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>PAN Number</label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Aadhar Number</label>
                <input
                  type="text"
                  name="aadhar_number"
                  value={formData.aadhar_number}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Additional Information</h3>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="4"
                  placeholder="Additional notes..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  Active Employee
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={styles.formActions}>
            <button 
              type="button" 
              onClick={() => navigate("/employee-management")} 
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={styles.submitButton}
            >
              {isEdit ? "Update Employee" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '20px',
    background: '#f7f9fb',
    minHeight: '100vh'
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '24px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px'
  },
  section: {
    marginBottom: '24px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    background: '#fbfdff'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '8px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  },
  required: {
    color: '#dc2626'
  },
  helperText: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    fontStyle: 'italic'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  departmentContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  departmentInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#f8fafc',
    color: '#374151',
    cursor: 'not-allowed',
  },
  departmentBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px'
  },
  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px'
  },
  checkboxLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    alignItems: 'center'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  submitButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    background: '#3b82f6',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff'
  }
};