import React, { useState, useEffect } from 'react';
import './PunchinPunchout.scss';

const PunchinPunchout = () => {
  const [todayStatus, setTodayStatus] = useState({
    punchIn: null,
    punchInLocation: null,
    punchOut: null,
    punchOutLocation: null,
  });

  const [breakStatus, setBreakStatus] = useState({
    breaks: [],
    isOnBreak: false,
  });

  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Mock data for attendance records
  useEffect(() => {
    const mockRecords = [
      { date: 'Oct 1, 2025', day: 'Wed', status: 'Verified Full Day', punchIn: '09:31 AM', punchOut: '05:31 PM' },
      { date: 'Oct 2, 2025', day: 'Thu', status: 'Leave', punchIn: '--:--', punchOut: '--:--' },
      { date: 'Oct 3, 2025', day: 'Fri', status: 'Verified Full Day', punchIn: '09:39 AM', punchOut: '05:43 PM' },
      { date: 'Oct 4, 2025', day: 'Sat', status: 'Verified Full Day', punchIn: '09:28 AM', punchOut: '05:36 PM' },
      { date: 'Oct 5, 2025', day: 'Sun', status: 'Holiday', punchIn: '--:--', punchOut: '--:--' },
      { date: 'Oct 6, 2025', day: 'Mon', status: 'Verified Full Day', punchIn: '09:28 AM', punchOut: '--:--' },
      { date: 'Oct 7, 2025', day: 'Tue', status: 'Verified Full Day', punchIn: '09:23 AM', punchOut: '05:34 PM' },
      { date: 'Oct 8, 2025', day: 'Wed', status: 'Verified Full Day', punchIn: '09:34 AM', punchOut: '05:32 PM' },
      { date: 'Oct 9, 2025', day: 'Thu', status: 'Half Day', punchIn: '09:26 AM', punchOut: '--:--' },
      { date: 'Oct 10, 2025', day: 'Fri', status: 'Not Marked', punchIn: '--:--', punchOut: '--:--' },
    ];
    setAttendanceRecords(mockRecords);

    // Mock today's status
    setTodayStatus({
      punchIn: '09:26 AM',
      punchInLocation: 'Vythiri',
      punchOut: null,
      punchOutLocation: null,
    });
  }, [selectedMonth]);

  const handlePunchIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setTodayStatus(prev => ({
      ...prev,
      punchIn: time,
      punchInLocation: 'Vythiri', // This would come from geolocation in real app
    }));
  };

  const handlePunchOut = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setTodayStatus(prev => ({
      ...prev,
      punchOut: time,
      punchOutLocation: 'Vythiri', // This would come from geolocation in real app
    }));
  };

  const handleBreakPunchIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    if (breakStatus.isOnBreak) {
      // Completing the break
      const updatedBreaks = [...breakStatus.breaks];
      const lastBreak = updatedBreaks[updatedBreaks.length - 1];
      lastBreak.end = time;
      
      setBreakStatus({
        breaks: updatedBreaks,
        isOnBreak: false,
      });
    } else {
      // Starting a break
      setBreakStatus(prev => ({
        breaks: [...prev.breaks, { start: time, end: null }],
        isOnBreak: true,
      }));
    }
  };

  const handleBreakPunchOut = () => {
    if (breakStatus.isOnBreak) {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const updatedBreaks = [...breakStatus.breaks];
      const lastBreak = updatedBreaks[updatedBreaks.length - 1];
      lastBreak.end = time;
      
      setBreakStatus({
        breaks: updatedBreaks,
        isOnBreak: false,
      });
    }
  };

  const getStatusIcon = (status) => {
    if (status.includes('Verified Full Day')) return '★';
    if (status.includes('Full Day')) return '☆';
    if (status.includes('Verified Half Day')) return '★';
    if (status.includes('Half Day')) return '☆';
    if (status.includes('Leave')) return '★';
    if (status.includes('Holiday')) return '★';
    if (status.includes('Not Marked')) return '☆';
    return '';
  };

  const getStatusClass = (status) => {
    if (status.includes('Verified Full Day')) return 'verified-full';
    if (status.includes('Full Day')) return 'full';
    if (status.includes('Verified Half Day')) return 'verified-half';
    if (status.includes('Half Day')) return 'half';
    if (status.includes('Leave')) return 'leave';
    if (status.includes('Holiday')) return 'holiday';
    if (status.includes('Not Marked')) return 'not-marked';
    return '';
  };

  const handleRefresh = () => {
    // Refresh functionality
    window.location.reload();
  };

  return (
    <div className="punchinpunchout">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Punch In/Punch Out</h1>
          <div className="header-actions">
            <input
              type="month"
              className="month-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {/* Daily Attendance Card */}
        <div className="attendance-card">
          <h2 className="card-title">Daily Attendance</h2>
          <div className="status-card">
            <div className="status-header">
              <h3>Today's Status</h3>
              <button className="refresh-btn" onClick={handleRefresh}>
                <span className="refresh-icon">↻</span>
              </button>
            </div>
            <div className="status-details">
              <div className="status-row">
                <span className="status-label">Punch In:</span>
                <span className="status-value">{todayStatus.punchIn || 'Not punched in yet'}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Punch In Location:</span>
                <span className="status-value location">{todayStatus.punchInLocation || 'Not punched in yet'}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Punch Out:</span>
                <span className="status-value">{todayStatus.punchOut || 'Not punched out yet'}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Punch Out Location:</span>
                <span className="status-value location">{todayStatus.punchOutLocation || 'Not punched out yet'}</span>
              </div>
            </div>
          </div>
          <div className="action-buttons">
            <button 
              className="punch-btn punch-in-btn" 
              onClick={handlePunchIn}
              disabled={todayStatus.punchIn !== null}
            >
              <span className="btn-icon">→</span> Punch In
            </button>
            <button 
              className="punch-btn punch-out-btn" 
              onClick={handlePunchOut}
              disabled={todayStatus.punchIn === null || todayStatus.punchOut !== null}
            >
              <span className="btn-icon">←</span> Punch Out
            </button>
          </div>
        </div>

        {/* Break Time Management Card */}
        <div className="attendance-card">
          <h2 className="card-title">Break Time Management</h2>
          <div className="status-card">
            <div className="status-header">
              <h3>Today's Break Status</h3>
              <button className="refresh-btn" onClick={handleRefresh}>
                <span className="refresh-icon">↻</span>
              </button>
            </div>
            <div className="break-details">
              {breakStatus.breaks.length === 0 ? (
                <p className="no-breaks">No breaks taken today</p>
              ) : (
                breakStatus.breaks.map((breakItem, index) => (
                  <div key={index} className="break-item">
                    <span className="break-label">Break {index + 1}:</span>
                    <span className="break-time">
                      {breakItem.start} to {breakItem.end || 'In progress...'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="action-buttons">
            <button 
              className="punch-btn break-in-btn" 
              onClick={handleBreakPunchIn}
              disabled={todayStatus.punchIn === null || todayStatus.punchOut !== null}
            >
              <span className="btn-icon">☕</span> Break Punch In
            </button>
            <button 
              className="punch-btn break-out-btn" 
              onClick={handleBreakPunchOut}
              disabled={!breakStatus.isOnBreak}
            >
              <span className="btn-icon">⏸</span> Break Punch Out
            </button>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="records-section">
          <div className="records-header">
            <h2 className="section-title">My Attendance Records</h2>
          </div>

          {/* Legend */}
          <div className="legend">
            <div className="legend-item">
              <span className="legend-icon verified-full">★</span>
              <span className="legend-text">Verified Full Day</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon full">☆</span>
              <span className="legend-text">Full Day</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon verified-half">★</span>
              <span className="legend-text">Verified Half Day</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon half">☆</span>
              <span className="legend-text">Half Day</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon leave">★</span>
              <span className="legend-text">Leave</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon holiday">★</span>
              <span className="legend-text">Holiday</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon not-marked">☆</span>
              <span className="legend-text">Not Marked</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No attendance records found</td>
                  </tr>
                ) : (
                  attendanceRecords.map((record, index) => (
                    <tr key={index}>
                      <td className="date-cell">{record.date}</td>
                      <td className="day-cell">{record.day}</td>
                      <td className={`status-cell ${getStatusClass(record.status)}`}>
                        <span className="status-icon">{getStatusIcon(record.status)}</span>
                        {record.status}
                      </td>
                      <td className="time-cell">{record.punchIn}</td>
                      <td className="time-cell">{record.punchOut}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunchinPunchout;