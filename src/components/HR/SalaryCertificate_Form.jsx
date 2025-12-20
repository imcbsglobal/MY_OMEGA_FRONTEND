import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function SalaryCertificateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    employee: "",
    salary: "",
  });

  useEffect(() => {
    loadEmployees();
    if (isEditMode) {
      loadCertificateData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadEmployees = async () => {
    try {
      // Use the same endpoint as Employee Management
      const res = await api.get("/employee-management/employees/");
      console.log("=== SALARY CERT - EMPLOYEES RESPONSE ===", res.data);
      
      // Extract employee array (handle multiple response structures)
      let employeeData = [];
      if (Array.isArray(res.data)) {
        employeeData = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        employeeData = res.data.data;
      } else if (res?.data?.results && Array.isArray(res.data.results)) {
        employeeData = res.data.results;
      }

      console.log("Employee Data Array:", employeeData);
      
      // Process employees with same logic as EmployeeManagement.jsx
      const processedEmployees = employeeData.map((emp, index) => {
        const empId = emp.id || emp.employee_id || emp.user_id || index;
        const empName = emp.name || emp.full_name || emp.user?.name || emp.user?.full_name || emp.username || emp.user?.username || `Employee ${index + 1}`;
        const jobTitle = emp.designation || emp.job_title || emp.job_info?.designation || emp.job_info?.job_title || "No Title";
        const employeeIdDisplay = emp.employee_id || "N/A";

        return {
          id: empId,
          name: empName,
          job_title: jobTitle,
          employee_id: employeeIdDisplay,
          // Keep original data for reference
          original: emp
        };
      });

      console.log("Processed Employees:", processedEmployees);
      setEmployees(processedEmployees);
      
    } catch (err) {
      console.error("Failed to load employees:", err);
      console.error("Error details:", err.response?.data || err.message);
      alert("Failed to load employees. Check console for details.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificateData = async () => {
    try {
      const res = await api.get(`/certificate/salary-certificates/${id}/`);
      console.log("Certificate Response:", res);
      
      if (res?.data?.data) {
        const c = res.data.data;
        setForm({
          employee: c.employee,
          salary: c.salary,
        });
      } else if (res?.data) {
        const c = res.data;
        setForm({
          employee: c.employee,
          salary: c.salary,
        });
      }
    } catch (error) {
      console.error("Error loading certificate:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("Certificate not found. Check console for details.");
      navigate("/hr/salary-certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.employee || !form.salary) {
      alert("Please fill all fields.");
      return;
    }

    const payload = {
      employee: Number(form.employee),
      salary: Number(form.salary),
    };

    console.log("Submitting payload:", payload);

    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/certificate/salary-certificates/${id}/`, payload);
        alert("Salary Certificate updated!");
      } else {
        res = await api.post("/certificate/salary-certificates/", payload);
        alert("Salary Certificate created!");
      }
      console.log("Response:", res);
      navigate("/hr/salary-certificate");
    } catch (err) {
      console.error("Error saving:", err);
      console.error("Error details:", err.response?.data || err.message);
      alert(`Failed to save salary certificate. ${err.response?.data?.message || err.message || 'Please try again.'}`);
    }
  };

  const handleCancel = () => {
    navigate("/hr/salary-certificate");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ textAlign: "center", color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          {isEditMode ? "Update Salary Certificate" : "Add Salary Certificate"}
        </h2>

        {employees.length === 0 && !loading && (
          <div style={styles.warningBox}>
            <p style={styles.warningText}>⚠️ No employees found. Please add employees first.</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Employee Name: *</label>
          <select
            name="employee"
            value={form.employee}
            onChange={handleChange}
            style={styles.input}
            required
            disabled={employees.length === 0}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.job_title} (ID: {emp.employee_id})
              </option>
            ))}
          </select>

          <label style={styles.label}>Salary: *</label>
          <input
            name="salary"
            type="number"
            placeholder="Enter salary"
            value={form.salary}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              style={styles.saveBtn}
              disabled={employees.length === 0}
            >
              {isEditMode ? "Update" : "Save"}
            </button>

            <button type="button" onClick={handleCancel} style={styles.backBtn}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "40px",
    backgroundColor: "#f9fafb",
  },
  card: {
    width: "500px",
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#111827",
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "20px",
  },
  warningText: {
    color: "#92400e",
    fontSize: "14px",
    margin: 0,
    textAlign: "center",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "16px",
    marginBottom: "8px",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },
  saveBtn: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  backBtn: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};