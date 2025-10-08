// --------------------------------------------------
//  EmployeeManagement.jsx  –  PROFESSIONAL REDESIGN
// --------------------------------------------------
import React, { useState, useEffect } from "react";
import "./EmployeeManagement.scss";

function EmployeeManagement() {
  /* --------------  state  -------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const blankEmployee = () => ({
    id: "",
    name: "",
    email: "",
    address: "",
    personalPhone: "",
    residentialPhone: "",
    place: "",
    district: "",
    education: "",
    experience: "",
    jobTitle: "",
    dutyTimeStart: "",
    dutyTimeEnd: "",
    organization: "",
    joiningDate: "",
    dob: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: ""
  });

  const [formData, setFormData] = useState(blankEmployee());

  /* --------------  dummy data  -------------- */
  useEffect(() => {
    setEmployees([
      { id: 1, name: "ADILA NESIRIN", email: "adilanesirin27@gmail.com", address: "PULIKKAL HOUSE, CHUNDEL, ANAPPARA", personalPhone: "8606088186", residentialPhone: "9207220095", place: "CHUNDEL", district: "Wayanad", education: "Bachelor's Degree", experience: "2 years", jobTitle: "SOFTWARE TRAINEE", dutyTimeStart: "9:30 a.m.", dutyTimeEnd: "5:30 p.m.", organization: "IMC", joiningDate: "2025-05-12", dob: "2005-03-27", bankAccountNumber: "0746120000055", ifscCode: "SBIN0074612", bankName: "State Bank of India", branch: "Kalpetta" },
      { id: 2, name: "AJAY MATHEW", email: "ajay.00mathew@gmail.com", address: "Kunnathukuzhiyil (H), Udayagiri, Chettapalam", personalPhone: "8115998419", residentialPhone: "9447359419", place: "Pulpalli", district: "Wayanad", education: "Bachelor's Degree", experience: "3 years", jobTitle: "Web Developer -Trainee", dutyTimeStart: "9:30 a.m.", dutyTimeEnd: "5:30 p.m.", organization: "IMC", joiningDate: "2025-08-12", dob: "2002-03-01", bankAccountNumber: "0260053000027497", ifscCode: "SBIN0260053", bankName: "State Bank of India", branch: "Pulpalli" },
      { id: 3, name: "AJIN K AGUSTIAN", email: "ajinagustin62@gmail.com", address: "Kurhipadam (H), Chendora, Kottathara, Velamunda", personalPhone: "9744981875", residentialPhone: "9686576382", place: "Velamunda", district: "Wayanad", education: "Diploma", experience: "1 year", jobTitle: "COMPUTER HARDWARE TECHNICIAN", dutyTimeStart: "9 a.m.", dutyTimeEnd: "8 a.m.", organization: "SYSMAC", joiningDate: "2025-07-07", dob: "2002-04-17", bankAccountNumber: "40411101009637", ifscCode: "SBIN0040411", bankName: "State Bank of India", branch: "Velamunda" }
    ]);
  }, []);

  /* --------------  paging  -------------- */
  const itemsPerPage = 10;
  const filtered = employees.filter(e =>
    ["id", "name", "email", "place", "district"].some(k =>
      String(e[k]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const totalPages  = Math.ceil(filtered.length / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const currentList = filtered.slice(startIndex, startIndex + itemsPerPage);

  /* --------------  handlers  -------------- */
  const handleChange = ({ target: { name, value } }) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const openAdd  = () => { setFormData({ ...blankEmployee(), id: Date.now() }); setShowAddForm(true); };
  const closeAdd = () => setShowAddForm(false);

  const openEdit = (emp) => { setFormData(emp); setEmployeeToEdit(emp); setShowEditForm(true); };
  const closeEdit = () => setShowEditForm(false);

  const submitAdd = () => {
    if (!formData.name.trim() || !formData.email.trim()) return alert("Name and email are required");
    setEmployees((p) => [formData, ...p]);
    closeAdd();
  };

  const submitEdit = () => {
    setEmployees((p) => p.map((x) => (x.id === employeeToEdit.id ? formData : x)));
    closeEdit();
  };

  const openDelete = (emp) => { setEmployeeToDelete(emp); setShowDeleteConfirm(true); };
  const confirmDelete = () => {
    setEmployees((p) => p.filter((x) => x.id !== employeeToDelete.id));
    setShowDeleteConfirm(false);
  };
  const cancelDelete = () => setShowDeleteConfirm(false);

  /* --------------  render  -------------- */
  return (
    <div className="employee-management">
      {/* ----  header  ---- */}
      <div className="page-header">
        <div className="page-header__content">
          <div className="header-top">
            <h1 className="page-title">Employee Management</h1>
            <div className="header-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by ID, name, email, place or district"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="add-btn" onClick={openAdd}>+ Add New Employee</button>
            </div>
          </div>
        </div>
      </div>

      {/* ----  table  ---- */}
      <div className="content-area">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PHOTO</th>
                <th>EMAIL</th>
                <th>ADDRESS</th>
                <th>PERSONAL PHONE</th>
                <th>RESIDENTIAL PHONE</th>
                <th>PLACE</th>
                <th>DISTRICT</th>
                <th>EDUCATION</th>
                <th>EXPERIENCE</th>
                <th>JOB TITLE</th>
                <th>DUTY TIME</th>
                <th>ORGANIZATION</th>
                <th>JOINING DATE</th>
                <th>DOB</th>
                <th>BANK ACCOUNT</th>
                <th>BANK DETAILS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentList.length ? (
                currentList.map((emp, idx) => (
                  <tr key={emp.id} className={idx % 2 ? "odd-row" : "even-row"}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td className="photo-cell"><div className="photo-placeholder">IMG</div></td>
                    <td className="email-cell">{emp.email}</td>
                    <td className="address-cell">{emp.address}</td>
                    <td className="phone-cell">{emp.personalPhone}</td>
                    <td className="phone-cell">{emp.residentialPhone}</td>
                    <td className="place-cell">{emp.place}</td>
                    <td className="district-cell">{emp.district}</td>
                    <td className="education-cell">{emp.education}</td>
                    <td className="experience-cell">{emp.experience}</td>
                    <td className="jobTitle-cell">{emp.jobTitle}</td>
                    <td className="dutyTime-cell">{emp.dutyTimeStart} - {emp.dutyTimeEnd}</td>
                    <td className="organization-cell">{emp.organization}</td>
                    <td className="joiningDate-cell">{emp.joiningDate}</td>
                    <td className="dob-cell">{emp.dob}</td>
                    <td className="bankAccount-cell">{emp.bankAccountNumber}</td>
                    <td className="bankDetails-cell">{emp.bankName} ({emp.branch})<br /><small>IFSC: {emp.ifscCode}</small></td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => openEdit(emp)}>Edit</button>
                        <button className="delete-btn" onClick={() => openDelete(emp)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="19" className="no-data">No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----  ADD / EDIT MODAL  ---- */}
      {(showAddForm || showEditForm) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{showAddForm ? "Add New Employee" : "Edit Employee"}</h2>
                <button className="close-btn" onClick={showAddForm ? closeAdd : closeEdit}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">ID</label>
                      <input name="id" value={formData.id} onChange={handleChange} className="form-input" disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input name="name" value={formData.name} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input name="email" value={formData.email} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="form-input" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Personal Phone</label>
                      <input name="personalPhone" value={formData.personalPhone} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Residential Phone</label>
                      <input name="residentialPhone" value={formData.residentialPhone} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Place</label>
                      <input name="place" value={formData.place} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">District</label>
                      <input name="district" value={formData.district} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Professional Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <select name="education" value={formData.education} onChange={handleChange} className="form-input">
                        <option value="">Select Education</option>
                        <option>High School</option>
                        <option>Diploma</option>
                        <option>Bachelor's Degree</option>
                        <option>Master's Degree</option>
                        <option>PhD</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Experience</label>
                      <input name="experience" value={formData.experience} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Organization</label>
                      <input name="organization" value={formData.organization} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Duty Start</label>
                      <input name="dutyTimeStart" value={formData.dutyTimeStart} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duty End</label>
                      <input name="dutyTimeEnd" value={formData.dutyTimeEnd} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="form-input" />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Bank Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Bank Account #</label>
                      <input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IFSC Code</label>
                      <input name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Bank Name</label>
                      <input name="bankName" value={formData.bankName} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Branch</label>
                      <input name="branch" value={formData.branch} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={showAddForm ? closeAdd : closeEdit}>Cancel</button>
                <button className="btn btn-success" onClick={showAddForm ? submitAdd : submitEdit}>{showAddForm ? "Add Employee" : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----  DELETE CONFIRM MODAL  ---- */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Confirm Delete</h2>
                <button className="close-btn" onClick={cancelDelete}>×</button>
              </div>
              <div className="modal-body">
                <div className="confirm-message">
                  <p>Are you sure you want to delete <strong>{employeeToDelete.name}</strong>?</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={cancelDelete}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;