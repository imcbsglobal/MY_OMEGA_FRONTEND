import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function ExperienceCertificateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employee: "",
    offer_letter: "",
    joining_date: "",
  });

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
          const certificateRes = await api.get(`/certificate/experience-certificates/${id}/`);
          if (certificateRes?.data?.success) {
            const certificate = certificateRes.data.data;
            setForm({
              employee: certificate.employee?.toString() || "",
              offer_letter: certificate.offer_letter?.toString() || "",
              joining_date: certificate.joining_date || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try again.");
        if (isEditMode) {
          alert("Certificate not found");
          navigate("/experience-certificate");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.employee) {
      setError("Please select an employee.");
      return;
    }

    // Validate joining date if provided
    if (form.joining_date) {
      const joiningDate = new Date(form.joining_date);
      const today = new Date();
      if (joiningDate > today) {
        setError("Joining date cannot be in the future.");
        return;
      }
    }

    // Prepare payload based on API requirements
    const payload = {
      employee: parseInt(form.employee, 10),
    };

    // Add either offer_letter or joining_date (or both)
    if (form.offer_letter) {
      payload.offer_letter = parseInt(form.offer_letter, 10);
    }
    
    if (form.joining_date) {
      payload.joining_date = form.joining_date;
    }

    // If neither is provided, show error
    if (!form.offer_letter && !form.joining_date) {
      setError("Please provide either Offer Letter ID or Joining Date.");
      return;
    }

    try {
      if (isEditMode) {
        await api.put(`/certificate/experience-certificates/${id}/`, payload);
        alert("Experience Certificate updated successfully!");
      } else {
        await api.post("/certificate/experience-certificates/", payload);
        alert("Experience Certificate created successfully!");
      }
      navigate("/experience-certificate");
    } catch (err) {
      console.error("Error saving certificate:", err);
      const errorMsg = err.response?.data?.message || "Failed to save experience certificate.";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.formCard}>
          <div style={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.formTitle}>
          {isEditMode ? "Edit Experience Certificate" : "Create Experience Certificate"}
        </h2>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Employee Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Employee Name: *
            </label>
            <select
              style={styles.select}
              name="employee"
              value={form.employee}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.designation || emp.job_title} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Joining Date */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Joining Date: *
            </label>
            <input
              style={styles.input}
              type="date"
              name="joining_date"
              value={form.joining_date}
              onChange={handleInputChange}
              required
            />
            <small style={styles.hint}>
              Select the employee's joining date. Cannot be in the future.
            </small>
          </div>

          {/* End Date (Optional - not in API but useful for certificate) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              End Date (Optional):
            </label>
            <input
              style={styles.input}
              type="date"
              name="end_date"
              placeholder="dd-mm-yyyy"
              onChange={handleInputChange}
            />
            <small style={styles.hint}>
              Optional: For experience period end date. Leave empty for "till date".
            </small>
          </div>

          {/* Offer Letter ID (Optional) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Offer Letter ID (Optional):
            </label>
            <input
              style={styles.input}
              type="number"
              name="offer_letter"
              value={form.offer_letter}
              onChange={handleInputChange}
              placeholder="Enter offer letter ID"
              min="1"
            />
            <small style={styles.hint}>
              Optional: If you have an offer letter reference number.
            </small>
          </div>

          {/* Submit Buttons */}
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitBtn}>
              {isEditMode ? "Update Certificate" : "Create Certificate"}
            </button>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => navigate("/experience-certificate")}
            >
              Cancel
            </button>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              <strong>Note:</strong>
              <br />• The certificate will be automatically generated with today's issue date.
              <br />• Your name will be recorded as the generator.
              <br />• If an offer letter ID is provided, the joining date from the offer letter will be used.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "40px",
    maxWidth: "500px",
    width: "100%",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "30px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  select: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  hint: {
    fontSize: "12px",
    color: "#6b7280",
    fontStyle: "italic",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },
  submitBtn: {
    flex: 1,
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  cancelBtn: {
    flex: 1,
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    border: "1px solid #fecaca",
    marginBottom: "10px",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "16px",
  },
  infoBox: {
    marginTop: "20px",
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