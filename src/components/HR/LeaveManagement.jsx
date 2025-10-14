import React, { useState, useEffect } from "react";
import "./LeaveManagement.scss";

function LeaveManagement() {
  const [showAddLeaveForm, setShowAddLeaveForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("all");
  const itemsPerPage = 10;
  
  const [leaveList, setLeaveList] = useState([]);
  const [newLeave, setNewLeave] = useState({
    employeeName: "",
    employeeId: "",
    leaveType: "Full Day",
    startDate: "",
    endDate: "",
    reason: "Bereavement",
    note: "",
    status: "Pending",
    appliedBy: "admin",
    lateMinutes: "",
    earlyMinutes: ""
  });

  const currentAdmin = {
    name: "Admin User",
    id: "ADMIN001",
    role: "admin"
  };

  const reasonOptions = [
    "Bereavement",
    "Family Function",
    "Transportation Issues",
    "Dependent Care",
    "Documentation",
    "Medical Appointment",
    "Health Emergency",
    "Personal",
    "Vacation",
    "Sick Leave"
  ];

  // Time options for late/early requests
  const timeOptions = [
    "15 minutes", "30 minutes", "45 minutes", "1 hour", 
    "1 hour 15 minutes", "1 hour 30 minutes", "1 hour 45 minutes", 
    "2 hours", "2 hours 15 minutes", "2 hours 30 minutes", 
    "2 hours 45 minutes", "3 hours", "3+ hours"
  ];

  useEffect(() => {
    setLeaveList([
      {
        id: 1, no: 1, employeeName: "John Doe", employeeId: "EMP001",
        leaveType: "Full Day", startDate: "10-10-2025", endDate: "12-10-2025",
        reason: "Bereavement", status: "Approved", 
        approvedBy: "Admin User", remarks: "Approved for bereavement",
        appliedBy: "employee"
      },
      {
        id: 2, no: 2, employeeName: "Jane Smith", employeeId: "EMP002",
        leaveType: "Late Request", startDate: "18-10-2025", endDate: "18-10-2025",
        reason: "Transportation Issues", status: "Pending", 
        approvedBy: "", remarks: "",
        appliedBy: "employee",
        lateMinutes: "45 minutes"
      },
      {
        id: 3, no: 3, employeeName: "Robert Johnson", employeeId: "EMP003",
        leaveType: "Early Request", startDate: "20-10-2025", endDate: "20-10-2025",
        reason: "Family Function", status: "Approved", 
        approvedBy: "Admin User", remarks: "Approved early departure",
        appliedBy: "employee",
        earlyMinutes: "1 hour 30 minutes"
      },
      {
        id: 4, no: 4, employeeName: "Admin User", employeeId: "ADMIN001",
        leaveType: "Full Day", startDate: "15-10-2025", endDate: "16-10-2025",
        reason: "Personal", status: "Approved", 
        approvedBy: "System", remarks: "Admin leave auto-approved",
        appliedBy: "admin"
      },
      {
        id: 5, no: 5, employeeName: "Admin User", employeeId: "ADMIN001",
        leaveType: "Late Request", startDate: "25-10-2025", endDate: "25-10-2025",
        reason: "Medical Appointment", status: "Pending", 
        approvedBy: "", remarks: "",
        appliedBy: "admin",
        lateMinutes: "30 minutes"
      }
    ]);
  }, []);

  const filteredLeaves = leaveList.filter(leave => {
    if (viewMode === "my") {
      return leave.employeeId === currentAdmin.id;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeaves = filteredLeaves.slice(startIndex, endIndex);

  const handleAddLeave = () => setShowAddLeaveForm(true);

  const handleCloseAddForm = () => {
    setShowAddLeaveForm(false);
    setNewLeave({
      employeeName: currentAdmin.name,
      employeeId: currentAdmin.id,
      leaveType: "Full Day",
      startDate: "",
      endDate: "",
      reason: "Bereavement",
      note: "",
      status: "Pending",
      appliedBy: "admin",
      lateMinutes: "",
      earlyMinutes: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeave(prev => ({ ...prev, [name]: value }));
    
    // Clear time fields when leave type changes
    if (name === "leaveType") {
      setNewLeave(prev => ({ 
        ...prev, 
        lateMinutes: "",
        earlyMinutes: ""
      }));
    }
  };

  const handleSubmitLeave = () => {
    if (!newLeave.startDate || !newLeave.reason.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Validate time selection for late/early requests
    if ((newLeave.leaveType === "Late Request" && !newLeave.lateMinutes) ||
        (newLeave.leaveType === "Early Request" && !newLeave.earlyMinutes)) {
      alert("Please select the time duration for your request");
      return;
    }
    
    const newLeaveObj = {
      id: leaveList.length + 1, 
      no: leaveList.length + 1,
      ...newLeave,
      appliedDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      }).replace(/\//g, '-'),
      approvedBy: newLeave.appliedBy === "admin" ? "System" : "",
      status: newLeave.appliedBy === "admin" ? "Approved" : "Pending",
      remarks: newLeave.note
    };
    
    setLeaveList(prev => [newLeaveObj, ...prev].map((leave, idx) => ({ ...leave, no: idx + 1 })));
    handleCloseAddForm();
  };

  const handleFirstPage = () => setCurrentPage(1);
  const handlePreviousPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handleLastPage = () => setCurrentPage(totalPages);

  const handleApproveLeave = (leave) => {
    const updatedLeave = { 
      ...leave, 
      status: "Approved", 
      approvedBy: currentAdmin.name,
      remarks: leave.remarks || "Approved by admin"
    };
    setLeaveList(prev => prev.map(l => l.id === leave.id ? updatedLeave : l));
  };

  const handleRejectLeave = (leave) => {
    const reason = prompt("Please enter reason for rejection:");
    if (reason) {
      const updatedLeave = { 
        ...leave, 
        status: "Rejected", 
        approvedBy: currentAdmin.name,
        remarks: reason
      };
      setLeaveList(prev => prev.map(l => l.id === leave.id ? updatedLeave : l));
    }
  };

  const canTakeAction = (leave) => {
    return leave.employeeId !== currentAdmin.id && leave.status === "Pending";
  };

  const isOwnLeave = (leave) => {
    return leave.employeeId === currentAdmin.id;
  };

  // Helper function to display leave type with time
  const getDisplayLeaveType = (leave) => {
    if (leave.leaveType === "Late Request" && leave.lateMinutes) {
      return `Late Request (${leave.lateMinutes})`;
    }
    if (leave.leaveType === "Early Request" && leave.earlyMinutes) {
      return `Early Request (${leave.earlyMinutes})`;
    }
    return leave.leaveType;
  };

  return (
    <div className="leave-management">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Leave Management</h1>
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === "all" ? "active" : ""}`}
                onClick={() => setViewMode("all")}
              >
                All Leaves
              </button>
              <button 
                className={`toggle-btn ${viewMode === "my" ? "active" : ""}`}
                onClick={() => setViewMode("my")}
              >
                My Leaves
              </button>
            </div>
            <button className="add-btn-header" onClick={handleAddLeave}>+ Request Leave</button>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>EMPLOYEE NAME</th>
                <th>EMPLOYEE ID</th>
                <th>LEAVE TYPE</th>
                <th>START DATE</th>
                <th>END DATE</th>
                <th>REASON</th>
                <th>STATUS</th>
                <th>APPROVED BY</th>
                <th>REMARKS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {currentLeaves.length > 0 ? (
                currentLeaves.map((leave) => (
                  <tr key={leave.id} className={isOwnLeave(leave) ? "own-leave" : ""}>
                    <td>{leave.no}</td>
                    <td className="name-cell">
                      {leave.employeeName}
                      {isOwnLeave(leave) && <span className="badge-you">You</span>}
                    </td>
                    <td>{leave.employeeId}</td>
                    <td>
                      <span className={`type-pill ${leave.leaveType.toLowerCase().replace(' ', '-')}`}>
                        {getDisplayLeaveType(leave)}
                      </span>
                    </td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td className="reason-cell">{leave.reason}</td>
                    <td className="status-cell">
                      <span className={`status-pill ${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>{leave.approvedBy || "-"}</td>
                    <td className="remarks-cell">{leave.remarks || "-"}</td>
                    <td className="actions-cell">
                      {canTakeAction(leave) ? (
                        <div className="action-buttons">
                          <button 
                            className="approve-btn" 
                            onClick={() => handleApproveLeave(leave)}
                          >
                            Approve
                          </button>
                          <button 
                            className="reject-btn" 
                            onClick={() => handleRejectLeave(leave)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : isOwnLeave(leave) ? (
                        <span className="action-completed">Your Leave</span>
                      ) : (
                        <span className="action-completed">Action Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="no-data">
                    {viewMode === "my" ? "No leave requests found for you" : "No leave requests found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredLeaves.length > 0 && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              onClick={handleFirstPage}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button 
              className="pagination-btn" 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="pagination-btn" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button 
              className="pagination-btn" 
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        )}
      </div>

      {showAddLeaveForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Request New Leave</h2>
              <button className="close-btn" onClick={handleCloseAddForm}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-container">
                <div className="admin-notice">
                  <div className="notice-icon">👤</div>
                  <div className="notice-text">
                    <strong>Requesting as Admin</strong>
                    <p>Your leave will be auto-approved by the system.</p>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Employee Name</label>
                    <input 
                      type="text" 
                      name="employeeName" 
                      value={currentAdmin.name}
                      className="form-input" 
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input 
                      type="text" 
                      name="employeeId" 
                      value={currentAdmin.id}
                      className="form-input" 
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Leave Type</label>
                    <select 
                      name="leaveType" 
                      value={newLeave.leaveType} 
                      onChange={handleInputChange} 
                      className="form-input"
                    >
                      <option value="Full Day">Full Day</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Late Request">Late Request</option>
                      <option value="Early Request">Early Request</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={newLeave.startDate} 
                      onChange={handleInputChange} 
                      className="form-input" 
                    />
                  </div>
                </div>

                {/* Time Selection for Late Request */}
                {newLeave.leaveType === "Late Request" && (
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label className="form-label required">How late will you be?</label>
                      <select 
                        name="lateMinutes" 
                        value={newLeave.lateMinutes} 
                        onChange={handleInputChange} 
                        className="form-input"
                      >
                        <option value="">Select time duration</option>
                        {timeOptions.map((time, index) => (
                          <option key={index} value={time}>{time}</option>
                        ))}
                      </select>
                      <div className="form-hint">Select how many minutes you will be late</div>
                    </div>
                  </div>
                )}

                {/* Time Selection for Early Request */}
                {newLeave.leaveType === "Early Request" && (
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label className="form-label required">How early will you leave?</label>
                      <select 
                        name="earlyMinutes" 
                        value={newLeave.earlyMinutes} 
                        onChange={handleInputChange} 
                        className="form-input"
                      >
                        <option value="">Select time duration</option>
                        {timeOptions.map((time, index) => (
                          <option key={index} value={time}>{time}</option>
                        ))}
                      </select>
                      <div className="form-hint">Select how many minutes early you need to leave</div>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={newLeave.endDate} 
                      onChange={handleInputChange} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <input 
                      type="text" 
                      value="Auto-Approved (Admin)"
                      className="form-input" 
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label className="form-label required">Reason</label>
                    <select 
                      name="reason" 
                      value={newLeave.reason} 
                      onChange={handleInputChange} 
                      className="form-input"
                    >
                      {reasonOptions.map((reason, index) => (
                        <option key={index} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label className="form-label">Note *</label>
                    <textarea 
                      name="note" 
                      value={newLeave.note} 
                      onChange={handleInputChange} 
                      className="form-input textarea" 
                      placeholder="Add any details"
                      rows="3"
                    />
                    <div className="form-hint">Add any additional details</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={handleCloseAddForm}>Close</button>
              <button className="btn btn-success" onClick={handleSubmitLeave}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagement;