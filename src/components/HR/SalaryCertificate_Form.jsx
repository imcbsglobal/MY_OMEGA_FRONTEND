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
      navigate("/salary-certificate");
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
      navigate("/salary-certificate");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save salary certificate.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          {isEditMode ? "Update Salary Certificate" : "Add Salary Certificate"}
        </h2>

        {/* Employee Dropdown */}
        <label style={styles.label}>Employee Name:</label>
        <select
          name="employee"
          value={form.employee}
          onChange={handleChange}
          style={styles.input}
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
        />

        {/* Buttons */}
        <button style={styles.saveBtn} onClick={handleSubmit}>
          {isEditMode ? "Update" : "Save"}
        </button>

        <button style={styles.backBtn} onClick={() => navigate("/salary-certificate")}>
          Back
        </button>
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
    backgroundColor: "#ffffff",
  },
  card: {
    width: "400px",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#333",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "12px",
    marginBottom: "6px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    fontSize: "14px",
  },
  saveBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0d7641",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "10px",
  },
  backBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#dddddd",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
