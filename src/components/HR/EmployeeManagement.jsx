// EmployeeManagement.jsx
// Updated with job titles API integration

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/client";

export default function EmployeeManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTitles, setLoadingTitles] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Jobs");
  const [organizationFilter, setOrganizationFilter] = useState("All Organizations");

  // Fetch employees and job titles
  useEffect(() => {
    loadEmployees();
    loadJobTitles();
  }, [location]);

  async function loadEmployees() {
    setLoading(true);
    try {
      const res = await api.get("/employee-management/employees/");
      
      console.log("=== EMPLOYEE API RESPONSE ===");
      console.log("Raw Response:", res.data);
      
      // Extract employee array
      let employeeData = [];
      if (Array.isArray(res.data)) {
        employeeData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        employeeData = res.data.data;
      } else if (res.data?.results && Array.isArray(res.data.results)) {
        employeeData = res.data.results;
      }

      console.log("Employee Data Array:", employeeData);
      
      // Process employees with exact backend field names
      const processedEmployees = employeeData.map((emp, index) => {
        const id = emp.id || emp.employee_id || index;
        
        return {
          ...emp,
          id,
          name: emp.full_name || `Employee ${index + 1}`,
          email: emp.user_email || "",
          job_title: emp.designation || emp.job_info?.designation || "",
          personal_phone: emp.personal_phone || "",
          location: emp.location || emp.job_info?.location || "",
          joining_date: emp.date_of_joining || emp.job_info?.date_of_joining || "",
          duty_time: emp.duty_time || emp.job_info?.duty_time || "",
          department: emp.department || emp.job_info?.department || "",
          employment_status: emp.employment_status || emp.job_info?.employment_status || "",
          is_active: emp.is_active !== undefined ? emp.is_active : true,
          profile_picture: emp.avatar_url || emp.profile_picture || ""
        };
      });

      console.log("Processed Employees:", processedEmployees);

      setEmployees(processedEmployees);
      
      // Extract unique departments from employees
      const uniqueDepartments = [...new Set(processedEmployees
        .map(e => e.department)
        .filter(Boolean))];
      setDepartments(uniqueDepartments);
      
      if (processedEmployees.length > 0) {
        setSelectedId(processedEmployees[0].id);
      }
      
    } catch (err) {
      console.error("❌ Load Error:", err);
      console.error("Error Response:", err.response?.data);
      alert(`Failed to load employees: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadJobTitles() {
    setLoadingTitles(true);
    try {
      const { data } = await api.get("/cv-management/job-titles/");
      
      console.log("=== JOB TITLES API RESPONSE ===");
      console.log("Raw Response:", data);
      
      // Extract job titles array
      let titlesData = [];
      if (Array.isArray(data)) {
        titlesData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        titlesData = data.data;
      } else if (data?.results && Array.isArray(data.results)) {
        titlesData = data.results;
      }

      console.log("Job Titles Data:", titlesData);
      
      // Extract just the title strings
      const titles = titlesData
        .map(item => item.title || item.name)
        .filter(Boolean)
        .sort();
      
      setJobTitles(titles);
      
    } catch (err) {
      console.error("❌ Job Titles Load Error:", err);
      alert(`Failed to load job titles: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoadingTitles(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    
    try {
      await api.delete(`/employee-management/employees/${id}/`);
      const updatedEmployees = employees.filter((e) => e.id !== id);
      setEmployees(updatedEmployees);
      
      if (selectedId === id) {
        setSelectedId(updatedEmployees.length > 0 ? updatedEmployees[0].id : null);
      }
      alert("Employee deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Failed to delete employee: ${err.response?.data?.detail || err.message}`);
    }
  }

  const filtered = employees.filter((e) => {
    // Search filter
    const searchMatch = !search || search.trim() === "" ? true : (
      (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.job_title || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.employee_id || "").toString().toLowerCase().includes(search.toLowerCase()) ||
      (e.department || "").toLowerCase().includes(search.toLowerCase())
    );

    // Status filter (Job Title filter)
    const statusMatch = statusFilter === "All Jobs" ? true : 
      (e.job_title || "").toLowerCase() === statusFilter.toLowerCase();

    // Organization filter (Department filter)
    const organizationMatch = organizationFilter === "All Organizations" ? true : 
      (e.department || "").toLowerCase() === organizationFilter.toLowerCase();

    return searchMatch && statusMatch && organizationMatch;
  });

  if (loading) {
    return (
      <div style={S.page}>
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          Loading employees...
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h2 style={S.title}>Employee Management</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={S.search}
          />
          <button style={S.addBtn} onClick={() => navigate("/employee-management/add")}>
            + Add Employee
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div style={S.debugBanner}>
        <strong>Total Employees:</strong> {employees.length} | 
        <strong> Filtered:</strong> {filtered.length} | 
        <strong> Job Titles:</strong> {jobTitles.length} |
        <strong> Departments:</strong> {departments.length}
      </div>

      {/* Main Split Layout */}
      <div style={S.main}>
        {/* LEFT LIST */}
        <div style={S.left}>
          {/* Filter Section */}
          <div style={S.filterSection}>
            <div style={S.filterHeader}>Filters</div>
            
            <div style={S.filterGroup}>
              <div style={S.filterLabel}>Search</div>
              <input
                placeholder="Search by name, ID, job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={S.filterInput}
              />
            </div>
            
            <div style={S.filterGroup}>
              <div style={S.filterLabel}>Status</div>
              <div style={S.selectContainer}>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={S.filterSelect}
                  disabled={loadingTitles}
                >
                  <option value="All Jobs">All Jobs</option>
                  {jobTitles.map((title, index) => (
                    <option key={index} value={title}>{title}</option>
                  ))}
                </select>
                <div style={S.selectArrow}>▼</div>
              </div>
              {loadingTitles && (
                <div style={S.loadingText}>Loading job titles...</div>
              )}
            </div>
            
            <div style={S.filterGroup}>
              <div style={S.filterLabel}>Organization</div>
              <div style={S.selectContainer}>
                <select 
                  value={organizationFilter} 
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                  style={S.filterSelect}
                >
                  <option value="All Organizations">All Organizations</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
                <div style={S.selectArrow}>▼</div>
              </div>
            </div>
          </div>

          <div style={S.leftHeader}>
            Employee Directory ({filtered.length} employee(s))
          </div>

          <div style={S.leftList}>
            {filtered.length > 0 ? (
              filtered.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedId(emp.id)}
                  style={
                    emp.id === selectedId
                      ? { ...S.leftItem, ...S.leftItemActive }
                      : S.leftItem
                  }
                >
                  <div style={S.leftRow}>
                    {emp.profile_picture ? (
                      <img 
                        src={emp.profile_picture || emp.avatar_url || ""} 
                        alt={emp.name} 
                        style={S.profilePicture} 
                      />
                    ) : (
                      <div style={S.avatar}>
                        {emp.name ? emp.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={S.leftName}>{emp.name || "Unknown"}</div>
                      <div style={S.leftJob}>{emp.job_title || "No Title"}</div>
                      <div style={S.leftId}>ID: {emp.employee_id || "N/A"}</div>
                    </div>
                    <div style={{
                      ...S.statusBadge,
                      background: emp.is_active ? "#d1fae5" : "#fee2e2",
                      color: emp.is_active ? "#059669" : "#dc2626"
                    }}>
                      {emp.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={S.noResults}>
                {employees.length === 0 
                  ? "No employees found. Click '+ Add Employee' to create one." 
                  : "No employees match your search or filters."}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div style={S.right}>
          {!selectedId || employees.length === 0 ? (
            <div style={S.empty}>
              {employees.length === 0 
                ? "No employees available" 
                : "Select an employee"}
            </div>
          ) : (
            <EmployeeDetail
              employee={employees.find((e) => e.id === selectedId)}
              onEdit={() => navigate(`/employee-management/edit/${selectedId}`)}
              onDelete={() => handleDelete(selectedId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* Right Side Detail Card */
function EmployeeDetail({ employee, onEdit, onDelete }) {
  if (!employee) {
    return <div style={S.empty}>Employee not found</div>;
  }

  const firstLetter = employee.name ? employee.name.charAt(0).toUpperCase() : "?";

  return (
    <div style={S.detailCard}>
      <div style={S.detailHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {employee.avatar_url || employee.profile_picture ? (
            <img
              src={employee.avatar_url || employee.profile_picture}
              alt={employee.name}
              style={S.detailProfilePicture}
            />
          ) : (
            <div style={S.detailAvatar}>{firstLetter}</div>
          )}
          <div>
            <div style={S.detailName}>{employee.name || "Unknown"}</div>
            <div style={S.detailEmail}>{employee.email || "No email"}</div>
            <div style={S.detailId}>Employee ID: {employee.employee_id || "N/A"}</div>
            <div style={{
              ...S.badge,
              background: employee.is_active ? "#d1fae5" : "#fee2e2",
              color: employee.is_active ? "#059669" : "#dc2626"
            }}>
              {employee.is_active ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onEdit} style={S.editBtn}>✎ Edit</button>
          <button onClick={onDelete} style={S.deleteBtn}>🗑 Delete</button>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Job Information</div>
        <div style={S.grid}>
          <Info label="Employee ID" value={employee.employee_id} />
          <Info label="Designation" value={employee.designation || employee.job_info?.designation} />
          <Info label="Department" value={employee.department || employee.job_info?.department} />
          <Info label="Employment Status" value={employee.employment_status || employee.job_info?.employment_status} />
          <Info label="Employment Type" value={employee.employment_type || employee.job_info?.employment_type} />
          <Info label="Location" value={employee.location || employee.job_info?.location} />
          <Info label="Duty Time" value={employee.duty_time || employee.job_info?.duty_time} />
          <Info label="Reporting Manager" value={employee.reporting_manager || employee.job_info?.reporting_manager} />
          <Info label="Date of Joining" value={employee.date_of_joining || employee.job_info?.date_of_joining} />
          <Info label="Date of Leaving" value={employee.date_of_leaving || employee.job_info?.date_of_leaving} />
          <Info label="Probation End Date" value={employee.probation_end_date || employee.job_info?.probation_end_date} />
          <Info label="Confirmation Date" value={employee.confirmation_date || employee.job_info?.confirmation_date} />
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Salary Information</div>
        <div style={S.grid}>
          <Info label="Basic Salary" value={employee.basic_salary || employee.job_info?.basic_salary} />
          <Info label="Allowances" value={employee.allowances || employee.job_info?.allowances} />
          <Info label="Gross Salary" value={employee.gross_salary || employee.job_info?.gross_salary} />
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Contact Details</div>
        <div style={S.grid}>
          <Info label="Personal Phone" value={employee.personal_phone} />
          <Info label="Emergency Contact Name" value={employee.contact_info?.emergency_contact_name} />
          <Info label="Emergency Contact Phone" value={employee.contact_info?.emergency_contact_phone} />
          <Info label="Emergency Contact Relation" value={employee.contact_info?.emergency_contact_relation} />
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Bank Details</div>
        <div style={S.grid}>
          <Info label="Account Holder Name" value={employee.bank_info?.account_holder_name} />
          <Info label="Salary Account Number" value={employee.bank_info?.salary_account_number} />
          <Info label="Bank Name" value={employee.bank_info?.salary_bank_name} />
          <Info label="IFSC Code" value={employee.bank_info?.salary_ifsc_code} />
          <Info label="Branch" value={employee.bank_info?.salary_branch} />
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Personal Information</div>
        <div style={S.grid}>
          <Info label="PF Number" value={employee.pf_number} />
          <Info label="ESI Number" value={employee.esi_number} />
          <Info label="PAN Number" value={employee.pan_number} />
          <Info label="Aadhar Number" value={employee.aadhar_number} />
          <Info label="Blood Group" value={employee.blood_group} />
          <Info label="Marital Status" value={employee.marital_status} />
          <Info label="Notes" value={employee.notes} />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={S.infoBox}>
      <div style={S.infoLabel}>{label}</div>
      <div style={S.infoValue}>{value || "—"}</div>
    </div>
  );
}

/* STYLES */
const S = {
  page: { padding: 20, background: "#f7f9fb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: "#111827" },
  search: { padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", width: 260, outline: "none" },
  addBtn: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  
  debugBanner: {
    background: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
    fontSize: 13,
    color: "#78350f",
  },

  main: { display: "flex", gap: 20 },
  left: { width: 350, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" },
  
  // Filter Section Styles
  filterSection: {
    padding: 16,
    borderBottom: "1px solid #e5e7eb",
  },
  filterHeader: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
    display: "block",
  },
  filterInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    backgroundColor: "#fff",
    color: "#111827",
  },
  selectContainer: {
    position: "relative",
    width: "100%",
  },
  filterSelect: {
    width: "100%",
    padding: "10px 12px",
    paddingRight: "32px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    backgroundColor: "#fff",
    color: "#111827",
    appearance: "none",
    cursor: "pointer",
  },
  selectArrow: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6b7280",
    fontSize: "12px",
    pointerEvents: "none",
  },
  loadingText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  
  leftHeader: { 
    padding: 12, 
    fontWeight: 700, 
    background: "#f3f4f6", 
    borderBottom: "1px solid #e5e7eb", 
    color: "#374151", 
    fontSize: 14,
  },
  leftList: { maxHeight: "calc(70vh - 200px)", overflowY: "auto" },
  leftItem: { padding: 12, borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.2s" },
  leftItemActive: { background: "#eef2ff" },
  leftRow: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, background: "#e0e7ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#4338ca", flexShrink: 0 },
  profilePicture: { width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb", flexShrink: 0 },
  leftName: { fontWeight: 700, fontSize: 14, color: "#111827" },
  leftJob: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  leftId: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  statusBadge: { fontSize: 10, padding: "2px 6px", borderRadius: 8, fontWeight: 600 },
  noResults: { textAlign: "center", padding: 30, color: "#6b7280", fontSize: 14 },
  
  right: { flex: 1, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" },
  empty: { textAlign: "center", padding: 40, color: "#6b7280", fontSize: 14 },
  
  detailCard: { display: "flex", flexDirection: "column", gap: 20 },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 },
  detailAvatar: { width: 70, height: 70, background: "#eef2ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#4c1d95" },
  detailProfilePicture: { width: 70, height: 70, borderRadius: 8, objectFit: "cover", border: "2px solid #e5e7eb" },
  detailName: { fontSize: 20, fontWeight: 700, color: "#111827" },
  detailEmail: { color: "#6b7280", marginTop: 2, fontSize: 14 },
  detailId: { color: "#6b7280", marginTop: 2, fontSize: 12 },
  badge: { padding: "4px 10px", borderRadius: 12, display: "inline-block", fontSize: 11, fontWeight: 700, marginTop: 6 },
  editBtn: { background: "#fef3c7", border: "1px solid #fde68a", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  deleteBtn: { background: "#fee2e2", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  
  section: { background: "#fbfdff", padding: 14, borderRadius: 8, border: "1px solid #e5e7eb" },
  sectionTitle: { fontWeight: 700, color: "#374151", marginBottom: 10, fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 },
  infoBox: { background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #e5e7eb" },
  infoLabel: { fontSize: 12, color: "#6b7280", fontWeight: 600 },
  infoValue: { fontSize: 14, marginTop: 4, color: "#374151" },
};

export { S };