import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function ExperienceCertificateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [employees, setEmployees] = useState([]);
  const [certificateData, setCertificateData] = useState({
    employee: "",
    offer_letter: "",
    joining_date: "",
  });

  useEffect(() => {
    loadEmployees();
    if (isEditMode) {
      loadCertificateData();
    }
  }, [id]);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/certificate/employees/");
      if (res?.data?.data) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error("Error loading employees:", err);
      alert("Failed to load employees.");
    }
  };

  const loadCertificateData = async () => {
    try {
      const res = await api.get(`/certificate/experience-certificates/${id}/`);
      if (res?.data?.data) {
        const cert = res.data.data;
        setCertificateData({
          employee: cert.employee || "",
          offer_letter: cert.offer_letter || "",
          joining_date: cert.joining_date || "",
        });
      }
    } catch (err) {
      console.error("Error loading certificate:", err);
      alert("Certificate not found.");
      navigate("/experience-certificate");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!certificateData.employee) {
      alert("Please select an employee");
      return;
    }

    // Prepare payload based on API requirements
    const payload = {
      employee: Number(certificateData.employee),
    };

    // Add offer_letter or joining_date based on what's provided
    if (certificateData.offer_letter) {
      payload.offer_letter = Number(certificateData.offer_letter);
    } else if (certificateData.joining_date) {
      payload.joining_date = certificateData.joining_date;
    }

    try {
      if (isEditMode) {
        await api.put(`/certificate/experience-certificates/${id}/`, payload);
        alert("Certificate updated successfully!");
      } else {
        await api.post("/certificate/experience-certificates/", payload);
        alert("Certificate created successfully!");
      }
      navigate("/experience-certificate");
    } catch (err) {
      console.error("Error saving certificate:", err);
      alert("Failed to save certificate. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/experience-certificate");
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.formTitle}>
          {isEditMode ? "Edit Experience Certificate" : "Add Experience Certificate"}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Employee Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Employee Name:</label>
            <select
              style={styles.select}
              name="employee"
              value={certificateData.employee}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.job_title}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date (Joining Date) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Start Date:</label>
            <input
              style={styles.input}
              type="date"
              name="joining_date"
              value={certificateData.joining_date}
              onChange={handleInputChange}
              placeholder="dd-mm-yyyy"
            />
          </div>

          {/* End Date (Optional - can be used for offer_letter ID if needed) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>End Date:</label>
            <input
              style={styles.input}
              type="date"
              name="end_date"
              placeholder="dd-mm-yyyy"
            />
          </div>

          {/* Offer Letter (Optional) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Offer Letter ID (Optional):</label>
            <input
              style={styles.input}
              type="number"
              name="offer_letter"
              value={certificateData.offer_letter}
              onChange={handleInputChange}
              placeholder="Enter offer letter ID"
            />
            <small style={styles.hint}>
              Leave empty if you want to use the Start Date above
            </small>
          </div>

          {/* Submit Button */}
          <button type="submit" style={styles.submitBtn}>
            {isEditMode ? "Update" : "Add"}
          </button>
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
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "32px",
    maxWidth: "500px",
    width: "100%",
  },
  formTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "24px",
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
    fontWeight: "500",
    color: "#333",
  },
  select: {
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  input: {
    padding: "12px 14px",
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
  submitBtn: {
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "8px",
    transition: "background-color 0.2s",
  },
};