import React, { useState } from "react";
import "./SalaryCertificate.scss";

function SalaryCertificate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newCertificate, setNewCertificate] = useState({
    employeeName: "",
    employeeAddress: "",
    joiningDate: "",
    jobTitle: "",
    employeeSalary: ""
  });
  
  const [employees, setEmployees] = useState([
    {
      id: 1,
      slNo: 1,
      name: "AMAL",
      address: "Rajayalan (N. Sultanu Bahray Ph.) 5744237873",
      joiningDate: "May 7, 2025",
      jobTitle: "GRAPHIC DESIGNER",
      salary: "10000.00",
      addedBy: "info@IMC.com",
      addedOn: "22-Aug-2025",
      approvedBy: "info@IMC.com",
      status: "Approved"
    },
    {
      id: 2,
      slNo: 2,
      name: "SOHA DENIA",
      address: "Ovetirshaya(N)Mehrayal, Majesh Ph. 5450515553",
      joiningDate: "Dec 3, 2024",
      jobTitle: "FULL STACK DEVELOPER",
      salary: "10000.00",
      addedBy: "mehrayan@gmail.com",
      addedOn: "14-Jun-2025",
      approvedBy: "info@imc.com",
      status: "Approved"
    }
  ]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (id) => {
    console.log(`View certificate for employee ${id}`);
    alert(`Viewing certificate for employee ID: ${id}`);
  };

  const handleEdit = (id) => {
    const employee = employees.find(emp => emp.id === id);
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this salary certificate?")) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleApprove = (id) => {
    if (window.confirm("Are you sure you want to approve this salary certificate?")) {
      setEmployees(employees.map(emp => 
        emp.id === id ? { ...emp, status: "Approved", approvedBy: "admin@company.com" } : emp
      ));
      alert(`Salary certificate approved for employee ID: ${id}`);
    }
  };

  const handleAddNew = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingEmployee(null);
    setNewCertificate({
      employeeName: "",
      employeeAddress: "",
      joiningDate: "",
      jobTitle: "",
      employeeSalary: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEmployee = {
      id: employees.length + 1,
      slNo: employees.length + 1,
      name: newCertificate.employeeName,
      address: newCertificate.employeeAddress,
      joiningDate: newCertificate.joiningDate,
      jobTitle: newCertificate.jobTitle,
      salary: newCertificate.employeeSalary,
      addedBy: "admin@company.com",
      addedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      approvedBy: "",
      status: "Pending"
    };
    
    setEmployees([...employees, newEmployee]);
    console.log("New certificate data:", newCertificate);
    alert("Salary Certificate added successfully!");
    handleCloseModal();
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? editingEmployee : emp
      ));
      console.log("Updated employee:", editingEmployee);
      alert("Salary Certificate updated successfully!");
      handleCloseModal();
    }
  };

  return (
    <div className="salary-certificate-container">
      <div className="header-section">
        <h2 className="page-title">Salary Certificate</h2>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search by Employee Name..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="add-new-btn" onClick={handleAddNew}>
            Add New
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="salary-table">
          <thead>
            <tr>
              <th>SI NO</th>
              <th>Employee Name</th>
              <th>Employee Address</th>
              <th>Joining Date</th>
              <th>Job Title</th>
              <th>Employee Salary</th>
              <th>Added By</th>
              <th>Added On</th>
              <th>Approved By</th>
              <th>Certificate</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Approve</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.slNo}</td>
                <td>{employee.name}</td>
                <td>{employee.address}</td>
                <td>{employee.joiningDate}</td>
                <td>{employee.jobTitle}</td>
                <td>{employee.salary}</td>
                <td>{employee.addedBy}</td>
                <td>{employee.addedOn}</td>
                <td>{employee.approvedBy}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => handleView(employee.id)}
                  >
                    View
                  </button>
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(employee.id)}
                  >
                    ✎
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(employee.id)}
                  >
                    🗑
                  </button>
                </td>
                <td>
                  {employee.status === "Approved" ? (
                    <div className="approve-info">
                      <span className="approve-badge">Approved</span>
                    </div>
                  ) : (
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(employee.id)}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Salary Certificate Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-certificate-modal">
            <div className="modal-header">
              <h3>Add Salary Certificate</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="employeeName">Employee Name:</label>
                <select
                  id="employeeName"
                  name="employeeName"
                  value={newCertificate.employeeName}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Employee</option>
                  <option value="SNAMAND X">SNAMAND X</option>
                  <option value="SOHA DENIA">SOHA DENIA</option>
                  <option value="LINAT KJ">LINAT KJ</option>
                  <option value="SONA DSILVA">SONA DSILVA</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="employeeAddress">Employee Address:</label>
                <input
                  type="text"
                  id="employeeAddress"
                  name="employeeAddress"
                  placeholder="Enter employee address"
                  value={newCertificate.employeeAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="joiningDate">Joining Date:</label>
                <input
                  type="text"
                  id="joiningDate"
                  name="joiningDate"
                  placeholder="dd-mm-yyyy"
                  value={newCertificate.joiningDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="jobTitle">Job Title:</label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Enter job title"
                  value={newCertificate.jobTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="employeeSalary">Employee Salary:</label>
                <input
                  type="text"
                  id="employeeSalary"
                  name="employeeSalary"
                  placeholder="Enter salary"
                  value={newCertificate.employeeSalary}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Salary Certificate Modal */}
      {showEditModal && editingEmployee && (
        <div className="modal-overlay">
          <div className="add-certificate-modal">
            <div className="modal-header">
              <h3>Edit Salary Certificate</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group">
                <label htmlFor="editEmployeeName">Employee Name:</label>
                <input
                  type="text"
                  id="editEmployeeName"
                  name="name"
                  value={editingEmployee.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editEmployeeAddress">Employee Address:</label>
                <input
                  type="text"
                  id="editEmployeeAddress"
                  name="address"
                  value={editingEmployee.address}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editJoiningDate">Joining Date:</label>
                <input
                  type="text"
                  id="editJoiningDate"
                  name="joiningDate"
                  value={editingEmployee.joiningDate}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editJobTitle">Job Title:</label>
                <input
                  type="text"
                  id="editJobTitle"
                  name="jobTitle"
                  value={editingEmployee.jobTitle}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editSalary">Employee Salary:</label>
                <input
                  type="text"
                  id="editSalary"
                  name="salary"
                  value={editingEmployee.salary}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryCertificate;