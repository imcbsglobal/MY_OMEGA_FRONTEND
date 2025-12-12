import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function JobTitles() {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch job titles
  useEffect(() => {
    fetchJobTitles();
  }, []);

  const fetchJobTitles = async () => {
    try {
      const { data } = await api.get("cv-management/job-titles/");
      const titlesData = data.data || data;
      setTitles(Array.isArray(titlesData) ? titlesData : []);
    } catch (error) {
      console.error("Error fetching job titles:", error);
      alert("Failed to load job titles.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete job title
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job title?")) return;
    try {
      await api.delete(`cv-management/job-titles/${id}/`);
      alert("Job title deleted successfully!");
      fetchJobTitles();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete job title.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#4b5563" }}>
        <h3>Loading job titles...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        paddingTop: "120px",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
          padding: "24px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontWeight: 700, color: "#111827" }}>Job Titles</h2>
          <button
            onClick={() => navigate("/master/job-titles/new")}
            style={{
              background: "#2563eb",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            + Add Job Title
          </button>
        </div>

        {titles.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            No job titles found.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", backgroundColor: "#f8fafc" }}>
                  <th style={{ padding: "12px", fontWeight: 600, color: "#374151" }}>#</th>
                  <th style={{ padding: "12px", fontWeight: 600, color: "#374151" }}>Department</th>
                  <th style={{ padding: "12px", fontWeight: 600, color: "#374151" }}>Job Title</th>
                  <th style={{ padding: "12px", fontWeight: 600, color: "#374151" }}>Created</th>
                  <th style={{ padding: "12px", fontWeight: 600, textAlign: "right", color: "#374151" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {titles.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", color: "#6b7280" }}>{index + 1}</td>
                    <td style={{ padding: "12px" }}>
                      {item.department_detail ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          {item.department_detail.name}
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: "13px" }}>No Department</span>
                      )}
                    </td>
                    <td style={{ padding: "12px", fontWeight: 500, color: "#111827" }}>
                      {item.title}
                    </td>
                    <td style={{ padding: "12px", color: "#6b7280", fontSize: "13px" }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button
                        onClick={() => navigate(`/master/job-titles/${item.id}/edit`)}
                        style={{
                          background: "#10b981",
                          color: "#fff",
                          padding: "8px 12px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          marginRight: "8px",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          padding: "8px 12px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}