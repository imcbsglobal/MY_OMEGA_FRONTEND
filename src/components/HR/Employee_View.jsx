// Employee_View.jsx
// API CONNECTED - Color theme matched to CV Management

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function EmployeeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  async function fetchEmployee() {
    try {
      const res = await api.get(`/employee-management/employees/${id}/`);
      setEmployee(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      alert(`Failed to load employee: ${err.response?.data?.detail || err.message}`);
      navigate("/employee-management");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#6b7280" }}>
        Loading employee details…
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>{employee.name}</h2>
            <p style={styles.subText}>{employee.email}</p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => navigate(`/employee-management/edit/${id}`)}
              style={styles.editBtn}
            >
              Edit
            </button>
            <button
              onClick={() => navigate("/employee-management")}
              style={styles.backBtn}
            >
              Back
            </button>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>

          <div style={styles.grid}>
            <Info label="Name" value={employee.name} />
            <Info label="Email" value={employee.email} />
            <Info label="Personal Phone" value={employee.personal_phone} />
            <Info label="Residential Phone" value={employee.residential_phone} />
          </div>
        </div>

        {/* JOB DETAILS */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Employment Details</h3>

          <div style={styles.grid}>
            <Info label="Job Title" value={employee.job_title} />
            <Info label="Duty Time" value={employee.duty_time} />
            <Info label="Joining Date" value={employee.joining_date} />
            <Info label="Location" value={employee.location} />
          </div>
        </div>

        {/* BANK DETAILS */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Bank Details</h3>

          <div style={styles.grid}>
            <Info label="Bank Account" value={employee.bank_account} />

            <div style={{ gridColumn: "1 / -1" }}>
              <Info label="Bank Details" value={employee.bank_details} />
            </div>
          </div>
        </div>

        {/* AADHAR */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Aadhar</h3>

          {employee.aadhar_file_name ? (
            <div style={styles.fileBox}>
              <span>{employee.aadhar_file_name}</span>
              <button
                onClick={() => window.open(employee.aadhar_url, "_blank")}
                style={styles.viewBtn}
              >
                View
              </button>
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>No aadhar uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value || "N/A"}</div>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    background: "#f9fafb",
    minHeight: "100vh",
  },
  card: {
    maxWidth: 1000,
    margin: "0 auto",
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" },
  subText: { margin: 0, color: "#6b7280" },

  editBtn: {
    background: "#fef3c7",
    border: "1px solid #fde68a",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },
  backBtn: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },

  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 10,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 6,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  label: { fontSize: 12, color: "#6b7280", fontWeight: 600 },
  value: { fontSize: 14, color: "#111827", marginTop: 4 },

  fileBox: {
    padding: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
  },

  viewBtn: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    color: "#3b82f6",
  },
};