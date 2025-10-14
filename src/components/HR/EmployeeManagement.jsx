import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeManagement.scss";

function EmployeeManagement() {
  const navigate = useNavigate();
  
  // Sample employee data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      address: "123 Main St, Cityville",
      personalPhone: "+1 234-567-8901",
      residentialPhone: "+1 234-567-8902",
      place: "Cityville",
      district: "Central District",
      education: "Bachelor's Degree",
      experience: "5 years",
      jobTitle: "Senior Developer",
      dutyTimeStart: "9:00 AM",
      dutyTimeEnd: "5:00 PM",
      organization: "Tech Corp",
      joiningDate: "2020-01-15",
      dob: "1990-05-20",
      bankAccountNumber: "1234567890",
      ifscCode: "BANK0001234",
      bankName: "Global Bank",
      branch: "Main Branch",
      aadharAttachment: "https://via.placeholder.com/400x250?text=Aadhar+Card"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      address: "456 Oak Ave, Townsburg",
      personalPhone: "+1 234-567-8903",
      residentialPhone: "+1 234-567-8904",
      place: "Townsburg",
      district: "West District",
      education: "Master's Degree",
      experience: "8 years",
      jobTitle: "Project Manager",
      dutyTimeStart: "8:30 AM",
      dutyTimeEnd: "4:30 PM",
      organization: "Business Inc",
      joiningDate: "2018-06-10",
      dob: "1988-11-15",
      bankAccountNumber: "9876543210",
      ifscCode: "BANK0005678",
      bankName: "National Bank",
      branch: "Downtown Branch",
      aadharAttachment: "https://via.placeholder.com/400x250?text=Aadhar+Card"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleDeleteConfirm = () => {
    setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  const handleViewAttachment = (url) => {
    setAttachmentUrl(url);
    setShowAttachmentModal(true);
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
              placeholder="Search employees..."
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
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Personal Phone</th>
                <th>Residential Phone</th>
                <th>Place</th>
                <th>District</th>
                <th>Education</th>
                <th>Experience</th>
                <th>Job Title</th>
                <th>Duty Time</th>
                <th>Organization</th>
                <th>Joining Date</th>
                <th>DOB</th>
                <th>Bank Account</th>
                <th>Bank Details</th>
                <th>Aadhar</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="19" className="no-data">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td className="name-cell">{employee.name}</td>
                    <td>{employee.email}</td>
                    <td className="address-cell">{employee.address}</td>
                    <td className="phone-cell">{employee.personalPhone}</td>
                    <td className="phone-cell">{employee.residentialPhone}</td>
                    <td>{employee.place}</td>
                    <td>{employee.district}</td>
                    <td>{employee.education}</td>
                    <td>{employee.experience}</td>
                    <td>{employee.jobTitle}</td>
                    <td className="phone-cell">
                      {employee.dutyTimeStart} - {employee.dutyTimeEnd}
                    </td>
                    <td>{employee.organization}</td>
                    <td>{employee.joiningDate}</td>
                    <td>{employee.dob}</td>
                    <td className="phone-cell">{employee.bankAccountNumber}</td>
                    <td className="remarks-cell">
                      <div>{employee.bankName}</div>
                      <small>{employee.ifscCode} - {employee.branch}</small>
                    </td>
                    <td className="cv-cell">
                      {employee.aadharAttachment ? (
                        <button
                          className="view-cv-btn"
                          onClick={() => handleViewAttachment(employee.aadharAttachment)}
                        >
                          View
                        </button>
                      ) : (
                        <span className="no-cv-text">No Attachment</span>
                      )}
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="confirm-message">
                <p>Are you sure you want to delete {selectedEmployee?.name}?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete
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
              <h2>Aadhar Card</h2>
              <button className="close-btn" onClick={() => setShowAttachmentModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body cv-viewer-body">
              <img src={attachmentUrl} alt="Aadhar Card" className="cv-iframe" style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;