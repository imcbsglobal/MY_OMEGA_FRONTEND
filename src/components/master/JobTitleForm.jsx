import React, { use, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

export default function JobTitleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch existing job title if editing
 useEffect(() => {
  if (!isEdit) return;
  const fetchJobTitle = async () => {
    try {
     
      const res = await api.get(`api/cv-management/job-titles/${id}/`);
      const jobData = res.data;
  
      if (!jobData) throw new Error("No job data found");

      setTitle(jobData.title || "");
    } catch (error) {
      console.error("Failed to load job title:", error.response || error);
      alert("Could not fetch job title details.");
    } finally {
      setLoading(false);
    }
  };
  fetchJobTitle();
}, [id, isEdit]);


  // ✅ Save or update job title
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a Job Title");

    setSaving(true);
    try {
      const payload = { title };

      if (isEdit) {
        await api.put(`api/cv-management/job-titles/${id}/`, payload);
      } else {
        await api.post("api/cv-management/job-titles/", payload);
      }

      alert("Job Title saved successfully!");
      navigate("/master/job-titles");
    } catch (error) {
      console.error("Save failed:", error.response?.data || error);
      alert("Failed to save job title.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          color: "#4b5563",
        }}
      >
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "120px", // ✅ sits nicely below navbar
        paddingBottom: "40px",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "650px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#f8fafc",
            borderBottom: "1px solid #e5e7eb",
            padding: "18px 24px",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontWeight: "700",
              fontSize: "17px",
              color: "#111827",
            }}
          >
            {isEdit ? "Edit Job Title" : "Add New Job Title"}
          </h3>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <label
              htmlFor="jobTitle"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Job Title
            </label>
            <input
              id="jobTitle"
              type="text"
              placeholder="Enter job title (e.g., Sales Executive)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14.5px",
                color: "#111827",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/master/job-titles")}
              style={{
                background: "#6b7280",
                color: "#fff",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: "#2563eb",
                color: "#fff",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
