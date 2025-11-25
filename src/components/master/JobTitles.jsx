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
      const { data } = await api.get("/cv-management/job-titles/");
      setTitles(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching job titles:", error);
      alert("Failed to load job titles.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete job title
  const handleDelete = async (uuid) => {
    if (!window.confirm("Are you sure you want to delete this job title?")) return;
    try {
      await api.delete(`/cv-management/job-titles/${uuid}/`);
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
        paddingTop: "120px", // ✅ space below navbar
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
          maxWidth: "900px",
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
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px", fontWeight: 600 }}>#</th>
                <th style={{ padding: "12px", fontWeight: 600 }}>Job Title</th>
                <th style={{ padding: "12px", fontWeight: 600 }}>Created</th>
                <th style={{ padding: "12px", fontWeight: 600, textAlign: "right" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {titles.map((item, index) => (
                <tr key={item.uuid} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{index + 1}</td>
                  <td style={{ padding: "12px" }}>{item.title}</td>
                  <td style={{ padding: "12px" }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button
                      onClick={() =>
                        navigate(`/master/job-titles/${item.id}/edit`)
                      }
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        marginRight: "8px",
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
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
