// src/pages/InterviewManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import api from "../../api/client";
import { CV, toUi } from "../../api/cv";

function getResultStyle(result) {
  const resultStyles = {
    pending: { backgroundColor: "#fef3c7", color: "#92400e" },
    selected: { backgroundColor: "#d1fae5", color: "#065f46" },
    rejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
  };
  return resultStyles[result?.toLowerCase()] || {
    backgroundColor: "#f3f4f6",
    color: "#374151",
  };
}

export default function Interview_List() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cvLoading, setCvLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [updatingIds, setUpdatingIds] = useState(new Set());

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const endpoints = [
          "/interview-management/",
          "/api/interviews/",
          "/interviews/"
        ];

        let interviewData = [];
        
        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint);
            interviewData = res?.data?.data || res?.data || res || [];
            if (interviewData.length > 0) {
              console.log(`Interviews fetched from ${endpoint}:`, interviewData);
              break;
            }
          } catch (err) {
            console.log(`Interview endpoint ${endpoint} failed:`, err.message);
            continue;
          }
        }

        setInterviews(interviewData);
      } catch (error) {
        console.error("Error fetching interviews:", error);
        if (error.response?.status !== 404) {
          alert("Failed to load interview data!");
        }
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        setCvLoading(true);
        console.log("Fetching CVs...");
        
        try {
          const data = await CV.list();
          console.log("CVs fetched using CV.list():", data);
          const uiData = data.map(toUi);
          setCvs(uiData);
          return;
        } catch (moduleErr) {
          console.log("CV module failed:", moduleErr.message);
        }

        const endpoints = [
          "/cv-management/",
          "/api/cv-management/",
          "/cvs/",
          "/api/cvs/"
        ];

        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint);
            const data = res?.data?.data || res?.data || res || [];
            if (data.length > 0) {
              console.log(`CVs fetched from ${endpoint}:`, data);
              setCvs(data);
              return;
            }
          } catch (err) {
            console.log(`CV endpoint ${endpoint} failed:`, err.message);
          }
        }

        setCvs([]);
      } catch (error) {
        console.error("Error fetching CVs:", error);
        setCvs([]);
      } finally {
        setCvLoading(false);
      }
    };
    
    fetchCVs();
  }, []);

  const findCandidateCV = (interview) => {
    if (!interview || !cvs.length) return null;
    
    const candidateName = interview.candidate_name || interview.name || "";
    if (!candidateName.trim()) return null;

    const matchedCV = cvs.find(cv => {
      const cvName = cv.name || cv.candidate_name || "";
      return cvName.toLowerCase() === candidateName.toLowerCase();
    });

    return matchedCV;
  };

  const getCVUrl = (cv) => {
    if (!cv) return null;
    return cv.cvAttachmentUrl || cv.cv_attachment_url || cv.url || cv.file_url || cv.attachment;
  };

  const handleViewCV = (cv) => {
    if (!cv) {
      alert("No CV found for this candidate");
      return;
    }

    const cvUrl = getCVUrl(cv);
    
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    } else {
      alert("CV attachment URL not available");
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/interview-management/${id}/`);
      setInterviews((prev) => prev.filter((item) => item.id !== id));
      alert("Interview deleted successfully!");
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview!");
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!id) return;
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    setUpdatingIds((s) => new Set([...s, id]));

    try {
      await api.patch(`/interview-management/${id}/update-status/`, { status: newStatus });

      setInterviews((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, status: newStatus, interview_status: newStatus } : it
        )
      );

      alert(`Status updated to "${newStatus}"`);
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredInterviews = interviews.filter((i) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      i.candidate_name?.toLowerCase().includes(query) ||
      i.job_title?.toLowerCase().includes(query) ||
      i.interviewer_name?.toLowerCase().includes(query) ||
      i.place?.toLowerCase().includes(query) ||
      i.status?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInterviews = filteredInterviews.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => setCurrentPage(1), [searchQuery]);

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: "center" }}>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>
          Loading interview data...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Interview Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, job, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <button
            onClick={() => navigate("/interview-management/add")}
            style={styles.addButton}
          >
            + Add New
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>SL NO</th>
              <th style={styles.tableHeader}>CANDIDATE</th>
              <th style={styles.tableHeader}>JOB TITLE</th>
              <th style={styles.tableHeader}>CV</th>
              <th style={styles.tableHeader}>LOCATION</th>
              <th style={styles.tableHeader}>INTERVIEWER</th>
              <th style={styles.tableHeader}>STATUS</th>
              <th
                style={{
                  ...styles.tableHeader,
                  textAlign: "center",
                  width: "120px",
                }}
              >
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            {currentInterviews.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noResults}>
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "No interview records found"}
                </td>
              </tr>
            ) : (
              currentInterviews.map((interview, index) => {
                const id = interview.id;
                const statusValue = (interview.status || interview.interview_status || "pending").toLowerCase();
                const isUpdating = updatingIds.has(id);
                const cvData = findCandidateCV(interview);
                const hasCV = !!cvData;
                const cvUrl = getCVUrl(cvData);

                return (
                  <tr key={interview.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{startIndex + index + 1}</td>
                    <td style={styles.tableCell}>{interview.candidate_name || interview.name}</td>
                    <td style={styles.tableCell}>{interview.job_title || interview.job_title_name}</td>
                    
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleViewCV(cvData)}
                        style={{
                          ...styles.viewCvBtn,
                          opacity: hasCV && cvUrl ? 1 : 0.6,
                          cursor: hasCV && cvUrl ? "pointer" : "not-allowed",
                        }}
                        title={hasCV ? (cvUrl ? "View CV" : "CV has no file") : "No CV found"}
                        disabled={!hasCV || !cvUrl}
                      >
                        {hasCV ? (cvUrl ? "View CV" : "No File") : "No CV"}
                      </button>
                    </td>

                    <td style={styles.tableCell}>{interview.place || "N/A"}</td>
                    <td style={styles.tableCell}>
                      {interview.interviewer_name || "N/A"}
                    </td>

                    <td style={styles.tableCell}>
                      <select
                        value={statusValue}
                        onChange={(e) => updateStatus(id, e.target.value)}
                        disabled={isUpdating}
                        style={{
                          ...styles.statusDropdown,
                          ...getResultStyle(statusValue),
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    <td style={styles.actionCell}>
                      <div style={styles.iconActions}>
                        <button
                          title="Remarks"
                          onClick={() => navigate(`/interview-management/view/${interview.id}`)}
                          style={styles.iconBtn}
                        >
                          <MessageSquare size={16} />
                        </button>


                        {/* <button
                          title="Edit"
                          onClick={() => navigate(`/interview-management/edit/${interview.id}`)}
                          style={styles.iconBtn}
                        >
                          <Pencil size={16} />
                        </button> */}

                        <button
                          title="Delete"
                          onClick={() => handleDeleteClick(interview.id)}
                          style={{ ...styles.iconBtn, color: "#dc2626" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.paginationContainer}>
        <span style={styles.paginationInfo}>
          Showing {currentInterviews.length ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + itemsPerPage, filteredInterviews.length)} of{" "}
          {filteredInterviews.length} entries
        </span>
        <div style={styles.paginationButtons}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === 1 ? styles.paginationBtnDisabled : {}),
            }}
          >
            Prev
          </button>
          <div style={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    ...styles.pageNumberBtn,
                    ...(pageNum === currentPage
                      ? styles.pageNumberBtnActive
                      : {}),
                  }}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === totalPages
                ? styles.paginationBtnDisabled
                : {}),
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    padding: "12px 40px 12px 16px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    width: "320px",
    transition: "all 0.3s",
    fontWeight: "500",
    color: "#374151",
  },
  searchIcon: {
    position: "absolute",
    right: "14px",
    fontSize: "18px",
    pointerEvents: "none",
    color: "#9ca3af",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  addButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    backgroundColor: "#f3f4f6",
  },
  tableHeader: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    borderBottom: "2px solid #e5e7eb",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  tableCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
  },
  actionCell: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    textAlign: "center",
    width: "120px",
  },
  statusDropdown: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.2s",
    width: "100%",
    maxWidth: "120px",
  },
  viewCvBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    padding: "16px 24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  paginationInfo: {
    fontSize: "14px",
    color: "#6b7280",
  },
  paginationButtons: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  paginationBtn: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  paginationBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  pageNumberBtn: {
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "40px",
  },
  pageNumberBtnActive: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
  iconActions: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};