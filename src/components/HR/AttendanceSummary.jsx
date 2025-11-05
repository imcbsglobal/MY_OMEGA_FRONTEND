import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AttendanceSummary.scss';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

function AttendanceSummary() {
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();

  const [selectedUser, setSelectedUser] = useState(employeeId);
  const [selectedMonth, setSelectedMonth] = useState(`${year}-${month.padStart(2, '0')}`);
  const [employees, setEmployees] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('access_token');
  const isAdmin = user.is_admin || user.is_staff || user.is_superuser;

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, []);

  useEffect(() => {
    fetchAttendanceSummary();
    fetchAttendanceDetails();
  }, [selectedUser, selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/brief_list/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchAttendanceSummary = async () => {
    setLoading(true);
    try {
      const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
      const response = await axios.get(
        `${API_BASE_URL}/attendance/attendance/summary/`,
        {
          params: {
            user_id: selectedUser,
            month: selectedMonthNum,
            year: selectedYear
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSummaryData(response.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceDetails = async () => {
    try {
      const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
      const response = await axios.get(
        `${API_BASE_URL}/attendance/attendance/`,
        {
          params: {
            user_id: selectedUser,
            month: selectedMonthNum,
            year: selectedYear
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const data = response.data.results || response.data;
      const formatted = data.map(record => {
        const date = new Date(record.date);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        let statusDisplay = 'Full Day';
        if (record.status === 'half') {
          statusDisplay = record.verification_status === 'verified' ? 'Verified Half Day' : 'Half Day(Unverified)';
        } else if (record.status === 'full') {
          statusDisplay = record.verification_status === 'verified' ? 'Verified Full Day' : 'Full Day(Unverified)';
        } else if (record.status === 'leave') {
          statusDisplay = record.verification_status === 'verified' ? 'Verified Leave' : 'Leave';
        } else if (record.status === 'wfh') {
          statusDisplay = 'Work From Home';
        }
        
        return {
          date: `${date.getDate().toString().padStart(2, '0')} ${monthNames[date.getMonth()]} ${date.getFullYear()}`,
          day: dayNames[date.getDay()],
          status: statusDisplay,
          punchIn: record.punch_in_time ? new Date(record.punch_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          punchOut: record.punch_out_time ? new Date(record.punch_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Not punched out',
          punchInLocation: record.punch_in_location || 'N/A',
          punchOutLocation: record.punch_out_location || 'Not available',
          note: record.note || '',
          workingHours: record.working_hours || 0
        };
      });
      
      setAttendanceDetails(formatted);
    } catch (err) {
      console.error("Error fetching attendance details:", err);
    }
  };

  const getStatusClass = (status) => {
    if (status.includes('Verified Full')) return 'status-verified';
    if (status.includes('Verified Half')) return 'status-verified-half';
    if (status.includes('Half')) return 'status-half';
    if (status.includes('Leave')) return 'status-leave';
    if (status.includes('WFH')) return 'status-wfh';
    return 'status-default';
  };

  const handleGoClick = () => {
    const [newYear, newMonth] = selectedMonth.split('-');
    navigate(`/hr/attendance/summary/${selectedUser}?year=${newYear}&month=${parseInt(newMonth)}`);
  };

  const handleLocationClick = (location) => {
    if (location && location !== 'N/A' && location !== 'Not available') {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const currentEmployee = isAdmin 
    ? employees.find(emp => emp.id === parseInt(selectedUser))
    : user;

  return (
    <div className="attendance-summary-container">
      {/* Header */}
      <div className="summary-header">
        <div className="header-content">
          <h1 className="page-title">
            Attendance Summary for {currentEmployee?.name || 'Loading...'}
          </h1>
          
          <div className="header-actions">
            {isAdmin && employees.length > 0 && (
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
            )}

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
      {loading ? (
        <div className="loading">Loading summary...</div>
      ) : summaryData && (
        <div className="summary-cards-wrapper">
          <div className="summary-cards">
            <div className="summary-card full-unverified">
              <div className="card-title">Full Days(Unverified)</div>
              <div className="card-value">{summaryData.full_days_unverified}</div>
            </div>

            <div className="summary-card verified-full">
              <div className="card-title">Verified Full Days</div>
              <div className="card-value">{summaryData.verified_full_days}</div>
            </div>

            <div className="summary-card half-unverified">
              <div className="card-title">Half Days(Unverified)</div>
              <div className="card-value">{summaryData.half_days_unverified}</div>
            </div>

            <div className="summary-card verified-half">
              <div className="card-title">Verified Half Days</div>
              <div className="card-value">{summaryData.verified_half_days}</div>
            </div>

            <div className="summary-card leaves">
              <div className="card-title">Leaves</div>
              <div className="card-value">{summaryData.leaves}</div>
            </div>

            <div className="summary-card not-marked">
              <div className="card-title">Not Marked</div>
              <div className="card-value">{summaryData.not_marked}</div>
            </div>

            <div className="summary-card working-hours">
              <div className="card-title">Total Working Hours</div>
              <div className="card-value">{summaryData.total_working_hours}h</div>
            </div>
          </div>
        </div>
      )}

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
                <th>Working Hours</th>
                <th>Punch In Location</th>
                <th>Punch Out Location</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendanceDetails.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
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
                    <td>{record.workingHours}h</td>
                    <td>
                      <span 
                        className={`location-link ${record.punchInLocation !== 'N/A' ? 'clickable' : ''}`}
                        onClick={() => handleLocationClick(record.punchInLocation)}
                      >
                        {record.punchInLocation} {record.punchInLocation !== 'N/A' && '🔗'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`location-link ${record.punchOutLocation !== 'Not available' ? 'clickable' : ''}`}
                        onClick={() => handleLocationClick(record.punchOutLocation)}
                      >
                        {record.punchOutLocation} {record.punchOutLocation !== 'Not available' && record.punchOutLocation !== 'N/A' && '🔗'}
                      </span>
                    </td>
                    <td className="note-cell">{record.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Back Button */}
          <div className="back-button-container">
            <button
              className="back-button"
              onClick={() => navigate(-1)}
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