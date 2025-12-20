import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function ExperienceCertificateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState({
    employee: "",
    offer_letter: "",
    joining_date: "",
    end_date: "",
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
      console.log("=== EXPERIENCE CERT - EMPLOYEES RESPONSE ===", res.data);
      
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
      console.error("Error loading employees:", err);
      console.error("Error details:", err.response?.data || err.message);
      alert("Failed to load employees. Check console for details.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificateData = async () => {
    try {
      const res = await api.get(`/certificate/experience-certificates/${id}/`);
      console.log("Certificate Response:", res);
      
      if (res?.data?.data) {
        const cert = res.data.data;
        setCertificateData({
          employee: cert.employee || "",
          offer_letter: cert.offer_letter || "",
          joining_date: cert.joining_date || "",
          end_date: cert.end_date || "",
        });
      } else if (res?.data) {
        const cert = res.data;
        setCertificateData({
          employee: cert.employee || "",
          offer_letter: cert.offer_letter || "",
          joining_date: cert.joining_date || "",
          end_date: cert.end_date || "",
        });
      }
    } catch (err) {
      console.error("Error loading certificate:", err);
      console.error("Error details:", err.response?.data || err.message);
      alert("Certificate not found. Check console for details.");
      navigate("/experience-certificate");
    } finally {
      setLoading(false);
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

    const payload = {
      employee: Number(certificateData.employee),
    };

    if (certificateData.offer_letter) {
      payload.offer_letter = Number(certificateData.offer_letter);
    }
    
    if (certificateData.joining_date) {
      payload.joining_date = certificateData.joining_date;
    }
    
    if (certificateData.end_date) {
      payload.end_date = certificateData.end_date;
    }

    console.log("Submitting payload:", payload);

    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/certificate/experience-certificates/${id}/`, payload);
        alert("Certificate updated successfully!");
      } else {
        res = await api.post("/certificate/experience-certificates/", payload);
        alert("Certificate created successfully!");
      }
      console.log("Response:", res);
      navigate("/experience-certificate");
    } catch (err) {
      console.error("Error saving certificate:", err);
      console.error("Error details:", err.response?.data || err.message);
      alert(`Failed to save certificate. ${err.response?.data?.message || err.message || 'Please try again.'}`);
    }
  };

  const handleCancel = () => {
    navigate("/experience-certificate");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.formCard}>
          <p style={{ textAlign: "center", color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.formTitle}>
          {isEditMode ? "Edit Experience Certificate" : "Add Experience Certificate"}
        </h2>

        {employees.length === 0 && !loading && (
          <div style={styles.warningBox}>
            <p style={styles.warningText}>⚠️ No employees found. Please add employees first.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Employee Name: *</label>
            <select
              style={styles.select}
              name="employee"
              value={certificateData.employee}
              onChange={handleInputChange}
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
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Start Date (Joining Date):</label>
            <input
              style={styles.input}
              type="date"
              name="joining_date"
              value={certificateData.joining_date}
              onChange={handleInputChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>End Date:</label>
            <input
              style={styles.input}
              type="date"
              name="end_date"
              value={certificateData.end_date}
              onChange={handleInputChange}
            />
          </div>

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

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              style={styles.submitBtn}
              disabled={employees.length === 0}
            >
              {isEditMode ? "Update" : "Add"}
            </button>
            
            <button 
              type="button" 
              onClick={handleCancel} 
              style={styles.cancelBtn}
            >
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
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  submitBtn: {
    flex: 1,
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
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
    backgroundColor: "#e5e7eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};