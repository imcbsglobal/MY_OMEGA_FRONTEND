// EmployeeManagement.jsx
// FIXED - Handles all possible field name variations from API

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/client";

export default function EmployeeManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEmployees();
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
      console.log("Sample Employee (raw):", employeeData[0]);
      
      if (employeeData.length > 0) {
        console.log("All fields in first employee:", Object.keys(employeeData[0]));
        console.log("Full first employee:", JSON.stringify(employeeData[0], null, 2));
      }

      // Process employees - Map ALL possible field variations
      const processedEmployees = employeeData.map((emp, index) => {
        // ID: Try multiple variations
        const id = emp.id || emp.employee_id || emp.pk || emp._id || emp.uuid || index;
        
        // Name: Try ALL possible field names (full_name is primary for this API)
        const name = emp.full_name || 
                     emp.name || 
                     emp.employee_name || 
                     emp.username || 
                     emp.user_name ||
                     emp.display_name ||
                     emp.first_name ||
                     `Employee ${index + 1}`;

        // Email: Try variations
        const email = emp.email || emp.user_email || emp.email_address || "";

        // Job Title: Try variations  
        const job_title = emp.job_title || emp.position || emp.role || emp.designation || "";

        // Phone: Try variations
        const personal_phone = emp.personal_phone || emp.phone || emp.mobile || emp.contact || "";
        const residential_phone = emp.residential_phone || emp.home_phone || "";

        // Location: Try variations
        const location = emp.location || emp.address || emp.city || emp.place || "";

        // Joining Date: Try variations
        const joining_date = emp.joining_date || emp.join_date || emp.hire_date || emp.start_date || "";

        // Duty Time
        const duty_time = emp.duty_time || emp.work_hours || emp.shift || "";

        // Bank Details
        const bank_account = emp.bank_account || emp.account_number || "";
        const bank_details = emp.bank_details || emp.bank_info || "";

        console.log(`Processing Employee ${index}:`, {
          id,
          name,
          email,
          job_title,
          originalData: emp
        });

        return {
          ...emp, // Keep all original fields
          id,
          name,
          email,
          job_title,
          personal_phone,
          residential_phone,
          location,
          joining_date,
          duty_time,
          bank_account,
          bank_details
        };
      });

      console.log("Processed Employees:", processedEmployees);
      console.log("Sample Processed Employee:", processedEmployees[0]);

      setEmployees(processedEmployees);
      
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
    if (!search || search.trim() === "") return true;
    
    const q = search.toLowerCase();
    return (
      (e.name || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.job_title || "").toLowerCase().includes(q) ||
      (e.personal_phone || "").toString().includes(q)
    );
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
        <strong>Total:</strong> {employees.length} | 
        <strong> Filtered:</strong> {filtered.length} | 
        <strong> Search:</strong> "{search}"
        <span style={{ marginLeft: 10, fontSize: 11, color: "#92400e" }}>
          (Check console for detailed field mapping)
        </span>
      </div>

      {/* Main Split Layout */}
      <div style={S.main}>
        {/* LEFT LIST */}
        <div style={S.left}>
          <div style={S.leftHeader}>
            Employee Directory ({filtered.length})
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
                    <div style={S.avatar}>
                      {emp.name ? emp.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={S.leftName}>{emp.name || "Unknown"}</div>
                      <div style={S.leftJob}>{emp.job_title || "No Title"}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={S.noResults}>
                {employees.length === 0 
                  ? "No employees found. Click '+ Add Employee' to create one." 
                  : "No employees match your search."}
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
          <div style={S.detailAvatar}>{firstLetter}</div>
          <div>
            <div style={S.detailName}>{employee.name || "Unknown"}</div>
            <div style={S.detailEmail}>{employee.email || "No email"}</div>
            <div style={S.badge}>ACTIVE</div>
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
          <Info label="Job Title" value={employee.job_title} />
          <Info label="Joining Date" value={employee.joining_date} />
          <Info label="Duty Time" value={employee.duty_time} />
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Contact Details</div>
        <div style={S.grid}>
          <Info label="Personal Phone" value={employee.personal_phone} />
          <Info label="Residential Phone" value={employee.residential_phone} />
          <Info label="Location" value={employee.location} />
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Bank Details</div>
        <div style={S.grid}>
          <Info label="Bank Account" value={employee.bank_account} />
          <Info label="Bank Details" value={employee.bank_details} />
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
  left: { width: 300, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" },
  leftHeader: { padding: 12, fontWeight: 700, background: "#f3f4f6", borderBottom: "1px solid #e5e7eb", color: "#374151", fontSize: 13 },
  leftList: { maxHeight: "70vh", overflowY: "auto" },
  leftItem: { padding: 12, borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.2s" },
  leftItemActive: { background: "#eef2ff" },
  leftRow: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, background: "#e0e7ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#4338ca", flexShrink: 0 },
  leftName: { fontWeight: 700, fontSize: 14, color: "#111827" },
  leftJob: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  noResults: { textAlign: "center", padding: 30, color: "#6b7280", fontSize: 14 },
  
  right: { flex: 1, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" },
  empty: { textAlign: "center", padding: 40, color: "#6b7280", fontSize: 14 },
  
  detailCard: { display: "flex", flexDirection: "column", gap: 20 },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
  detailAvatar: { width: 70, height: 70, background: "#eef2ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#4c1d95" },
  detailName: { fontSize: 20, fontWeight: 700, color: "#111827" },
  detailEmail: { color: "#6b7280", marginTop: 2, fontSize: 14 },
  badge: { background: "#d1fae5", color: "#059669", padding: "4px 10px", borderRadius: 12, display: "inline-block", fontSize: 11, fontWeight: 700, marginTop: 6 },
  editBtn: { background: "#fef3c7", border: "1px solid #fde68a", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  deleteBtn: { background: "#fee2e2", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  
  section: { background: "#fbfdff", padding: 14, borderRadius: 8, border: "1px solid #e5e7eb" },
  sectionTitle: { fontWeight: 700, color: "#374151", marginBottom: 10, fontSize: 14 },
  grid: { display: "flex", gap: 12, flexWrap: "wrap" },
  infoBox: { flex: 1, minWidth: 150, background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #e5e7eb" },
  infoLabel: { fontSize: 12, color: "#6b7280", fontWeight: 600 },
  infoValue: { fontSize: 14, marginTop: 4, color: "#374151" },
};

export { S };