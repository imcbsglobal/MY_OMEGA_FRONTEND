import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Attendance.scss";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function Attendance() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchName, setSearchName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('access_token');
  const isAdmin = user.is_admin || user.is_staff || user.is_superuser;

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [selectedMonth]);

  const fetchMonthlyAttendance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [year, month] = selectedMonth.split("-");
      const response = await axios.get(
        `${API_BASE_URL}/attendance/monthly_grid/`,
        {
          params: { month, year },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      let data = response.data;
      
      // Apply search filter if needed
      if (searchName.trim()) {
        data = data.filter(emp => 
          emp.user_name.toLowerCase().includes(searchName.toLowerCase())
        );
      }
      
      // Add row numbers
      data = data.map((emp, index) => ({
        ...emp,
        no: index + 1
      }));
      
      setAttendanceData(data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedMonth) {
        fetchMonthlyAttendance();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchName]);

  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split("-").map(Number);
    return new Date(year, month, 0).getDate();
  };

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

  const handleStarClick = async (employeeIndex, dayIndex, currentStatus) => {
    // Only admins can edit attendance
    if (!isAdmin) {
      return;
    }

    // Don't open modal for holiday or not-marked
    if (['holiday', 'not-marked'].includes(currentStatus)) {
      return;
    }

    const employee = attendanceData[employeeIndex];
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, dayIndex + 1);
    
    // Fetch detailed attendance for this date
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await axios.get(
        `${API_BASE_URL}/attendance/attendance/`,
        {
          params: {
            user_id: employee.user_id,
            from_date: dateStr,
            to_date: dateStr
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const attendanceRecord = response.data.results?.[0] || response.data[0];
      
      setSelectedAttendance({
        attendanceId: attendanceRecord?.id,
        employeeIndex,
        dayIndex,
        currentStatus,
        employeeName: employee.user_name,
        userId: employee.user_id,
        date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        dateStr,
        punchInTime: attendanceRecord?.punch_in_time ? new Date(attendanceRecord.punch_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
        punchOutTime: attendanceRecord?.punch_out_time ? new Date(attendanceRecord.punch_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "Not punched out",
        punchInLocation: attendanceRecord?.punch_in_location || "N/A",
        punchOutLocation: attendanceRecord?.punch_out_location || "Not available",
        note: attendanceRecord?.note || "",
        adminNote: attendanceRecord?.admin_note || "",
        workingHours: attendanceRecord?.working_hours || 0
      });
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching attendance details:", err);
    }
  };

  const handleVerifyAttendance = async () => {
    if (!selectedAttendance.attendanceId) {
      alert("No attendance record found to verify");
      setShowModal(false);
      return;
    }

    try {
      const adminNote = document.getElementById('admin-note')?.value || '';
      
      await axios.post(
        `${API_BASE_URL}/attendance/attendance/${selectedAttendance.attendanceId}/verify/`,
        { admin_note: adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Attendance verified successfully");
      setShowModal(false);
      fetchMonthlyAttendance();
    } catch (err) {
      console.error("Error verifying attendance:", err);
      alert("Failed to verify attendance");
    }
  };

  const handleUpdateAttendance = async () => {
    if (!selectedAttendance.attendanceId) {
      alert("No attendance record found to update");
      setShowModal(false);
      return;
    }

    try {
      const newStatus = document.getElementById('status-select').value;
      const adminNote = document.getElementById('admin-note')?.value || '';
      
      await axios.patch(
        `${API_BASE_URL}/attendance/attendance/${selectedAttendance.attendanceId}/update_status/`,
        {
          status: newStatus,
          admin_note: adminNote
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Attendance updated successfully");
      setShowModal(false);
      fetchMonthlyAttendance();
    } catch (err) {
      console.error("Error updating attendance:", err);
      alert("Failed to update attendance");
    }
  };

  const handleViewSummary = (employee) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    navigate(`/hr/attendance/summary/${employee.user_id}?year=${year}&month=${month}`);
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

            {isAdmin && (
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
            )}
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
        {loading && <div className="loading">Loading attendance data...</div>}
        {error && <div className="error">{error}</div>}
        
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
              {attendanceData.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6 + daysInMonth} className="no-data">
                    No attendance data available
                  </td>
                </tr>
              ) : (
                attendanceData.map((employee, empIndex) => (
                  <tr key={employee.user_id}>
                    <td>{employee.no}</td>
                    <td>{employee.user_name}</td>
                    <td>{employee.user_email}</td>
                    <td>{employee.duty_start}</td>
                    <td>{employee.duty_end}</td>
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
                          className={`star ${status} ${isAdmin ? 'clickable' : ''}`}
                          onClick={() => handleStarClick(empIndex, dayIndex, status)}
                        >
                          {getStarIcon(status)}
                        </span>
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
      {showModal && selectedAttendance && isAdmin && (
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
                  <label>Working Hours</label>
                  <input type="text" value={`${selectedAttendance.workingHours} hours`} readOnly />
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
                  <label>Admin Note</label>
                  <textarea 
                    id="admin-note"
                    placeholder="Enter admin note here" 
                    rows="3"
                    defaultValue={selectedAttendance.adminNote}
                  ></textarea>
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
                    <div className="punch-value link">{selectedAttendance.punchInLocation}</div>
                  </div>
                </div>

                <div className="punch-row">
                  <div className="punch-item">
                    <label>Punch Out Time</label>
                    <div className="punch-value">{selectedAttendance.punchOutTime}</div>
                  </div>
                  <div className="punch-item">
                    <label>Punch Out Location</label>
                    <div className="punch-value link">{selectedAttendance.punchOutLocation}</div>
                  </div>
                </div>

                {selectedAttendance.note && (
                  <div className="punch-row">
                    <div className="punch-item full-width">
                      <label>User Note</label>
                      <div className="punch-value">{selectedAttendance.note}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              <button className="btn-primary" onClick={handleUpdateAttendance}>Update Attendance</button>
              {isVerified(selectedAttendance.currentStatus) ? (
                <button className="btn-verify" onClick={handleVerifyAttendance}>Re-verify Attendance</button>
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