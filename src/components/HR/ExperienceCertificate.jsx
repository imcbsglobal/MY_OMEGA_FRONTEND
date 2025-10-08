import React, { useState } from "react";
import "./ExperienceCertificate.scss";

function ExperienceCertificate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newCertificate, setNewCertificate] = useState({
    employeeName: "",
    startDate: "",
    endDate: ""
  });
  
  const [employees, setEmployees] = useState([
    {
      id: 1,
      slNo: 1,
      name: "LINAT KJ",
      address: "Puthukkattil (h), Chennalode PH : 7907802917",
      phoneNumber: "8606673163",
      place: "CHENNALODE",
      district: "WAYANAD",
      education: "MCOM",
      experience: "8 months in Teaching",
      jobTitle: "TECHNICAL SPECIALIST",
      joiningDate: "04-09-2023",
      endDate: "06-10-2025",
      dob: "24-09-1992",
      status: "Approved",
      addedBy: "merinvayalil@gmail.com",
      approvedBy: "info@imcbsglobal.com",
      approveDate: "06-10-2025"
    },
    {
      id: 2,
      slNo: 2,
      name: "SONA DSILVA",
      address: "Chettivalappil(h),Manivayal, kalpetta PH : 9562635525",
      phoneNumber: "7025034326",
      place: "KALPETTA",
      district: "WAYANAD",
      education: "BSC COMPUTER SCIENCE",
      experience: "FRESHER",
      jobTitle: "FULL STACK DEVELOPER",
      joiningDate: "03-12-2024",
      endDate: "16-07-2025",
      dob: "18-10-2000",
      status: "Approved",
      addedBy: "merinvayalil@gmail.com",
      approvedBy: "info@imcbsglobal.com",
      approveDate: "21-07-2025"
    }
  ]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = (id) => {
    console.log(`Generate certificate for employee ${id}`);
    alert(`Generating certificate for employee ID: ${id}`);
  };

  const handleEdit = (id) => {
    const employee = employees.find(emp => emp.id === id);
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this employee?")) {
      setEmployees(employees.filter(emp => emp.id !== id));
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
      startDate: "",
      endDate: ""
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
    console.log("New certificate data:", newCertificate);
    alert("Experience Certificate added successfully!");
    handleCloseModal();
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? editingEmployee : emp
      ));
      console.log("Updated employee:", editingEmployee);
      alert("Experience Certificate updated successfully!");
      handleCloseModal();
    }
  };

  return (
    <div className="experience-certificate-container">
      <div className="header-section">
        <h2 className="page-title">Experience Certificate</h2>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search by name (all pages)"
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
        <table className="experience-table">
          <thead>
            <tr>
              <th>SI NO</th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone Number</th>
              <th>Place</th>
              <th>District</th>
              <th>Education</th>
              <th>Experience</th>
              <th>Job Title</th>
              <th>Joining Date</th>
              <th>End Date</th>
              <th>DOB</th>
              <th>Status</th>
              <th>Certificate</th>
              <th>Approve</th>
              <th>Added By</th>
              <th>Approved By</th>
              <th>Edit</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.slNo}</td>
                <td>{employee.name}</td>
                <td>{employee.address}</td>
                <td>{employee.phoneNumber}</td>
                <td>{employee.place}</td>
                <td>{employee.district}</td>
                <td>{employee.education}</td>
                <td>{employee.experience}</td>
                <td>{employee.jobTitle}</td>
                <td>{employee.joiningDate}</td>
                <td>{employee.endDate}</td>
                <td>{employee.dob}</td>
                <td>
                  <span className="status-badge approved">
                    {employee.status}
                  </span>
                </td>
                <td>
                  <button
                    className="generate-btn"
                    onClick={() => handleGenerate(employee.id)}
                  >
                    Generate
                  </button>
                </td>
                <td>
                  <div className="approve-info">
                    <span className="approve-badge">✓ Approved</span>
                    <span className="approve-date">{employee.approveDate}</span>
                  </div>
                </td>
                <td>{employee.addedBy}</td>
                <td>{employee.approvedBy}</td>
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
                    className="remove-btn"
                    onClick={() => handleRemove(employee.id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Experience Certificate Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-certificate-modal">
            <div className="modal-header">
              <h3>Add Experience Certificate</h3>
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
                  <option value="LINAT KJ">LINAT KJ</option>
                  <option value="SONA DSILVA">SONA DSILVA</option>
                  <option value="ADILA HESIRIN">ADILA HESIRIN</option>
                  <option value="AJAY MATHEW">AJAY MATHEW</option>
                  <option value="AJIN K AOUSTIAN">AJIN K AOUSTIAN</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="text"
                  id="startDate"
                  name="startDate"
                  placeholder="dd-mm-yyyy"
                  value={newCertificate.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="text"
                  id="endDate"
                  name="endDate"
                  placeholder="dd-mm-yyyy"
                  value={newCertificate.endDate}
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

      {/* Edit Experience Certificate Modal */}
      {showEditModal && editingEmployee && (
        <div className="modal-overlay">
          <div className="add-certificate-modal">
            <div className="modal-header">
              <h3>Edit Experience Certificate</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group">
                <label htmlFor="editStartDate">Start Date:</label>
                <input
                  type="text"
                  id="editStartDate"
                  name="joiningDate"
                  value={editingEmployee.joiningDate}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="editEndDate">End Date:</label>
                <input
                  type="text"
                  id="editEndDate"
                  name="endDate"
                  value={editingEmployee.endDate}
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

export default ExperienceCertificate;