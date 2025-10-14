import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import './AttendanceSummary.scss';

function AttendanceSummary() {
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const year = searchParams.get('year') || '2025';
  const month = searchParams.get('month') || '10';

  const [selectedUser, setSelectedUser] = useState(employeeId);
  const [selectedMonth, setSelectedMonth] = useState(`${year}-${month.toString().padStart(2, '0')}`);

  // Sample employee data - replace with actual data from API
  const employees = [
    { id: '1', name: 'ADILA NESIRIN', email: 'adilanezrin27@gmail.com' },
    { id: '2', name: 'AJAY MATHEW', email: 'ajay.02mathew@gmail.com' },
    { id: '3', name: 'AJIN K AGUSTIAN', email: 'ajinajin063@gmail.com' }
  ];

  const currentEmployee = employees.find(emp => emp.id === selectedUser) || employees[0];

  // Generate sample attendance data for the month
  const generateAttendanceDetails = () => {
    const details = [];
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(selectedYear, selectedMonthNum, 0).getDate();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedYear, selectedMonthNum - 1, i);
      const dayName = dayNames[date.getDay()];
      
      // Skip future dates
      if (date > new Date()) continue;
      
      let status = 'Verified Full Day';
      let punchIn = `${8 + Math.floor(Math.random() * 2)}:${10 + Math.floor(Math.random() * 20)} AM`;
      let punchOut = `0${5 + Math.floor(Math.random() * 2)}:${10 + Math.floor(Math.random() * 50)} PM`;
      let punchInLocation = 'Vythiri';
      let punchOutLocation = Math.random() > 0.8 ? 'Kalpetta' : 'Vythiri';
      let note = '';
      
      // Add some variety
      if (dayName === 'Sunday') continue;
      if (i % 10 === 0) {
        status = 'Half Day(Unverified)';
        punchOut = '01:30 PM';
      }
      if (i === 4) {
        note = '🔵';
      }
      
      details.push({
        date: `${i.toString().padStart(2, '0')} ${monthNames[selectedMonthNum - 1]} ${selectedYear}`,
        day: dayName,
        status,
        punchIn,
        punchOut,
        punchInLocation,
        punchOutLocation,
        note
      });
    }
    
    return details;
  };

  const attendanceDetails = generateAttendanceDetails();

  // Calculate summary counts
  const fullDaysUnverified = 0;
  const verifiedFullDays = attendanceDetails.filter(d => d.status === 'Verified Full Day').length;
  const halfDaysUnverified = attendanceDetails.filter(d => d.status === 'Half Day(Unverified)').length;
  const verifiedHalfDays = 0;
  const leaves = 0;
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(selectedYear, selectedMonthNum, 0).getDate();
  const notMarked = daysInMonth - attendanceDetails.length;

  const getStatusClass = (status) => {
    if (status === 'Verified Full Day') return 'status-verified';
    if (status.includes('Half')) return 'status-half';
    if (status.includes('Leave')) return 'status-leave';
    if (status.includes('WFH')) return 'status-wfh';
    return 'status-default';
  };

  const handleGoClick = () => {
    const [newYear, newMonth] = selectedMonth.split('-');
    window.location.href = `/attendance/summary/${selectedUser}/?year=${newYear}&month=${parseInt(newMonth)}`;
  };

  const handleLocationClick = (location) => {
    // Open Google Maps with the location
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="attendance-summary-container">
      {/* Header - CV Management Style */}
      <div className="summary-header">
        <div className="header-content">
          <h1 className="page-title">
            Attendance Summary for {currentEmployee.name}
          </h1>
          
          <div className="header-actions">
            <div className="control-group">
              <label>Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            <button className="go-button" onClick={handleGoClick}>
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-wrapper">
        <div className="summary-cards">
          <div className="summary-card full-unverified">
            <div className="card-title">Full Days(Unverified)</div>
            <div className="card-value">{fullDaysUnverified}</div>
          </div>

          <div className="summary-card verified-full">
            <div className="card-title">Verified Full Days</div>
            <div className="card-value">{verifiedFullDays}</div>
          </div>

          <div className="summary-card half-unverified">
            <div className="card-title">Half Days(Unverified)</div>
            <div className="card-value">{halfDaysUnverified}</div>
          </div>

          <div className="summary-card verified-half">
            <div className="card-title">Verified Half Days</div>
            <div className="card-value">{verifiedHalfDays}</div>
          </div>

          <div className="summary-card leaves">
            <div className="card-title">Leaves</div>
            <div className="card-value">{leaves}</div>
          </div>

          <div className="summary-card not-marked">
            <div className="card-title">Not Marked</div>
            <div className="card-value">{notMarked}</div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="content-area">
        <div className="table-wrapper">
          <table className="attendance-detail-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Punch In Time</th>
                <th>Punch Out Time</th>
                <th>Punch In Location</th>
                <th>Punch Out Location</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendanceDetails.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No attendance data available for this month
                  </td>
                </tr>
              ) : (
                attendanceDetails.map((record, index) => (
                  <tr key={index}>
                    <td className="date-cell">{record.date}</td>
                    <td className="day-cell">{record.day}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.punchIn}</td>
                    <td>{record.punchOut}</td>
                    <td>
                      <span 
                        className="location-link"
                        onClick={() => handleLocationClick(record.punchInLocation)}
                      >
                        {record.punchInLocation} 🔗
                      </span>
                    </td>
                    <td>
                      <span 
                        className="location-link"
                        onClick={() => handleLocationClick(record.punchOutLocation)}
                      >
                        {record.punchOutLocation} 🔗
                      </span>
                    </td>
                    <td className="note-cell">{record.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Back Button inside table wrapper */}
          <div className="back-button-container">
            <button
              className="back-button"
              onClick={() => window.history.back()}
            >
              ← Back to Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceSummary;