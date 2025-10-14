import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OfferLetter.scss";

function OfferLetter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCVGenerator, setShowCVGenerator] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [candidates, setCandidates] = useState([]);

  // Mock data
  useEffect(() => {
    setCandidates([
      {
        id: 1,
        no: 1,
        createdDate: "15 Sep 2025",
        name: "Sreekutty",
        jobTitle: "Marketing Executive",
        cvAttachment: true,
        place: "Meppadi",
        generatedBy: "merinayalil@gmail.com",
        gender: "FEMALE",
        district: "WAYANAD",
        phoneNumber: "+91 9876543210",
        education: "MBA Marketing",
        experience: "3 years",
        dob: "15/03/1995",
        remark: "Excellent communication skills",
        cvSource: "Online Portal",
        interviewReview: "Candidate performed exceptionally well in the interview. Strong analytical skills and good cultural fit.",
        status: "WILLING"
      },
      {
        id: 2,
        no: 2,
        createdDate: "29 Aug 2025",
        name: "RISVAN",
        jobTitle: "Marketing",
        cvAttachment: true,
        place: "Chundale",
        generatedBy: "merinayalil@gmail.com",
        gender: "MALE",
        district: "WAYANAD",
        phoneNumber: "+91 8765432109",
        education: "B.Tech Computer Science",
        experience: "2 years",
        dob: "22/07/1997",
        remark: "Strong technical background",
        cvSource: "Company Website",
        interviewReview: "Good technical knowledge. Needs improvement in communication skills but shows great potential.",
        status: "WILLING"
      },
      {
        id: 3,
        no: 3,
        createdDate: "27 Aug 2025",
        name: "Amal",
        jobTitle: "Computer Hardware Technician",
        cvAttachment: true,
        place: "Wayanad",
        generatedBy: "info@imcbsglobal.com",
        gender: "MALE",
        district: "WAYANAD",
        phoneNumber: "+91 7654321098",
        education: "Diploma in Computer Hardware",
        experience: "4 years",
        dob: "10/12/1993",
        remark: "Hardware troubleshooting expert",
        cvSource: "Referral",
        interviewReview: "Excellent hands-on experience. Very knowledgeable about hardware systems and troubleshooting.",
        status: "NOT WILLING"
      },
    ]);
  }, []);

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowPopup(true);
  };

  const handleGenerateCV = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCVGenerator(true);
  };

  const handleClearCandidate = (candidate) => {
    setCandidateToDelete(candidate);
    setShowClearConfirm(true);
  };

  const confirmClearCandidate = () => {
    if (candidateToDelete) {
      const updatedCandidates = candidates.filter(c => c.id !== candidateToDelete.id);
      const renumberedCandidates = updatedCandidates.map((candidate, index) => ({
        ...candidate,
        no: index + 1
      }));
      setCandidates(renumberedCandidates);
    }
    setShowClearConfirm(false);
    setCandidateToDelete(null);
  };

  const cancelClearCandidate = () => {
    setShowClearConfirm(false);
    setCandidateToDelete(null);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedCandidate(null);
  };

  const closeCVGenerator = () => {
    setShowCVGenerator(false);
    setSelectedCandidate(null);
  };

  const handleDownloadPDF = () => {
    console.log("Download PDF clicked for:", selectedCandidate?.name);
  };

  const handleGenerateOfferLetter = () => {
    console.log("Generate offer letter for:", selectedCandidate?.name);
    closePopup();
  };

  const handleAddOfferLetter = (candidate = null) => {
    if (candidate) {
      // Navigate to add offer letter page with candidate data
      navigate('/hr/add-offer-letter', { state: { candidate } });
    } else {
      // Navigate to add offer letter page without specific candidate
      navigate('/hr/add-offer-letter');
    }
  };

  const handleStatusChange = (candidateId, newStatus) => {
    setCandidates(prev => prev.map(candidate =>
      candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate
    ));
  };

  // Function to get the CSS class for status
  const getStatusClass = (status) => {
    if (!status) return 'no-status';
    const statusLower = status.toLowerCase();
    if (statusLower === 'willing') return 'willing';
    if (statusLower === 'not willing') return 'not-willing';
    return 'no-status';
  };

  return (
    <div className="offer-letter-management">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">Offer Letter Management</h1>
          <div className="page-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, job title, place, district, or status"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="add-offer-letter-btn"
              onClick={() => handleAddOfferLetter()}
            >
              + Add Offer Letter
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <span className="info-text">
          {filteredCandidates.length} candidate(s) selected for offer letter processing.
        </span>
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
                <th>GENERATED BY</th>
                <th>GENDER</th>
                <th>DISTRICT</th>
                <th>PHONE NUMBER</th>
                <th>EDUCATION</th>
                <th>EXPERIENCE</th>
                <th>DOB</th>
                <th>REMARK</th>
                <th>CV SOURCE</th>
                <th>STATUS</th>
                <th>GENERATE DETAILS</th>
                <th>OFFER LETTER</th>
                <th>CLEAR</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate, index) => (
                  <tr key={candidate.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{candidate.no}</td>
                    <td>{candidate.createdDate}</td>
                    <td className="name-cell">{candidate.name}</td>
                    <td>{candidate.jobTitle}</td>
                    <td className="cv-cell">
                      <button 
                        className="view-cv-btn"
                        onClick={() => handleGenerateCV(candidate)}
                      >
                        View CV
                      </button>
                    </td>
                    <td>{candidate.place}</td>
                    <td className="email-cell">{candidate.generatedBy}</td>
                    <td className="gender-cell">{candidate.gender}</td>
                    <td>{candidate.district}</td>
                    <td className="phone-cell">{candidate.phoneNumber}</td>
                    <td>{candidate.education}</td>
                    <td>{candidate.experience}</td>
                    <td className="dob-cell">{candidate.dob}</td>
                    <td className="remark-cell" title={candidate.remark}>{candidate.remark}</td>
                    <td>{candidate.cvSource}</td>
                    <td className="status-cell">
                      <div className="status-dropdown">
                        <select
                          value={candidate.status || ''}
                          onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                          className={`status-select ${getStatusClass(candidate.status)}`}
                        >
                          <option value="WILLING" className="willing-option">Willing</option>
                          <option value="NOT WILLING" className="not-willing-option">Not Willing</option>
                        </select>
                      </div>
                    </td>
                    <td className="generate-cell">
                      <button 
                        className="generate-btn"
                        onClick={() => handleGenerateDetails(candidate)}
                      >
                        Generate
                      </button>
                    </td>
                    <td className="offer-letter-cell">
                      <button 
                        className="offer-letter-btn"
                        onClick={() => handleAddOfferLetter(candidate)}
                      >
                        Create Offer
                      </button>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="clear-btn"
                        onClick={() => handleClearCandidate(candidate)}
                      >
                        Clear
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="19" className="no-data">
                    No candidates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && candidateToDelete && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title-section">
                  <h2>Confirm Delete</h2>
                </div>
                <button onClick={cancelClearCandidate} className="close-btn">×</button>
              </div>

              <div className="modal-body">
                <div className="confirm-message">
                  <p>Are you sure you want to clear <strong>{candidateToDelete.name}</strong> from the list?</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={cancelClearCandidate}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmClearCandidate}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Review Modal */}
      {showPopup && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal interview-modal">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title-section">
                  <h2>Interview Review - {selectedCandidate.name}</h2>
                </div>
                <button onClick={closePopup} className="close-btn">×</button>
              </div>

              <div className="modal-body">
                <div className="review-section">
                  <h4 className="section-title">Candidate Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedCandidate.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Job Title:</span>
                      <span className="value">{selectedCandidate.jobTitle}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className={`status-badge ${getStatusClass(selectedCandidate.status)}`}>
                        {selectedCandidate.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Experience:</span>
                      <span className="value">{selectedCandidate.experience}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Education:</span>
                      <span className="value">{selectedCandidate.education}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedCandidate.phoneNumber}</span>
                    </div>
                  </div>
                  
                  <h4 className="section-title">Interview Review</h4>
                  <div className="review-text">
                    {selectedCandidate.interviewReview}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={closePopup}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleGenerateOfferLetter}>
                  Generate Offer Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CV Generator Modal */}
      {showCVGenerator && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal cv-modal">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title-section">
                  <h2>CV - {selectedCandidate.name}</h2>
                </div>
                <button onClick={closeCVGenerator} className="close-btn">×</button>
              </div>

              <div className="modal-body">
                <div className="cv-content">
                  <div className="cv-header">
                    <h1 className="cv-name">{selectedCandidate.name}</h1>
                    <p className="cv-title">{selectedCandidate.jobTitle}</p>
                    <div className="cv-contact">
                      <span>{selectedCandidate.phoneNumber}</span>
                      <span>{selectedCandidate.place}, {selectedCandidate.district}</span>
                      <span>Status: {selectedCandidate.status}</span>
                    </div>
                  </div>

                  <div className="cv-section">
                    <h2 className="cv-section-title">Professional Summary</h2>
                    <p className="cv-text">
                      Experienced {selectedCandidate.jobTitle} with {selectedCandidate.experience} of professional experience. 
                      {selectedCandidate.education} graduate with strong skills in the field. 
                      {selectedCandidate.remark}
                    </p>
                  </div>

                  <div className="cv-section">
                    <h2 className="cv-section-title">Education</h2>
                    <p className="cv-text">
                      <strong>{selectedCandidate.education}</strong>
                    </p>
                  </div>

                  <div className="cv-section">
                    <h2 className="cv-section-title">Experience</h2>
                    <p className="cv-text">
                      <strong>{selectedCandidate.experience}</strong> of professional experience in {selectedCandidate.jobTitle} role.
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={closeCVGenerator}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={handleDownloadPDF}>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferLetter;