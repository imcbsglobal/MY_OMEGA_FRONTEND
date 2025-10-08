import React, { useState, useEffect } from "react";
import "./CVManagement.scss";

function CVManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [interviewStatusFilter, setInterviewStatusFilter] = useState("");
  const [showAddCVForm, setShowAddCVForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [cvToDelete, setCVToDelete] = useState(null);
  const [cvToEdit, setCVToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showCVViewer, setShowCVViewer] = useState(false);
  const [currentCVUrl, setCurrentCVUrl] = useState(null);
  const itemsPerPage = 10;
  const [cvList, setCVList] = useState([]);
  const [newCV, setNewCV] = useState({
    name: "",
    jobTitle: "",
    place: "",
    createdUser: "",
    gender: "MALE",
    address: "",
    district: "",
    phoneNumber: "",
    education: "",
    experience: "",
    dob: "",
    remarks: "",
    cvSource: "DIRECT",
    interviewStatus: "No"
  });

  useEffect(() => {
    setCVList([
      {
        id: 1, no: 1, createdDate: "26-09-2025",
        name: "KIRAN", jobTitle: "FIELD STAFF - WAYANAD", cvAttachment: true,
        place: "WAYANAD LOCATION", createdUser: "info@imcbsglobal.com", gender: "MALE",
        address: "N/A", district: "OTHER", phoneNumber: "9061797155",
        education: "Plus Two", experience: "5 years", dob: "May 1, 1985",
        remarks: "Strong field experience", cvSource: "DIRECT", interviewStatus: "No",
        cvFileUrl: null
      },
      {
        id: 2, no: 2, createdDate: "26-09-2025",
        name: "ARUN M", jobTitle: "FIELD STAFF - WAYANAD", cvAttachment: false,
        place: "MALAPPURAM - MUKKAM", createdUser: "info@imcbsglobal.com", gender: "MALE",
        address: "AKKAPRAMBA (PO), MALAPPURAM", district: "MALAPPURAM", phoneNumber: "9961215256",
        education: "Degree", experience: "3 years", dob: "None",
        remarks: "Good communication", cvSource: "DIRECT", interviewStatus: "No",
        cvFileUrl: null
      },
      {
        id: 3, no: 3, createdDate: "25-09-2025",
        name: "FATHIMA", jobTitle: "TECHNICAL SUPPORT", cvAttachment: false,
        place: "MEPPADI", createdUser: "info@imcbsglobal.com", gender: "FEMALE",
        address: "PALLIKKUNNU (HOUSE), MEPPADI", district: "WAYANAD", phoneNumber: "7034396998",
        education: "B.Tech Computer Science", experience: "2 years", dob: "None",
        remarks: "Technical expertise", cvSource: "DIRECT", interviewStatus: "Yes",
        cvFileUrl: null
      },
      {
        id: 4, no: 4, createdDate: "23-09-2025",
        name: "VEENA", jobTitle: "TECHNICAL SUPPORT", cvAttachment: false,
        place: "VENNIYODE", createdUser: "info@imcbsglobal.com", gender: "FEMALE",
        address: "THURUTHIYIL (H), KOTTATHARA (P", district: "WAYANAD", phoneNumber: "8848806456",
        education: "MCA", experience: "4 years", dob: "None",
        remarks: "Excellent problem solving", cvSource: "DIRECT", interviewStatus: "No",
        cvFileUrl: null
      }
    ]);
  }, []);

  const uniqueJobTitles = [...new Set(cvList.map(cv => cv.jobTitle))];

  const filteredCVs = cvList.filter(cv => {
    const matchesSearch =
      cv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.phoneNumber.includes(searchTerm);
    const matchesJobTitle = !jobTitleFilter || cv.jobTitle === jobTitleFilter;
    const matchesInterviewStatus = !interviewStatusFilter || cv.interviewStatus === interviewStatusFilter;
    return matchesSearch && matchesJobTitle && matchesInterviewStatus;
  });

  const totalPages = Math.ceil(filteredCVs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCVs = filteredCVs.slice(startIndex, endIndex);

  const handleAddCV = () => setShowAddCVForm(true);

  const handleCloseAddForm = () => {
    setShowAddCVForm(false);
    setUploadedFile(null);
    setNewCV({
      name: "", jobTitle: "", place: "", createdUser: "", gender: "MALE",
      address: "", district: "", phoneNumber: "", education: "", experience: "",
      dob: "", remarks: "", cvSource: "DIRECT", interviewStatus: "No"
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCV(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCVToEdit(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
      } else {
        alert('Please upload only PDF files');
        e.target.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById('cv-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmitCV = () => {
    if (!newCV.name.trim() || !newCV.jobTitle.trim()) {
      alert("Please fill in at least name and job title"); return;
    }
    
    let cvFileUrl = null;
    if (uploadedFile) {
      cvFileUrl = URL.createObjectURL(uploadedFile);
    }
    
    const newCVObj = {
      id: cvList.length + 1, no: cvList.length + 1,
      createdDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      }).replace(/\//g, '-'),
      ...newCV, 
      cvAttachment: uploadedFile ? true : false,
      cvFileUrl: cvFileUrl,
      createdUser: newCV.createdUser || "info@imcbsglobal.com"
    };
    setCVList(prev => [newCVObj, ...prev].map((cv, idx) => ({ ...cv, no: idx + 1 })));
    
    handleCloseAddForm();
  };

  const handleDeleteCV = (cv) => { setCVToDelete(cv); setShowDeleteConfirm(true); };
  const confirmDeleteCV = () => {
    if (cvToDelete) {
      const updated = cvList.filter(cv => cv.id !== cvToDelete.id);
      setCVList(updated.map((cv, idx) => ({ ...cv, no: idx + 1 })));
    }
    setShowDeleteConfirm(false); setCVToDelete(null);
  };
  const cancelDeleteCV = () => { setShowDeleteConfirm(false); setCVToDelete(null); };

  const handleEditCV = (cv) => { setCVToEdit({ ...cv }); setShowEditForm(true); };
  const handleCloseEditForm = () => { setShowEditForm(false); setCVToEdit(null); };
  const handleSubmitEdit = () => {
    if (!cvToEdit.name.trim() || !cvToEdit.jobTitle.trim()) {
      alert("Please fill in at least name and job title"); return;
    }
    setCVList(prev => prev.map(cv => cv.id === cvToEdit.id ? cvToEdit : cv));
    handleCloseEditForm();
  };

  const handleFirstPage = () => setCurrentPage(1);
  const handlePreviousPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handleLastPage = () => setCurrentPage(totalPages);

  const handleViewCV = (cv) => {
    if (cv.cvFileUrl) {
      setCurrentCVUrl(cv.cvFileUrl);
      setShowCVViewer(true);
    }
  };

  const handleCloseCVViewer = () => {
    setShowCVViewer(false);
    setCurrentCVUrl(null);
  };

  return (
    <div className="cv-management">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">CV Management</h1>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search by name, job title, email, or ID"
              className="search-input-header"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="add-btn-header" onClick={handleAddCV}>+ Add New</button>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>CREATED DATE</th>
                <th>NAME</th>
                <th>JOB TITLE</th>
                <th>CV ATTACHMENT</th>
                <th>PLACE</th>
                <th>GENDER</th>
                <th>ADDRESS</th>
                <th>DISTRICT</th>
                <th>INTERVIEW STATUS</th>
                <th>PHONE NUMBER</th>
                <th>EDUCATION</th>
                <th>EXPERIENCE</th>
                <th>DOB</th>
                <th>REMARKS</th>
                <th>CV SOURCE</th>
                <th>EDIT</th>
                <th>DELETE</th>
              </tr>
            </thead>

            <tbody>
              {currentCVs.length > 0 ? (
                currentCVs.map((cv) => (
                  <tr key={cv.id}>
                    <td>{cv.no}</td>
                    <td>{cv.createdDate}</td>
                    <td className="name-cell">{cv.name}</td>
                    <td>{cv.jobTitle}</td>
                    <td className="cv-cell">
                      {cv.cvAttachment && cv.cvFileUrl ? (
                        <button className="view-cv-btn" onClick={() => handleViewCV(cv)}>View CV</button>
                      ) : cv.cvAttachment ? (
                        <button className="view-cv-btn disabled" disabled>View CV</button>
                      ) : (
                        <span className="no-cv-text">No CV</span>
                      )}
                    </td>
                    <td>{cv.place}</td>
                    <td>{cv.gender}</td>
                    <td className="address-cell">{cv.address}</td>
                    <td>{cv.district}</td>
                    <td className="status-cell">
                      <span className={`status-pill ${cv.interviewStatus.toLowerCase()}`}>
                        {cv.interviewStatus}
                      </span>
                    </td>
                    <td className="phone-cell">{cv.phoneNumber}</td>
                    <td>{cv.education}</td>
                    <td>{cv.experience}</td>
                    <td>{cv.dob}</td>
                    <td className="remarks-cell">{cv.remarks}</td>
                    <td>{cv.cvSource}</td>
                    <td className="actions-cell">
                      <button className="edit-btn" onClick={() => handleEditCV(cv)}>Edit</button>
                    </td>
                    <td className="actions-cell">
                      <button className="delete-btn" onClick={() => handleDeleteCV(cv)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="18" className="no-data">No CVs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddCVForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New CV</h2>
              <button className="close-btn" onClick={handleCloseAddForm}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-container">
                {/* CV Upload Section */}
                <div className="cv-upload-section">
                  <label className="form-label">Upload CV (PDF only)</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="cv-file-input"
                      className="file-input"
                      accept=".pdf"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="cv-file-input" className="file-upload-label">
                      <span className="upload-icon">📄</span>
                      <div>
                        <div className="upload-text">
                          {uploadedFile ? uploadedFile.name : 'Click to upload CV (PDF only)'}
                        </div>
                        {!uploadedFile && (
                          <div className="upload-subtext">Max file size: 5MB</div>
                        )}
                      </div>
                    </label>
                    {uploadedFile && (
                      <div className="file-info">
                        <span className="file-size">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </span>
                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={handleRemoveFile}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Name</label>
                    <input type="text" name="name" value={newCV.name} onChange={handleInputChange} className="form-input" placeholder="Enter name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Job Title</label>
                    <input type="text" name="jobTitle" value={newCV.jobTitle} onChange={handleInputChange} className="form-input" placeholder="Enter job title" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Place</label>
                    <input type="text" name="place" value={newCV.place} onChange={handleInputChange} className="form-input" placeholder="Enter place" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Created User</label>
                    <input type="text" name="createdUser" value={newCV.createdUser} onChange={handleInputChange} className="form-input" placeholder="Enter email" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select name="gender" value={newCV.gender} onChange={handleInputChange} className="form-input">
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input type="text" name="district" value={newCV.district} onChange={handleInputChange} className="form-input" placeholder="Enter district" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input type="text" name="address" value={newCV.address} onChange={handleInputChange} className="form-input" placeholder="Enter address" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" name="phoneNumber" value={newCV.phoneNumber} onChange={handleInputChange} className="form-input" placeholder="Enter phone number" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Education</label>
                    <input type="text" name="education" value={newCV.education} onChange={handleInputChange} className="form-input" placeholder="Enter education" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience</label>
                    <input type="text" name="experience" value={newCV.experience} onChange={handleInputChange} className="form-input" placeholder="Enter experience" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="text" name="dob" value={newCV.dob} onChange={handleInputChange} className="form-input" placeholder="DD/MM/YYYY" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CV Source</label>
                    <input type="text" name="cvSource" value={newCV.cvSource} onChange={handleInputChange} className="form-input" placeholder="Enter CV source" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Interview Status</label>
                    <select name="interviewStatus" value={newCV.interviewStatus} onChange={handleInputChange} className="form-input">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <input type="text" name="remarks" value={newCV.remarks} onChange={handleInputChange} className="form-input" placeholder="Enter remarks" />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={handleCloseAddForm}>Cancel</button>
              <button className="btn btn-success" onClick={handleSubmitCV}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {showEditForm && cvToEdit && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit CV — {cvToEdit.name}</h2>
              <button className="close-btn" onClick={handleCloseEditForm}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-container">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Name</label>
                    <input type="text" name="name" value={cvToEdit.name} onChange={handleEditInputChange} className="form-input" placeholder="Enter name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Job Title</label>
                    <input type="text" name="jobTitle" value={cvToEdit.jobTitle} onChange={handleEditInputChange} className="form-input" placeholder="Enter job title" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Place</label>
                    <input type="text" name="place" value={cvToEdit.place} onChange={handleEditInputChange} className="form-input" placeholder="Enter place" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Created User</label>
                    <input type="text" name="createdUser" value={cvToEdit.createdUser} onChange={handleEditInputChange} className="form-input" placeholder="Enter email" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select name="gender" value={cvToEdit.gender} onChange={handleEditInputChange} className="form-input">
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input type="text" name="district" value={cvToEdit.district} onChange={handleEditInputChange} className="form-input" placeholder="Enter district" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input type="text" name="address" value={cvToEdit.address} onChange={handleEditInputChange} className="form-input" placeholder="Enter address" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" name="phoneNumber" value={cvToEdit.phoneNumber} onChange={handleEditInputChange} className="form-input" placeholder="Enter phone number" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Education</label>
                    <input type="text" name="education" value={cvToEdit.education} onChange={handleEditInputChange} className="form-input" placeholder="Enter education" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience</label>
                    <input type="text" name="experience" value={cvToEdit.experience} onChange={handleEditInputChange} className="form-input" placeholder="Enter experience" />
                  </div> 
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="text" name="dob" value={cvToEdit.dob} onChange={handleEditInputChange} className="form-input" placeholder="DD/MM/YYYY" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CV Source</label>
                    <input type="text" name="cvSource" value={cvToEdit.cvSource} onChange={handleEditInputChange} className="form-input" placeholder="Enter CV source" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Interview Status</label>
                    <select name="interviewStatus" value={cvToEdit.interviewStatus} onChange={handleEditInputChange} className="form-input">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <input type="text" name="remarks" value={cvToEdit.remarks} onChange={handleEditInputChange} className="form-input" placeholder="Enter remarks" />
                  </div> 
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={handleCloseEditForm}>Cancel</button>
              <button className="btn btn-success" onClick={handleSubmitEdit}>Update CV</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && cvToDelete && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-btn" onClick={cancelDeleteCV}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-message">
                <p>Are you sure you want to delete <strong>{cvToDelete.name}</strong> from the CV list?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={cancelDeleteCV}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteCV}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showCVViewer && currentCVUrl && (
        <div className="modal-overlay" onClick={handleCloseCVViewer}>
          <div className="modal cv-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>CV Document</h2>
              <button className="close-btn" onClick={handleCloseCVViewer}>×</button>
            </div>
            <div className="modal-body cv-viewer-body">
              <iframe
                src={currentCVUrl}
                className="cv-iframe"
                title="CV Document"
              />
            </div>
            <div className="modal-actions">
              <a 
                href={currentCVUrl} 
                download="CV.pdf" 
                className="btn btn-success"
              >
                Download CV
              </a>
              <button className="btn btn-cancel" onClick={handleCloseCVViewer}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CVManagement;