import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function SalaryCertificateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employee: "",
    salary: "",
  });

  // Load Employees
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load employees
        const employeesRes = await api.get("/certificate/employees/");
        if (employeesRes?.data?.success) {
          setEmployees(employeesRes.data.data || []);
        }

        // If edit mode, load existing certificate
        if (isEditMode) {
          const certificateRes = await api.get(`/certificate/salary-certificates/${id}/`);
          if (certificateRes?.data?.success) {
            const certificate = certificateRes.data.data;
            setForm({
              employee: certificate.employee?.toString() || "",
              salary: certificate.salary?.toString() || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try again.");
        if (isEditMode) {
          alert("Certificate not found");
          navigate("/salary-certificate");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.employee || !form.salary) {
      setError("Please fill all required fields.");
      return;
    }

    const salaryValue = parseFloat(form.salary);
    if (isNaN(salaryValue) || salaryValue <= 0) {
      setError("Salary must be a valid number greater than zero.");
      return;
    }

    const payload = {
      employee: parseInt(form.employee, 10),
      salary: salaryValue,
    };

    try {
      if (isEditMode) {
        await api.put(`/certificate/salary-certificates/${id}/`, payload);
        alert("Salary Certificate updated successfully!");
      } else {
        await api.post("/certificate/salary-certificates/", payload);
        alert("Salary Certificate created successfully!");
      }
      navigate("/salary-certificate");
    } catch (err) {
      console.error("Error saving certificate:", err);
      const errorMsg = err.response?.data?.message || "Failed to save salary certificate.";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loading}>Loading...</div>
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

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Employee Dropdown */}
          <label style={styles.label}>
            Employee Name: *
          </label>
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
                {emp.name} ({emp.designation || emp.job_title})
              </option>
            ))}
          </select>

          {/* Salary Input */}
          <label style={styles.label}>
            Salary: *
          </label>
          <div style={styles.inputGroup}>
            <span style={styles.currencySymbol}>₹</span>
            <input
              name="salary"
              type="number"
              placeholder="Enter salary amount"
              value={form.salary}
              onChange={handleChange}
              style={{ ...styles.input, paddingLeft: '40px' }}
              min="0"
              step="0.01"
              required
            />
          </div>
          <small style={styles.hint}>Enter amount in Indian Rupees (INR)</small>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.saveBtn}
            >
              {isEditMode ? "Update Certificate" : "Create Certificate"}
            </button>

            <button
              type="button"
              style={styles.backBtn}
              onClick={() => navigate("/salary-certificate")}
            >
              Cancel
            </button>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              <strong>Note:</strong> 
              <br />• The certificate will be automatically generated with today's date.
              <br />• Your name will be recorded as the generator.
            </p>
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
    padding: "40px 20px",
    backgroundColor: "#f5f7fa",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  heading: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "30px",
    color: "#1a1a1a",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "20px",
    marginBottom: "8px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    marginBottom: "5px",
    fontSize: "14px",
    backgroundColor: "#fff",
    transition: "border-color 0.2s",
  },
  inputGroup: {
    position: "relative",
    width: "100%",
  },
  currencySymbol: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
  },
  hint: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "15px",
    display: "block",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
  },
  saveBtn: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#2563eb",
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
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "16px",
  },
  infoBox: {
    marginTop: "25px",
    padding: "15px",
    backgroundColor: "#f0f9ff",
    borderRadius: "8px",
    border: "1px solid #bae6fd",
  },
  infoText: {
    fontSize: "13px",
    color: "#0369a1",
    margin: "0",
    lineHeight: "1.5",
  },
};