import React, { useState, useEffect } from "react";
import "./InterviewManagement.scss";

function InterviewManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");

  // Mock data
  useEffect(() => {
    setInterviews([
      {
        id: "INT-001",
        no: 1,
        createdDate: "15 Sep 2025",
        name: "AMAL",
        gender: "MALE",
        email: "amal@example.com",
        dob: "1990-05-15",
        address: "sulthan bathery",
        positionApplied: "sales",
        interviewDate: "2024-01-20",
        interviewTime: "10:00",
        interviewer: "naufal@imcbsglobal.com",
        mode: "Online",
        status: "Scheduled",
        place: "kalpetta",
        jobTitle: "sales",
        interviewedBy: "naufal@imcbsglobal.com",
        district: "Kalpetta",
        phoneNumber: "+91 9876543210",
        education: "B.Tech CSE",
        experience: "2 Years",
        remark: "Good technical skills",
        result: "Selected"
      },
      {
        id: "INT-002",
        no: 2,
        createdDate: "26 Aug 2025",
        name: "shikha",
        gender: "FEMALE",
        email: "shikha@example.com",
        dob: "1990-09-12",
        address: "kalpetta, byepass(PO",
        positionApplied: "marketing",
        interviewDate: "2024-01-27",
        interviewTime: "16:00",
        interviewer: "info@imcbsglobal.com",
        mode: "Offline",
        status: "SELECTED",
        place: "kalpetta",
        jobTitle: "Marketing",
        interviewedBy: "info@imcbsglobal.com",
        district: "Wayanad",
        phoneNumber: "+91 9876543216",
        education: "BCA",
        experience: "2 Years",
        remark: "good skill",
        result: "SELECTED"
      },
      {
        id: "INT-003",
        no: 3,
        createdDate: "23 Aug 2025",
        name: "Sreekutty",
        gender: "Female",
        email: "sree@example.com",
        dob: "1989-11-30",
        address: "meppadi WAYANA",
        positionApplied: "Sales",
        interviewDate: "2024-01-28",
        interviewTime: "10:30",
        interviewer: "merinaayalil@gmail.com",
        mode: "Online",
        status: "Completed",
        place: "meppadi",
        jobTitle: "Sales",
        interviewedBy: "merinaayalil@gmail.com",
        district: "Wayanad",
        phoneNumber: "+91 7592983961",
        education: "B.Tech IT",
        experience: "1Years",
        remark: "Excellent performance",
        result: "Selected"
      },
    ]);
  }, []);

  const handleOpenModal = (interview = null) => {
    setIsModalOpen(true);
    setSelectedCandidate("");
    
    if (interview) {
      setEditingInterview(interview);
      setSelectedCandidate(interview.name);
    } else {
      setEditingInterview(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveInterview = () => {
    if (selectedCandidate) {
      // Add your save logic here
      console.log("Saving interview for:", selectedCandidate);
      handleCloseModal();
    }
  };

  const handleDeleteInterview = (id) => {
    if (window.confirm("Are you sure you want to delete this interview record?")) {
      const updatedInterviews = interviews.filter(interview => interview.id !== id);
      const renumberedInterviews = updatedInterviews.map((interview, index) => ({
        ...interview,
        no: index + 1
      }));
      setInterviews(renumberedInterviews);
    }
  };

  // New function to handle result change
  const handleResultChange = (interviewId, newResult) => {
    const updatedInterviews = interviews.map(interview => 
      interview.id === interviewId 
        ? { ...interview, result: newResult }
        : interview
    );
    setInterviews(updatedInterviews);
  };

  // Function to get the CSS class for the result dropdown
  const getResultClass = (result) => {
    if (!result) return 'no-status';
    const resultLower = result.toLowerCase();
    if (resultLower === 'selected') return 'selected';
    if (resultLower === 'pending') return 'pending';
    if (resultLower === 'rejected') return 'rejected';
    return 'no-status';
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="interview-management">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">Interview Management</h1>
          <div className="page-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, job title, email, or ID"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="add-btn"
              onClick={() => handleOpenModal()}
            >
              + Add New
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        <div className="table-container">
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
                <th>INTERVIEWED BY</th>
                <th>PHONE NUMBER</th>
                <th>EDUCATION</th>
                <th>EXPERIENCE</th>
                <th>DOB</th>
                <th>REMARK</th>
                <th>RESULT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview, index) => (
                  <tr key={interview.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{interview.no}</td>
                    <td>{interview.createdDate}</td>
                    <td className="name-cell">{interview.name}</td>
                    <td>{interview.jobTitle}</td>
                    <td className="cv-cell">
                      <button className="view-cv-btn">View CV</button>
                    </td>
                    <td>{interview.place}</td>
                    <td className="gender-cell">{interview.gender}</td>
                    <td className="address-cell" title={interview.address}>{interview.address}</td>
                    <td>{interview.district}</td>
                    <td className="interviewer-cell">{interview.interviewedBy}</td>
                    <td className="phone-cell">{interview.phoneNumber}</td>
                    <td>{interview.education}</td>
                    <td>{interview.experience}</td>
                    <td className="dob-cell">{interview.dob}</td>
                    <td className="remark-cell" title={interview.remark}>{interview.remark}</td>
                    <td className="result-cell">
                      <div className="result-dropdown">
                        <select
                          value={interview.result || ''}
                          onChange={(e) => handleResultChange(interview.id, e.target.value)}
                          className={`result-select ${getResultClass(interview.result)}`}
                        >
                          <option value="" className="no-status-option">--Select--</option>
                          <option value="Selected" className="selected-option">Selected</option>
                          <option value="Rejected" className="rejected-option">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleOpenModal(interview)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteInterview(interview.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="17" className="no-data">
                    No interviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Modal for Interview */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <div className="modal-title-section">
                  <h2>Add Interview Management</h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="close-btn"
                >
                  ×
                </button>
              </div>

              {/* Simple Form Content */}
              <div className="simple-form-container">
                <div className="form-group">
                  <label className="form-label">Select Name:</label>
                  <select
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Select Candidate --</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                    <option value="Sarah Wilson">Sarah Wilson</option>
                    <option value="David Brown">David Brown</option>
                  </select>
                </div>
              </div>
              
              {/* Modal Actions */}
              <div className="simple-modal-actions">
                <button
                  onClick={handleSaveInterview}
                  className="update-btn"
                  disabled={!selectedCandidate}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewManagement;