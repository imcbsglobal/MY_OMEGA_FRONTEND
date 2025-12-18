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

  // Load Employees and Certificate Data
  useEffect(() => {
    loadEmployees();
    if (isEditMode) loadCertificateData();
  }, [id]);

  // Load all employees
  const loadEmployees = async () => {
    try {
      const res = await api.get("/certificate/employees/");
      if (res?.data?.data) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // If edit mode, load existing certificate
  const loadCertificateData = async () => {
    try {
      const res = await api.get(`/certificate/salary-certificates/${id}/`);
      if (res?.data?.data) {
        const c = res.data.data;
        setForm({
          employee: c.employee,
          salary: c.salary,
        });
      }
    } catch (error) {
      console.error("Error loading certificate:", error);
      alert("Certificate not found");
      navigate("/hr/salary-certificate");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save Certificate (POST or PUT)
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

    try {
      if (isEditMode) {
        await api.put(`/certificate/salary-certificates/${id}/`, payload);
        alert("Salary Certificate updated!");
      } else {
        await api.post("/certificate/salary-certificates/", payload);
        alert("Salary Certificate created!");
      }
      navigate("/hr/salary-certificate");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save salary certificate.");
    }
  };

  const handleCancel = () => {
    navigate("/hr/salary-certificate");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          {isEditMode ? "Update Salary Certificate" : "Add Salary Certificate"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Employee Dropdown */}
          <label style={styles.label}>Employee Name:</label>
          <select
            name="employee"
            value={form.employee}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.job_title})
              </option>
            ))}
          </select>

          {/* Salary Input */}
          <label style={styles.label}>Salary:</label>
          <input
            name="salary"
            type="number"
            placeholder="Enter salary"
            value={form.salary}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.saveBtn}>
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

// =============== STYLES ===============
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