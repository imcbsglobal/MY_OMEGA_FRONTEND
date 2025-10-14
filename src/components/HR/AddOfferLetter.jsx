import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AddOfferLetter.scss";

function AddOfferLetter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    candidateId: "",
    position: "",
    department: "",
    startDate: "",
    salary: "",
    workingHoursFrom: "09:30",
    workingHoursTo: "17:30",
    noticePeriod: ""
  });

  // Mock candidates data
  useEffect(() => {
    setCandidates([
      { id: 1, name: "Sreekutty", jobTitle: "Marketing Executive" },
      { id: 2, name: "RISVAN", jobTitle: "Marketing" },
      { id: 3, name: "Amal", jobTitle: "Computer Hardware Technician" }
    ]);

    // Pre-fill form if candidate data is passed
    if (location.state?.candidate) {
      const candidate = location.state.candidate;
      setFormData(prev => ({
        ...prev,
        candidateId: candidate.id.toString(),
        position: candidate.jobTitle
      }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Offer Letter Data:", formData);
    // Here you would typically send data to your backend
    alert("Offer letter saved successfully!");
    navigate('/hr/offer-letter');
  };

  const handleCancel = () => {
    navigate('/hr/offer-letter');
  };

  return (
    <div className="add-offer-letter">
      {/* Back Button */}
      <div className="back-button-container">
        <button className="btn-back" onClick={handleCancel}>
          ← Back
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        <div className="form-container">
          <h1 className="form-title">Add Offer Letter</h1>
          <form onSubmit={handleSubmit} className="offer-letter-form">
            {/* Candidate Selection */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Select Candidate:</label>
                  <select
                    name="candidateId"
                    value={formData.candidateId}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">-- Select Candidate --</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.jobTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Position and Department */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Position:</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter position"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department:</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter department"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Start Date */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Start Date:</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <div className="date-format">dd-mm-yyyy</div>
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Salary:</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter salary"
                    required
                  />
                </div>
                <div className="form-group">
                  {/* Empty space for alignment */}
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Working Hours:</label>
                  <div className="time-input-group">
                    <input
                      type="time"
                      name="workingHoursFrom"
                      value={formData.workingHoursFrom}
                      onChange={handleInputChange}
                      className="form-input time-input"
                    />
                    <span className="time-separator">to</span>
                    <input
                      type="time"
                      name="workingHoursTo"
                      value={formData.workingHoursTo}
                      onChange={handleInputChange}
                      className="form-input time-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  {/* Empty space for alignment */}
                </div>
              </div>
            </div>

            {/* Notice Period */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Notice Period (days):</label>
                  <input
                    type="number"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter notice period"
                    required
                  />
                </div>
                <div className="form-group">
                  {/* Empty space for alignment */}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" className="btn btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-save">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddOfferLetter;