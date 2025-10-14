import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Attendance.scss";

function Attendance() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState("2025-10");
  const [searchName, setSearchName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Helper function to check if a day is Sunday
  const isSunday = (yearMonth, dayIndex) => {
    const [year, month] = yearMonth.split("-").map(Number);
    const date = new Date(year, month - 1, dayIndex + 1);
    return date.getDay() === 0; // 0 = Sunday
  };

  // Generate initial attendance data
  const generateInitialAttendance = (month) => {
    return [
      {
        no: 1,
        name: "ADILA NESIRIN",
        userId: "adilanezrin27@gmail.com",
        dutyStart: "09:30",
        dutyEnd: "17:30",
        attendance: Array(31).fill(null).map((_, i) => {
          if (isSunday(month, i)) return "holiday";
          if ((i + 1) % 8 === 0) return "half";
          return "full";
        })
      },
      {
        no: 2,
        name: "AJAY MATHEW",
        userId: "ajay.02mathew@gmail.com",
        dutyStart: "09:30",
        dutyEnd: "17:30",
        attendance: Array(31).fill(null).map((_, i) => {
          if (isSunday(month, i)) return "holiday";
          return "leave";
        })
      },
      {
        no: 3,
        name: "AJIN K AGUSTIAN",
        userId: "ajinajin063@gmail.com",
        dutyStart: "09:00",
        dutyEnd: "08:00",
        attendance: Array(31).fill(null).map((_, i) => {
          if (isSunday(month, i)) return "holiday";
          if ((i + 1) % 8 === 0) return "half";
          if (i < 3) return "leave";
          return "full";
        })
      }
    ];
  };

  // Sample data - replace with actual data from your API
  const [attendanceData, setAttendanceData] = useState(generateInitialAttendance(selectedMonth));

  // Get days in selected month
  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split("-").map(Number);
    return new Date(year, month, 0).getDate();
  };

  // Get day names for each date
  const getDayNames = (yearMonth, numDays) => {
    const [year, month] = yearMonth.split("-").map(Number);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: numDays }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);
      return dayNames[date.getDay()];
    });
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const dayNames = getDayNames(selectedMonth, daysInMonth);

  const getStarIcon = (type) => {
    const icons = {
      "full": "★",
      "half": "★",
      "half-verified": "★",
      "verified": "★",
      "leave": "★",
      "verified-leave": "★",
      "holiday": "★",
      "not-marked": "★"
    };
    return icons[type] || "★";
  };

  const handleStarClick = (employeeIndex, dayIndex, currentStatus) => {
    console.log('Star clicked:', currentStatus); // Debug log
    
    // Don't open modal for holiday or not-marked
    if (['holiday', 'not-marked'].includes(currentStatus)) {
      return;
    }

    const employee = attendanceData[employeeIndex];
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, dayIndex + 1);
    
    setSelectedAttendance({
      employeeIndex,
      dayIndex,
      currentStatus,
      employeeName: employee.name,
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      punchInTime: currentStatus === 'leave' ? "N/A" : "09:00 AM",
      punchOutTime: currentStatus === 'full' || currentStatus === 'verified' ? "06:02 PM" : currentStatus === 'leave' ? "N/A" : "Not punched out",
      punchInLocation: currentStatus === 'leave' ? "N/A" : "Vythiri",
      punchOutLocation: currentStatus === 'full' || currentStatus === 'verified' ? "Vythiri" : currentStatus === 'leave' ? "N/A" : "Not available"
    });
    setShowModal(true);
  };

  const handleVerifyAttendance = () => {
    const { employeeIndex, dayIndex, currentStatus } = selectedAttendance;
    
    setAttendanceData(prevData => {
      const newData = [...prevData];
      let newStatus;
      
      // If currently full or half, verify it
      if (currentStatus === 'full') {
        newStatus = 'verified';
      } else if (currentStatus === 'half') {
        newStatus = 'half-verified';
      } else if (currentStatus === 'leave') {
        newStatus = 'verified-leave';
      } else {
        newStatus = currentStatus; // Keep verified status as is
      }
      
      newData[employeeIndex].attendance[dayIndex] = newStatus;
      return newData;
    });
    
    setShowModal(false);
    setSelectedAttendance(null);
  };

  const handleReVerifyAttendance = () => {
    // Re-verify logic - could reset to unverified or update verification timestamp
    handleVerifyAttendance();
  };

  const handleUpdateAttendance = () => {
    const { employeeIndex, dayIndex } = selectedAttendance;
    const newStatus = document.getElementById('status-select').value;
    
    setAttendanceData(prevData => {
      const newData = [...prevData];
      newData[employeeIndex].attendance[dayIndex] = newStatus;
      return newData;
    });
    
    setShowModal(false);
    setSelectedAttendance(null);
  };

  const handleViewSummary = (employee) => {
    console.log('View Summary clicked for:', employee.name);
    const [year, month] = selectedMonth.split("-").map(Number);
    const summaryPath = `/hr/attendance/summary/${employee.no}?year=${year}&month=${month}`;
    console.log('Navigating to:', summaryPath);
    navigate(summaryPath);
  };

  const isVerified = (status) => {
    return status === 'verified' || status === 'half-verified' || status === 'verified-leave';
  };

  return (
    <div className="attendance-container">
      {/* Header with gradient */}
      <div className="page-header">
        <div className="header-content">
          <h2 className="page-title">Attendance Management</h2>
          
          <div className="header-controls">
            <div className="control-group">
              <label>Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-picker"
              />
            </div>

            <div className="control-group">
              <label>Search by Name</label>
              <input
                type="text"
                placeholder="Enter name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="legend-section">
        <div className="legend">
          <div className="legend-item">
            <span className="star full-day">★</span> Full Day
          </div>
          <div className="legend-item">
            <span className="star half-day">★</span> Half Day
          </div>
          <div className="legend-item">
            <span className="star verified-half">★</span> Verified Half Day
          </div>
          <div className="legend-item">
            <span className="star leave">★</span> Leave
          </div>
          <div className="legend-item">
            <span className="star verified-leave">★</span> Verified Leave
          </div>
          <div className="legend-item">
            <span className="star holiday">★</span> Holiday
          </div>
          <div className="legend-item">
            <span className="star verified">★</span> Verified
          </div>
          <div className="legend-item">
            <span className="star not-marked">★</span> Not Marked
          </div>
        </div>
      </div>

      {/* Content Area with Table */}
      <div className="content-area">
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>User ID</th>
                <th>Duty Start</th>
                <th>Duty End</th>
                <th>Summary</th>
                {[...Array(daysInMonth)].map((_, i) => (
                  <th key={i}>
                    <div>{i + 1}</div>
                    <div className="day-label">{dayNames[i]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan={6 + daysInMonth} className="no-data">
                    No attendance data available
                  </td>
                </tr>
              ) : (
                attendanceData.map((employee, empIndex) => (
                  <tr key={employee.no}>
                    <td>{employee.no}</td>
                    <td>{employee.name}</td>
                    <td>{employee.userId}</td>
                    <td>{employee.dutyStart}</td>
                    <td>{employee.dutyEnd}</td>
                    <td>
                      <button 
                        className="view-summary-btn"
                        onClick={() => handleViewSummary(employee)}
                        title="View Attendance Summary"
                      >
                        👁️
                      </button>
                    </td>
                    {employee.attendance.map((status, dayIndex) => (
                      <td key={dayIndex}>
                        <span 
                          className={`star ${status}`}
                          onClick={() => handleStarClick(empIndex, dayIndex, status)}
                        >
                          {getStarIcon(status)}
                        </span>
                      </td>
                    ))}
                    {[...Array(Math.max(0, daysInMonth - employee.attendance.length))].map((_, i) => (
                      <td key={`empty-${i}`}>
                        <span className="star not-marked">★</span>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Details Modal */}
      {showModal && selectedAttendance && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Attendance Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <div className="form-group">
                  <label>Employee Name</label>
                  <input type="text" value={selectedAttendance.employeeName} readOnly />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input type="text" value={selectedAttendance.date} readOnly />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select id="status-select" defaultValue={selectedAttendance.currentStatus}>
                    <option value="full">Full Day</option>
                    <option value="half">Half Day</option>
                    <option value="leave">Leave</option>
                    <option value="wfh">Work From Home</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Add Note (Optional)</label>
                  <textarea placeholder="Enter note here" rows="3"></textarea>
                </div>
              </div>

              <div className="modal-section punch-details">
                <h3>Punch Details</h3>
                
                <div className="punch-row">
                  <div className="punch-item">
                    <label>Punch In Time</label>
                    <div className="punch-value">{selectedAttendance.punchInTime}</div>
                  </div>
                  <div className="punch-item">
                    <label>Punch In Location</label>
                    <div className="punch-value link">{selectedAttendance.punchInLocation} 🔗</div>
                  </div>
                </div>

                <div className="punch-row">
                  <div className="punch-item">
                    <label>Punch Out Time</label>
                    <div className="punch-value">{selectedAttendance.punchOutTime}</div>
                  </div>
                  <div className="punch-item">
                    <label>Punch Out Location</label>
                    <div className="punch-value link">{selectedAttendance.punchOutLocation} {selectedAttendance.punchOutLocation !== "Not available" && "🔗"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              <button className="btn-primary" onClick={handleUpdateAttendance}>Update Attendance</button>
              {isVerified(selectedAttendance.currentStatus) ? (
                <button className="btn-verify" onClick={handleReVerifyAttendance}>Re-verify Attendance</button>
              ) : (
                <button className="btn-verify" onClick={handleVerifyAttendance}>Verify Attendance</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;