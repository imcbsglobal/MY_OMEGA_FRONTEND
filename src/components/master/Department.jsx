// src/HR/master/Department.jsx
import React, { useEffect, useState } from "react";
import api from "@/api/client";

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [jobTitles, setJobTitles] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===============================
     Fetch Departments
  ================================ */
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/master/departments/");
      setDepartments(res.data);
    } catch (err) {
      setError("Unable to load departments");
    }
  };

  /* ===============================
     When Department Selected
  ================================ */
  const handleDepartmentSelect = async (e) => {
    const deptId = e.target.value;
    setSelectedDeptId(deptId);
    setJobTitles([]);

    if (!deptId) return;

    try {
      setLoading(true);

      // ✅ API should filter job titles by department
      const res = await api.get(
        `/master/job-titles/?department_id=${deptId}`
      );

      setJobTitles(res.data);
    } catch (err) {
      setError("Unable to load job titles");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Add Department
  ================================ */
  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) return;

    try {
      setLoading(true);
      const res = await api.post("/master/departments/", {
        name: newDepartment,
      });

      setDepartments((prev) => [...prev, res.data]);
      setNewDepartment("");
    } catch (err) {
      setError("Unable to add department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Department Master</h2>

      {error && <p style={styles.error}>{error}</p>}

      {/* ========== Add Department ========== */}
      <div style={styles.card}>
        <h4>Add Department</h4>
        <div style={styles.row}>
          <input
            type="text"
            placeholder="Enter department name"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleAddDepartment} style={styles.button}>
            Add
          </button>
        </div>
      </div>

      {/* ========== Select Department ========== */}
      <div style={styles.card}>
        <h4>Select Department</h4>
        <select
          value={selectedDeptId}
          onChange={handleDepartmentSelect}
          style={styles.select}
        >
          <option value="">-- Select Department --</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* ========== Job Titles ========== */}
      {selectedDeptId && (
        <div style={styles.card}>
          <h4>Job Titles</h4>

          {loading ? (
            <p>Loading job titles...</p>
          ) : jobTitles.length > 0 ? (
            <ul style={styles.list}>
              {jobTitles.map((job) => (
                <li key={job.id} style={styles.listItem}>
                  {job.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No job titles found</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ===============================
   Styles
=============================== */
const styles = {
  container: {
    maxWidth: 800,
    margin: "40px auto",
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  row: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  select: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 16px",
    background: "#E85555",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  list: {
    paddingLeft: 18,
  },
  listItem: {
    marginBottom: 6,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
};
