import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LeaveManagement() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("all"); // "all" or "my"
  const itemsPerPage = 25;

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = () => {
    try {
      const storedData = localStorage.getItem('leave-management-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        setLeaves(data);
      } else {
        const initialData = [
          {
            id: 1,
            employeeName: "John Dior",
            employeeId: "EUH001",
            leaveType: "FIBLOW",
            startDate: "10-10-2025",
            endDate: "12-10-2025",
            reason: "Eee-twomen!",
            status: "APPROVED",
            approvedBy: "Admin User",
            readers: "Approved for test-summet",
            isMyLeave: false
          },
          {
            id: 2,
            employeeName: "Jane Smith",
            employeeId: "EUH002",
            leaveType: "LATE REQUEST (IN WHAT TO)",
            startDate: "18-10-2025",
            endDate: "18-10-2025",
            reason: "Transportation issues",
            status: "PENDING",
            approvedBy: "-",
            readers: "-",
            isMyLeave: true
          },
          {
            id: 3,
            employeeName: "Robert Johnson",
            employeeId: "EUH003",
            leaveType: "LEAVE REQUEST (INDUL 30 MINUTES)",
            startDate: "20-10-2025",
            endDate: "20-10-2025",
            reason: "Family Function",
            status: "APPROVED",
            approvedBy: "Admin User",
            readers: "Approved early departure",
            isMyLeave: false
          },
          {
            id: 4,
            employeeName: "Admin User",
            employeeId: "ADMIN001",
            leaveType: "FIBLOW",
            startDate: "15-10-2025",
            endDate: "16-10-2025",
            reason: "Personal",
            status: "APPROVED",
            approvedBy: "System",
            readers: "Admin leave auto-approved",
            isMyLeave: true
          },
          {
            id: 5,
            employeeName: "Admin User",
            employeeId: "ADMIN001",
            leaveType: "LATE REQUEST (IN WHAT TO)",
            startDate: "23-10-2025",
            endDate: "23-10-2025",
            reason: "Medical Appointment",
            status: "PENDING",
            approvedBy: "-",
            readers: "-",
            isMyLeave: true
          }
        ];
        localStorage.setItem('leave-management-data', JSON.stringify(initialData));
        setLeaves(initialData);
      }
    } catch (error) {
      console.error('Error loading leaves:', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLeaveClick = () => {
    navigate('/leave-management/add');
  };

  const handleStatusUpdate = (id, newStatus) => {
    try {
      const storedData = localStorage.getItem('leave-management-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const updatedLeaves = data.map(leave => 
          leave.id === id ? { 
            ...leave, 
            status: newStatus,
            approvedBy: newStatus === "APPROVED" ? "Admin User" : leave.approvedBy,
            readers: newStatus === "APPROVED" ? "Approved" : "Rejected"
          } : leave
        );
        localStorage.setItem('leave-management-data', JSON.stringify(updatedLeaves));
        setLeaves(updatedLeaves);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    // Filter by view type
    if (viewType === "my" && !leave.isMyLeave) {
      return false;
    }
    
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      leave.employeeName?.toLowerCase().includes(query) ||
      leave.employeeId?.toLowerCase().includes(query) ||
      leave.leaveType?.toLowerCase().includes(query) ||
      leave.reason?.toLowerCase().includes(query) ||
      leave.status?.toLowerCase().includes(query) ||
      leave.approvedBy?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeaves = filteredLeaves.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, viewType]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      APPROVED: { backgroundColor: "#d1fae5", color: "#065f46" },
      PENDING: { backgroundColor: "#fef3c7", color: "#92400e" },
      REJECTED: { backgroundColor: "#fee2e2", color: "#991b1b" },
    };
    return statusStyles[status] || { backgroundColor: "#f3f4f6", color: "#374151" };
  };

  const formatStatusText = (status) => {
    if (status === "APPROVED") return "APPROVE";
    if (status === "PENDING") return "PENDING";
    return status;
  };

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{fontSize: '18px', color: '#6b7280'}}>Loading leave data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Leave Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.viewTypeButtons}>
            <button 
              onClick={() => setViewType("all")} 
              style={{
                ...styles.viewTypeBtn,
                ...(viewType === "all" ? styles.viewTypeBtnActive : {})
              }}
            >
              All Leaves
            </button>
            <button 
              onClick={() => setViewType("my")} 
              style={{
                ...styles.viewTypeBtn,
                ...(viewType === "my" ? styles.viewTypeBtnActive : {})
              }}
            >
              My Leaves
            </button>
          </div>
          
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by employee name, ID, leave type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          
          <button onClick={handleRequestLeaveClick} style={styles.requestButton}>
            + Request Leave
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>NO</th>
              <th style={styles.tableHeader}>EMPLOYEE NAME</th>
              <th style={styles.tableHeader}>EMPLOYEE ID</th>
              <th style={styles.tableHeader}>LEAVE TYPE</th>
              <th style={styles.tableHeader}>START DATE</th>
              <th style={styles.tableHeader}>END DATE</th>
              <th style={styles.tableHeader}>REASON</th>
              <th style={styles.tableHeader}>STATUS</th>
              <th style={styles.tableHeader}>APPROVED BY</th>
              <th style={styles.tableHeader}>REMARKS</th>
              <th style={styles.tableHeader}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentLeaves.length === 0 ? (
              <tr>
                <td colSpan="11" style={styles.noResults}>
                  {searchQuery ? `No results found for "${searchQuery}"` : `No ${viewType === "my" ? "my" : ""} leave records available`}
                </td>
              </tr>
            ) : (
              currentLeaves.map((leave, index) => (
                <tr key={leave.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{startIndex + index + 1}</td>
                  <td style={styles.tableCell}>{leave.employeeName}</td>
                  <td style={styles.tableCell}>{leave.employeeId}</td>
                  <td style={styles.tableCell}>{leave.leaveType}</td>
                  <td style={styles.tableCell}>{leave.startDate}</td>
                  <td style={styles.tableCell}>{leave.endDate}</td>
                  <td style={styles.tableCell}>{leave.reason}</td>
                  <td style={styles.tableCell}>
                    <span style={{...styles.statusBadge, ...getStatusStyle(leave.status)}}>
                      {formatStatusText(leave.status)}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{leave.approvedBy}</td>
                  <td style={styles.tableCell}>{leave.readers}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      {leave.status === "PENDING" && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(leave.id, "APPROVED")} 
                            style={styles.approveBtn}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(leave.id, "REJECTED")} 
                            style={styles.rejectBtn}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(leave.status === "APPROVED" || leave.status === "REJECTED") && (
                        <span style={styles.completedText}>Completed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.paginationContainer}>
        <div style={styles.paginationInfo}>
          Showing {filteredLeaves.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredLeaves.length)} of {filteredLeaves.length} entries
          {searchQuery && <span style={styles.searchIndicator}> (filtered from {leaves.length} total)</span>}
        </div>
        <div style={styles.paginationButtons}>
          <button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
            style={{...styles.paginationBtn, ...(currentPage === 1 ? styles.paginationBtnDisabled : {})}}
          >
            Previous
          </button>
          
          <div style={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
                    style={{
                      ...styles.pageNumberBtn,
                      ...(pageNum === currentPage ? styles.pageNumberBtnActive : {})
                    }}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} style={styles.pageEllipsis}>...</span>;
              }
              return null;
            })}
          </div>

          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            style={{...styles.paginationBtn, ...(currentPage === totalPages ? styles.paginationBtnDisabled : {})}}
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
    flexWrap: "wrap",
  },
  viewTypeButtons: {
    display: "flex",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "4px",
  },
  viewTypeBtn: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  viewTypeBtnActive: {
    backgroundColor: "white",
    color: "#3b82f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
  searchIndicator: {
    color: "#6b7280",
    fontStyle: "italic",
    fontSize: "13px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  requestButton: {
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
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  actionButtons: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  approveBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#059669",
    backgroundColor: "#d1fae5",
    border: "1px solid #a7f3d0",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  rejectBtn: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  completedText: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
    fontStyle: "italic",
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
  pageEllipsis: {
    padding: "8px 4px",
    color: "#9ca3af",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "500",
  },
};