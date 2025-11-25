// Employee_Form.jsx
// Updated with user fetching and selection

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formData, setFormData] = useState({
    user: '',
    employee_id: '',
    employment_status: 'Permanent',
    employment_type: 'Full-time',
    department: '',
    designation: '',
    location: '',
    duty_time: '',
    reporting_manager: '',
    date_of_joining: '',
    date_of_leaving: '',
    probation_end_date: '',
    confirmation_date: '',
    basic_salary: '',
    allowances: '',
    gross_salary: '',
    pf_number: '',
    esi_number: '',
    pan_number: '',
    aadhar_number: '',
    account_holder_name: '',
    salary_account_number: '',
    salary_bank_name: '',
    salary_ifsc_code: '',
    salary_branch: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    blood_group: '',
    marital_status: '',
    notes: '',
    is_active: true,
    // New fields for the form layout
    full_name: "",
    date_of_birth: "",
    personal_phone: "",
    residential_phone: "",
    address: "",
    place: "",
    district: "",
    organization: ""
  });

  // Fetch users list
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/users/');
      const userData = Array.isArray(response.data) ? response.data : (response.data?.results || response.data?.data || []);
      setUsers(userData);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to load users list");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (isEdit) loadEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadEmployee() {
    try {
      const res = await api.get(`/employee-management/employees/${id}/`);
      const data = res.data || {};

      setFormData(prev => ({
        ...prev,
        user: data.job_info?.user || data.user || "",
        employee_id: data.employee_id || "",
        employment_status: data.job_info?.employment_status || data.employment_status || "Permanent",
        employment_type: data.job_info?.employment_type || data.employment_type || "Full-time",
        department: data.job_info?.department || data.department || "",
        designation: data.designation || data.job_info?.designation || "",
        location: data.job_info?.location || data.location || "",
        duty_time: data.job_info?.duty_time || data.duty_time || "",
        reporting_manager: data.job_info?.reporting_manager || data.reporting_manager || "",
        date_of_joining: data.job_info?.date_of_joining || data.date_of_joining || "",
        date_of_leaving: data.job_info?.date_of_leaving || data.date_of_leaving || "",
        probation_end_date: data.job_info?.probation_end_date || data.probation_end_date || "",
        confirmation_date: data.job_info?.confirmation_date || data.confirmation_date || "",
        basic_salary: data.job_info?.basic_salary || data.basic_salary || "",
        allowances: data.job_info?.allowances || data.allowances || "",
        gross_salary: data.job_info?.gross_salary || data.gross_salary || "",
        pf_number: data.pf_number || "",
        esi_number: data.esi_number || "",
        pan_number: data.pan_number || "",
        aadhar_number: data.aadhar_number || "",
        account_holder_name: data.bank_info?.account_holder_name || "",
        salary_account_number: data.bank_info?.salary_account_number || "",
        salary_bank_name: data.bank_info?.salary_bank_name || "",
        salary_ifsc_code: data.bank_info?.salary_ifsc_code || "",
        salary_branch: data.bank_info?.salary_branch || "",
        emergency_contact_name: data.contact_info?.emergency_contact_name || "",
        emergency_contact_phone: data.contact_info?.emergency_contact_phone || "",
        emergency_contact_relation: data.contact_info?.emergency_contact_relation || "",
        blood_group: data.blood_group || "",
        marital_status: data.marital_status || "",
        notes: data.notes || "",
        is_active: data.is_active !== undefined ? data.is_active : true,
        full_name: data.full_name || "",
        personal_phone: data.personal_phone || "",
        residential_phone: data.residential_phone || ""
      }));
    } catch (err) {
      console.error("loadEmployee:", err);
      alert("Failed to load employee data");
      navigate("/employee-management");
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    // Auto-fill employee ID when user is selected
    if (name === 'user' && value) {
      const selectedUser = users.find(u => u.id === parseInt(value));
      if (selectedUser) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          employee_id: selectedUser.email || selectedUser.username || `EMP${selectedUser.id}`,
          full_name: selectedUser.name || selectedUser.full_name || selectedUser.username || ""
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

    // Validate required fields
    if (!formData.user && !isEdit) {
      alert('Please select a user');
      return;
    }

    if (!formData.employee_id) {
      alert('Employee ID is required');
      return;
    }

    if (!formData.full_name) {
      alert('Full Name is required');
      return;
    }

    // Prepare payload exactly as backend expects
    const payload = {
      user: formData.user,
      employee_id: formData.employee_id,
      employment_status: formData.employment_status,
      employment_type: formData.employment_type,
      department: formData.department,
      designation: formData.designation,
      location: formData.location,
      duty_time: formData.duty_time,
      reporting_manager: formData.reporting_manager,
      date_of_joining: formData.date_of_joining || null,
      date_of_leaving: formData.date_of_leaving || null,
      probation_end_date: formData.probation_end_date || null,
      confirmation_date: formData.confirmation_date || null,
      basic_salary: formData.basic_salary || null,
      allowances: formData.allowances || null,
      gross_salary: formData.gross_salary || null,
      pf_number: formData.pf_number,
      esi_number: formData.esi_number,
      pan_number: formData.pan_number,
      aadhar_number: formData.aadhar_number,
      account_holder_name: formData.account_holder_name,
      salary_account_number: formData.salary_account_number,
      salary_bank_name: formData.salary_bank_name,
      salary_ifsc_code: formData.salary_ifsc_code,
      salary_branch: formData.salary_branch,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      emergency_contact_relation: formData.emergency_contact_relation,
      blood_group: formData.blood_group,
      marital_status: formData.marital_status,
      notes: formData.notes,
      is_active: formData.is_active,
      full_name: formData.full_name,
      personal_phone: formData.personal_phone,
      residential_phone: formData.residential_phone
    };

    try {
      if (isEdit) {
        await api.patch(`/employee-management/employees/${id}/`, payload);
        alert("Employee updated successfully");
      } else {
        await api.post("/employee-management/employees/", payload);
        alert("Employee created successfully");
      }
      navigate("/employee-management");
    } catch (err) {
      console.error("submit:", err);
      const msg = err?.response?.data ? JSON.stringify(err.response.data) : String(err);
      alert("Failed to save: " + msg);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isEdit ? "Edit Employee" : "Add New Employee"}</h2>

        {/* CV Section
        <div style={styles.section}>
          <div style={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              id="addFromCV" 
              style={styles.checkbox}
            />
            <label htmlFor="addFromCV" style={styles.checkboxLabel}>
              Add Employee from CV (Optional)
            </label>
          </div>
          
          <div style={styles.cvSearchSection}>
            <label style={styles.label}>Search CV by Name</label>
            <input
              type="text"
              placeholder="Type to search existing CV..."
              style={styles.input}
            />
          </div>

          <div style={styles.fileUploadSection}>
            <label style={styles.label}>Upload CV</label>
            <div style={styles.fileUpload}>
              <input
                type="file"
                id="cvUpload"
                style={styles.fileInput}
                accept=".pdf,.doc,.docx"
              />
              <label htmlFor="cvUpload" style={styles.fileLabel}>
                Choose File
              </label>
              <span style={styles.fileName}>No file chosen</span>
            </div>
          </div>

          <div style={styles.cvActions}>
            <button type="button" style={styles.secondaryButton}>
              Education
            </button>
            <button type="button" style={styles.secondaryButton}>
              Experience
            </button>
          </div>
        </div> */}

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
                <label style={styles.label}>
                  Phone <span style={styles.required}>*</span>
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

              {/* <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="3"
                  placeholder="Full address..."
                />
              </div> */}

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
                  
                  {/* Kerala Districts */}
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

                  {/* Manual entry option */}
                  <option value="manual">Other (Manual Entry)</option>
                </select>

                {/* Conditional manual entry input */}
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

              {/* <div style={styles.formGroup}>
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
                  <option value="district1">District 1</option>
                  <option value="district2">District 2</option>
                  <option value="district3">District 3</option>
                </select>
              </div> */}

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
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={styles.input}
                />
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
                <label style={styles.label}>Reporting Manager</label>
                <input
                  type="text"
                  name="reporting_manager"
                  value={formData.reporting_manager}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Leaving</label>
                <input
                  type="date"
                  name="date_of_leaving"
                  value={formData.date_of_leaving}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Probation End Date</label>
                <input
                  type="date"
                  name="probation_end_date"
                  value={formData.probation_end_date}
                  onChange={handleChange}
                  style={styles.input}
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
                <label style={styles.label}>Allowances</label>
                <input
                  type="number"
                  name="allowances"
                  value={formData.allowances}
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
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px'
  },
  checkboxLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  cvSearchSection: {
    marginBottom: '16px'
  },
  fileUploadSection: {
    marginBottom: '16px'
  },
  fileUpload: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  fileInput: {
    display: 'none'
  },
  fileLabel: {
    padding: '8px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151'
  },
  fileName: {
    fontSize: '14px',
    color: '#6b7280'
  },
  cvActions: {
    display: 'flex',
    gap: '12px'
  },
  secondaryButton: {
    padding: '8px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151'
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
    boxSizing: 'border-box'
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