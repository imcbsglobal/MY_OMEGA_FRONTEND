import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EmployeeManagement.scss";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

function EmployeeManagement() {
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // Axios instance with auth
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle token expiry
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  // Fetch employees from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get("/users/", { params });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (error.response?.status !== 401) {
        alert("Failed to fetch employees. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Debounced search - fetch when searchTerm changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchEmployees();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAddEmployee = () => {
    navigate("/hr/add-employee");
  };

  const handleEdit = (employee) => {
    navigate("/hr/edit-employee", { state: { employee } });
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;

    setDeleting(true);
    try {
      await api.delete(`/users/${selectedEmployee.id}/`);
      
      // Remove from local state
      setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
      
      setShowDeleteModal(false);
      setSelectedEmployee(null);
      alert(`${selectedEmployee.name} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error.response?.data?.detail || "Failed to delete employee. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewAttachment = (url) => {
    setAttachmentUrl(url);
    setShowAttachmentModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  return (
    <div className="employee-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Employee Management</h1>
          <div className="header-actions">
            <input
              type="text"
              className="search-input-header"
              placeholder="Search employees by name, email, job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="add-btn-header" onClick={handleAddEmployee}>
              + Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>User Level</th>
                  <th>Job Title</th>
                  <th>Address</th>
                  <th>Personal Phone</th>
                  <th>Residential Phone</th>
                  <th>Place</th>
                  <th>District</th>
                  <th>Education</th>
                  <th>Experience</th>
                  <th>Organization</th>
                  <th>Duty Time</th>
                  <th>Joining Date</th>
                  <th>DOB</th>
                  <th>Bank Account</th>
                  <th>Bank Details</th>
                  <th>Aadhar</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="22" className="no-data">
                      {searchTerm ? "No employees found matching your search" : "No employees found. Click 'Add Employee' to create one."}
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td className="photo-cell">
                        {employee.photo_url ? (
                          <img 
                            src={employee.photo_url} 
                            alt={employee.name}
                            className="user-photo"
                            onClick={() => handleViewAttachment(employee.photo_url)}
                          />
                        ) : (
                          <div className="no-photo">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="name-cell">{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>
                        <span className={`badge badge-${employee.user_level?.toLowerCase().replace(' ', '-')}`}>
                          {employee.user_level || "User"}
                        </span>
                      </td>
                      <td>{employee.job_title || employee.job_role || "N/A"}</td>
                      <td className="address-cell">{employee.address || "N/A"}</td>
                      <td className="phone-cell">{employee.personal_phone || "N/A"}</td>
                      <td className="phone-cell">{employee.residential_phone || "N/A"}</td>
                      <td>{employee.place || "N/A"}</td>
                      <td>{employee.district || "N/A"}</td>
                      <td>{employee.education || "N/A"}</td>
                      <td>{employee.experience || "N/A"}</td>
                      <td>{employee.organization || "N/A"}</td>
                      <td className="phone-cell">
                        {employee.duty_time_start && employee.duty_time_end
                          ? `${formatTime(employee.duty_time_start)} - ${formatTime(employee.duty_time_end)}`
                          : "N/A"}
                      </td>
                      <td>{formatDate(employee.joining_date)}</td>
                      <td>{formatDate(employee.dob)}</td>
                      <td className="phone-cell">{employee.bank_account_number || "N/A"}</td>
                      <td className="remarks-cell">
                        {employee.bank_name ? (
                          <>
                            <div>{employee.bank_name}</div>
                            <small>{employee.ifsc_code} - {employee.branch}</small>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="cv-cell">
                        {employee.aadhar_attachment_url ? (
                          <button
                            className="view-cv-btn"
                            onClick={() => handleViewAttachment(employee.aadhar_attachment_url)}
                          >
                            View
                          </button>
                        ) : (
                          <span className="no-cv-text">No Attachment</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${employee.is_active ? 'badge-active' : 'badge-inactive'}`}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>{" "}
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteClick(employee)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="confirm-message">
                <p>Are you sure you want to delete <strong>{selectedEmployee?.name}</strong>?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-cancel" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Viewer Modal */}
      {showAttachmentModal && (
        <div className="modal-overlay" onClick={() => setShowAttachmentModal(false)}>
          <div className="modal cv-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{attachmentUrl.includes('photo') ? 'User Photo' : 'Aadhar Card'}</h2>
              <button className="close-btn" onClick={() => setShowAttachmentModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body cv-viewer-body">
              {attachmentUrl.endsWith('.pdf') ? (
                <iframe 
                  src={attachmentUrl} 
                  className="cv-iframe"
                  title="Document Viewer"
                />
              ) : (
                <img 
                  src={attachmentUrl} 
                  alt="Attachment" 
                  className="cv-iframe" 
                  style={{ objectFit: 'contain' }} 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;