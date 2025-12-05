import React, { useState, useEffect } from 'react';
import api from '../../api/client'; // Import the configured axios client

const PunchInPunchOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successType, setSuccessType] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [todayStatus, setTodayStatus] = useState({ 
    punch_records: [], 
    total_working_hours: 0,
    total_break_hours: 0,
    is_currently_on_break: false
  });
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [branch, setBranch] = useState('Office');
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [isCurrentlyPunchedIn, setIsCurrentlyPunchedIn] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [location, setLocation] = useState({ latitude: null, longitude: null, address: '' });
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Check if mobile on initial render and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchTodayAttendance();
    fetchMonthlySummary();
    fetchLeaveRequests();
    getUserLocation();
    fetchAttendanceHistory();
  }, [currentMonth]);

  useEffect(() => {
    if (showSuccessScreen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowSuccessScreen(false);
      setCountdown(5);
    }
  }, [showSuccessScreen, countdown]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude, address: '' });
          try {
            const response = await api.post('/hr/reverse-geocode-bigdata/', { latitude, longitude });
            if (response.data?.address) {
              setLocation(prev => ({ ...prev, address: response.data.address }));
              setBranch(response.data.address);
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation({ latitude: 10.8505, longitude: 76.2711, address: 'Office' });
        }
      );
    } else {
      setLocation({ latitude: 10.8505, longitude: 76.2711, address: 'Office' });
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile/');
      if (response.data) {
        setUserName(response.data.name || response.data.username || 'User');
        setUserEmail(response.data.email || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserName('User');
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const response = await api.get(`/hr/attendance/my_summary/?month=${month}&year=${year}`);
      
      if (response.data) {
        setMonthlySummary({
          verified_full_days: response.data.verified_full_days || 0,
          verified_half_days: response.data.verified_half_days || 0,
          leaves: response.data.leaves || 0,
          total_working_hours: response.data.total_working_hours || '0.00'
        });
      }
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      setMonthlySummary({
        verified_full_days: 0,
        verified_half_days: 0,
        leaves: 0,
        total_working_hours: '0.00'
      });
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/hr/leave/my_requests/');
      if (response.data) {
        setLeaveRequests(response.data.results || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await api.get(`/hr/attendance/history/?year=${year}&month=${month}`);
      
      if (response.data) {
        const history = {};
        response.data.forEach(record => {
          const date = new Date(record.date);
          const day = date.getDate();
          history[day] = {
            punch_records: record.punch_records || [],
            worked: record.worked || false,
            total_hours: record.total_hours || 0
          };
        });
        setAttendanceHistory(history);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/hr/attendance/today_status/');
      if (response.data) {
        const punchRecords = response.data.punch_records || [];
        
        setTodayStatus({ 
          punch_records: punchRecords,
          total_working_hours: response.data.total_working_hours || 0,
          total_break_hours: response.data.total_break_hours || 0,
          is_currently_on_break: response.data.is_currently_on_break || false
        });
        
        // Check if user is currently punched in (last punch is IN)
        if (punchRecords.length > 0) {
          const lastPunch = punchRecords[punchRecords.length - 1];
          setIsCurrentlyPunchedIn(lastPunch.punch_type === 'in');
        } else {
          setIsCurrentlyPunchedIn(false);
        }
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const formatDay = (date) => date.toLocaleDateString('en-US', { weekday: 'long' });

  const formatHoursMinutes = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handlePunchIn = async () => {
    setLoading(true);
    try {
      await api.post('/hr/attendance/punch_in/', {
        location: location.address || 'Office',
        latitude: location.latitude || 10.8505,
        longitude: location.longitude || 76.2711,
      });
      setIsCurrentlyPunchedIn(true);
      await fetchTodayAttendance();
      await fetchMonthlySummary();
      setSuccessType('punchin');
      setShowSuccessScreen(true);
    } catch (error) {
      console.error('Punch in failed:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Punch in failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setLoading(true);
    try {
      await api.post('/hr/attendance/punch_out/', {
        location: location.address || 'Office',
        latitude: location.latitude || 10.8505,
        longitude: location.longitude || 76.2711,
        note: 'Punch Out'
      });
      setIsCurrentlyPunchedIn(false);
      await fetchTodayAttendance();
      await fetchMonthlySummary();
      setSuccessType('punchout');
      setShowSuccessScreen(true);
    } catch (error) {
      console.error('Punch out failed:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Punch Out Failed');
    } finally {
      setLoading(false);
    }
  };

  const isDateOnLeave = (date) => {
    return leaveRequests.some(leave => {
      if (leave.status !== 'approved' && leave.status !== 'pending') return false;
      const leaveStart = new Date(leave.from_date);
      const leaveEnd = new Date(leave.to_date);
      leaveStart.setHours(0, 0, 0, 0);
      leaveEnd.setHours(23, 59, 59, 999);
      date.setHours(0, 0, 0, 0);
      return date >= leaveStart && date <= leaveEnd;
    });
  };

  const getDayAttendanceInfo = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayKey = day;
    
    if (attendanceHistory[dayKey]) {
      const records = attendanceHistory[dayKey].punch_records;
      const inRecords = records.filter(r => r.punch_type === 'in');
      const outRecords = records.filter(r => r.punch_type === 'out');
      
      return {
        worked: attendanceHistory[dayKey].worked,
        firstPunchIn: inRecords.length > 0 ? new Date(inRecords[0].punch_time) : null,
        lastPunchOut: outRecords.length > 0 ? new Date(outRecords[outRecords.length - 1].punch_time) : null,
        totalHours: attendanceHistory[dayKey].total_hours
      };
    }
    
    return { worked: false, firstPunchIn: null, lastPunchOut: null, totalHours: 0 };
  };

  const handleDayHover = (event, day) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
    setHoveredDay(day);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = new Date(year, month, 1).getDay();
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const onLeave = isDateOnLeave(new Date(date));
      const attendanceInfo = getDayAttendanceInfo(day);
      const { worked, firstPunchIn, lastPunchOut } = attendanceInfo;
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${onLeave ? 'on-leave' : ''}`}
          onMouseEnter={(e) => handleDayHover(e, day)}
          onMouseLeave={() => setHoveredDay(null)}
          onClick={() => setHoveredDay(hoveredDay === day ? null : day)}
        >
          {day}
          <div className="day-status-dots">
            {worked && !onLeave && <div className="status-dot worked-dot" title="Worked"></div>}
            {onLeave && <div className="status-dot leave-dot" title="On Leave"></div>}
          </div>
        </div>
      );
    }
    
    return (
      <div className="calendar">
        <div className="calendar-header">
          <button className="calendar-nav" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>‹</button>
          <div className="calendar-title">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          <button className="calendar-nav" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div className="calendar-days-header">
          {dayNames.map(name => <div key={name} className="calendar-day-name">{name}</div>)}
        </div>
        <div className="calendar-grid">{days}</div>
        
        {hoveredDay && (
          <div 
            className="day-tooltip"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="tooltip-content">
              <div className="tooltip-date">{hoveredDay} {currentMonth.toLocaleDateString('en-US', { month: 'short' })}</div>
              {(() => {
                const attendanceInfo = getDayAttendanceInfo(hoveredDay);
                const onLeave = isDateOnLeave(new Date(year, month, hoveredDay));
                
                if (onLeave) {
                  return <div className="tooltip-status">On Leave</div>;
                } else if (attendanceInfo.worked) {
                  return (
                    <>
                      <div className="tooltip-status worked">Worked</div>
                      {attendanceInfo.firstPunchIn && (
                        <div className="tooltip-time">First In: {formatTime(attendanceInfo.firstPunchIn)}</div>
                      )}
                      {attendanceInfo.lastPunchOut && (
                        <div className="tooltip-time">Last Out: {formatTime(attendanceInfo.lastPunchOut)}</div>
                      )}
                      {attendanceInfo.totalHours > 0 && (
                        <div className="tooltip-hours">Total: {formatHoursMinutes(attendanceInfo.totalHours)}</div>
                      )}
                    </>
                  );
                } else if (new Date(year, month, hoveredDay).toDateString() === new Date().toDateString()) {
                  return <div className="tooltip-status today">Today</div>;
                }
              })()}
            </div>
            <div className="tooltip-arrow"></div>
          </div>
        )}
        
        <div className="calendar-legend">
          <div className="legend-item"><div className="legend-color worked-dot"></div><span>Worked</span></div>
          <div className="legend-item"><div className="legend-color leave-dot"></div><span>Leave</span></div>
          <div className="legend-item"><div className="legend-color today"></div><span>Today</span></div>
        </div>
      </div>
    );
  };

  const renderPunchSessions = () => {
    const punchRecords = todayStatus.punch_records || [];
    if (punchRecords.length === 0) return null;

    const sessions = [];
    for (let i = 0; i < punchRecords.length; i += 2) {
      const punchIn = punchRecords[i];
      const punchOut = punchRecords[i + 1];
      
      if (punchIn && punchIn.punch_type === 'in') {
        sessions.push({
          punchIn: punchIn,
          punchOut: punchOut && punchOut.punch_type === 'out' ? punchOut : null
        });
      }
    }

    return (
      <div className="sessions-summary">
        <div className="sessions-header">Today's Sessions</div>
        <div className="sessions-list">
          {sessions.map((session, index) => {
            const punchInTime = session.punchIn ? new Date(session.punchIn.punch_time) : null;
            const punchOutTime = session.punchOut ? new Date(session.punchOut.punch_time) : null;
            let duration = '0:00';
            
            if (punchInTime) {
              const end = punchOutTime || new Date();
              const minutes = Math.floor((end - punchInTime) / (1000 * 60));
              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              duration = `${hours}:${mins.toString().padStart(2, '0')}`;
            }
            
            return (
              <div key={index} className="session-item">
                <div className="session-number">Session {index + 1}</div>
                <div className="session-times">
                  <div className="session-time">
                    <span className="time-label">In:</span>
                    <span className="time-value">{punchInTime ? formatTime(punchInTime) : '-'}</span>
                  </div>
                  <div className="session-time">
                    <span className="time-label">Out:</span>
                    <span className="time-value">{punchOutTime ? formatTime(punchOutTime) : 'Active'}</span>
                  </div>
                </div>
                <div className="session-duration">{duration}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMobileHeader = () => {
    return (
      <div className="mobile-header">
        <div className="mobile-header-top">
          <div className="mobile-date-time">
            <div className="mobile-date-day">{formatDay(currentTime)}</div>
            <div className="mobile-date">{formatDate(currentTime)}</div>
            <div className="mobile-time">{formatTime(currentTime)}</div>
          </div>
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">👤</div>
            <div className="mobile-user-details">
              <div className="mobile-user-name">{userName}</div>
              {userEmail && <div className="mobile-user-email">{userEmail}</div>}
            </div>
          </div>
        </div>
        <div className="mobile-monthly-stats">
          {monthlySummary && (
            <div className="mobile-stats-grid">
              <div className="mobile-stat-item">
                <div className="mobile-stat-label">Full Days</div>
                <div className="mobile-stat-value">{monthlySummary.verified_full_days}</div>
              </div>
              <div className="mobile-stat-item">
                <div className="mobile-stat-label">Half Days</div>
                <div className="mobile-stat-value">{monthlySummary.verified_half_days}</div>
              </div>
              <div className="mobile-stat-item">
                <div className="mobile-stat-label">Leaves</div>
                <div className="mobile-stat-value">{monthlySummary.leaves}</div>
              </div>
              <div className="mobile-stat-item">
                <div className="mobile-stat-label">Total Hours</div>
                <div className="mobile-stat-value">{monthlySummary.total_working_hours}h</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDesktopSidebar = () => {
    return (
      <div className="sidebar">
        <div className="current-date">
          <div className="date-day">{formatDay(currentTime)}, {formatDate(currentTime)}</div>
          <div className="date-time">{formatTime(currentTime)}</div>
        </div>
        <div className="user-profile">
          <div className="user-avatar-img">👤</div>
          <div className="user-name">{userName}</div>
          {userEmail && <div className="user-email">{userEmail}</div>}
        </div>
        
        {monthlySummary && (
          <div className="monthly-summary">
            <div className="summary-header">This Month</div>
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-label">Full Days</div>
                <div className="stat-value">{monthlySummary.verified_full_days}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Half Days</div>
                <div className="stat-value">{monthlySummary.verified_half_days}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Leaves</div>
                <div className="stat-value">{monthlySummary.leaves}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Total Hours</div>
                <div className="stat-value">{monthlySummary.total_working_hours}h</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="time-summary">
          <div className="summary-section">
            <div className="summary-title">Today's Summary</div>
            <div className="summary-stats-grid">
              <div className="stat-box">
                <div className="stat-box-label">Worked</div>
                <div className="stat-box-value worked">
                  {formatHoursMinutes(todayStatus.total_working_hours || 0)}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-box-label">Break Time</div>
                <div className="stat-box-value out-time">
                  {formatHoursMinutes(todayStatus.total_break_hours || 0)}
                </div>
              </div>
            </div>
          </div>
          
          {renderPunchSessions()}
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-container">
      {!isMobile ? (
        <>
          {renderDesktopSidebar()}
          
          <div className="main-content">
            <div className="content-wrapper">
              <div className="action-section">
                {!isCurrentlyPunchedIn ? (
                  <div className="action-screen">
                    <h2 className="action-title">Ready to punch in?</h2>
                    <br />
                    <div className="action-buttons-single">
                      <button 
                        className="action-btn punch-in-btn" 
                        onClick={handlePunchIn} 
                        disabled={loading}
                      >
                        <div className="btn-icon">👆</div>
                        <div className="btn-text">{loading ? 'Processing...' : 'Punch In'}</div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="action-screen">
                    <div className="check-icon">✓</div>
                    <h2 className="action-title">You are punched in</h2>
                    <div className="action-subtitle">to {branch}</div>
                    
                    <div className="summary-box">
                      <p><b>Total Today:</b> {formatHoursMinutes(todayStatus.total_working_hours || 0)}</p>
                      <p><b>Break Time:</b> {formatHoursMinutes(todayStatus.total_break_hours || 0)}</p>
                      <p><b>Sessions Today:</b> {Math.ceil((todayStatus.punch_records || []).length / 2)}</p>
                    </div>
                    
                    <div className="action-buttons-single">
                      <button 
                        className="action-btn punch-out-btn" 
                        onClick={handlePunchOut} 
                        disabled={loading}
                      >
                        <div className="btn-icon">👇</div>
                        <div className="btn-text">{loading ? 'Processing...' : 'Punch Out'}</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="calendar-section">
                <div className="calendar-container">{renderCalendar()}</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mobile-container">
          {renderMobileHeader()}
          
          <div className="mobile-main-content">
            <div className="mobile-action-section">
              {!isCurrentlyPunchedIn ? (
                <div className="mobile-action-screen">
                  <h2 className="mobile-action-title">Ready to punch in?</h2>
                  <div className="mobile-action-buttons-single">
                    <button 
                      className="mobile-action-btn punch-in-btn" 
                      onClick={handlePunchIn} 
                      disabled={loading}
                    >
                      <div className="mobile-btn-icon">👆</div>
                      <div className="mobile-btn-text">{loading ? 'Processing...' : 'Punch In'}</div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mobile-action-screen">
                  <div className="mobile-check-icon">✓</div>
                  <h2 className="mobile-action-title">You are punched in</h2>
                  <div className="mobile-action-subtitle">to {branch}</div>
                  
                  <div className="mobile-summary-box">
                    <p><b>Total Today:</b> {formatHoursMinutes(todayStatus.total_working_hours || 0)}</p>
                    <p><b>Break Time:</b> {formatHoursMinutes(todayStatus.total_break_hours || 0)}</p>
                    <p><b>Sessions Today:</b> {Math.ceil((todayStatus.punch_records || []).length / 2)}</p>
                  </div>
                  
                  <div className="mobile-action-buttons-single">
                    <button 
                      className="mobile-action-btn punch-out-btn" 
                      onClick={handlePunchOut} 
                      disabled={loading}
                    >
                      <div className="mobile-btn-icon">👇</div>
                      <div className="mobile-btn-text">{loading ? 'Processing...' : 'Punch Out'}</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mobile-today-summary">
              <div className="mobile-summary-title">Today's Summary</div>
              <div className="mobile-summary-stats-grid">
                <div className="mobile-stat-box">
                  <div className="mobile-stat-box-label">Worked</div>
                  <div className="mobile-stat-box-value worked">
                    {formatHoursMinutes(todayStatus.total_working_hours || 0)}
                  </div>
                </div>
                <div className="mobile-stat-box">
                  <div className="mobile-stat-box-label">Break Time</div>
                  <div className="mobile-stat-box-value out-time">
                    {formatHoursMinutes(todayStatus.total_break_hours || 0)}
                  </div>
                </div>
              </div>
              
              {renderPunchSessions()}
            </div>
            
            <div className="mobile-calendar-section">
              <div className="mobile-calendar-container">{renderCalendar()}</div>
            </div>
          </div>
        </div>
      )}
      
      {showSuccessScreen && (
        <div className={`success-screen ${successType}`}>
          <div className={`success-icon ${successType}-icon`}>✓</div>
          <h2 className="success-title">
            {successType === 'punchin' ? 'Punched In' : 'Punched Out'}
          </h2>
          <div className="success-subtitle">
            {branch} at {formatTime(currentTime)}
          </div>
          <div className="success-message">
            {successType === 'punchin' ? 'Welcome! Have a productive day 🎉' : 'Session ended! 👋'}
          </div>
          <div className="success-countdown">Closing in {countdown}s</div>
        </div>
      )}
      
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .attendance-container { 
          font-family: -apple-system, sans-serif; 
          display: flex; 
          min-height: 100vh; 
          background: #f5f5f5; 
        }
        .sidebar { 
          width: 300px; 
          background: white; 
          padding: 24px; 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
          box-shadow: 2px 0 12px rgba(0,0,0,0.05); 
          overflow-y: auto; 
        }
        .current-date { 
          padding: 16px 0; 
          border-bottom: 1px solid #f0f0f0; 
        }
        .date-day { 
          font-size: 13px; 
          color: #666; 
          margin-bottom: 4px; 
        }
        .date-time { 
          font-size: 28px; 
          font-weight: 300; 
          color: #333; 
        }
        .user-profile { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 8px; 
          padding: 16px 0; 
          border-bottom: 1px solid #f0f0f0; 
        }
        .user-avatar-img { 
          width: 64px; 
          height: 64px; 
          border-radius: 50%; 
          background: linear-gradient(135deg, #E69B9B, #E07B7B); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 32px; 
        }
        .user-name { 
          font-size: 16px; 
          font-weight: 600; 
          color: #333; 
        }
        .user-email { 
          font-size: 12px; 
          color: #999; 
        }
        .monthly-summary { 
          background: linear-gradient(135deg, #E69B9B, #E07B7B); 
          padding: 16px; 
          border-radius: 12px; 
          color: white; 
        }
        .summary-header { 
          font-size: 14px; 
          font-weight: 600; 
          margin-bottom: 12px; 
          opacity: 0.9; 
        }
        .summary-stats { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px; 
        }
        .stat-item { 
          background: rgba(255,255,255,0.15); 
          padding: 10px; 
          border-radius: 8px; 
          text-align: center; 
        }
        .stat-label { 
          font-size: 11px; 
          opacity: 0.9; 
          margin-bottom: 4px; 
        }
        .stat-value { 
          font-size: 20px; 
          font-weight: 600; 
        }
        .time-summary { 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
        }
        .summary-section { 
          padding-bottom: 20px; 
          border-bottom: 1px solid #f0f0f0; 
        }
        .summary-title { 
          font-size: 13px; 
          color: #999; 
          margin-bottom: 12px; 
        }
        .summary-stats-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 12px; 
        }
        .stat-box { 
          background: #f9f9f9; 
          padding: 14px; 
          border-radius: 10px; 
          text-align: center; 
        }
        .stat-box-label { 
          font-size: 11px; 
          color: #999; 
          margin-bottom: 6px; 
          text-transform: uppercase; 
          font-weight: 600; 
        }
        .stat-box-value { 
          font-size: 24px; 
          font-weight: 600; 
        }
        .stat-box-value.worked { 
          color: #E07B7B; 
        }
        .stat-box-value.out-time { 
          color: #9B6B6B; 
        }
        .sessions-summary { 
          background: #f9f9f9; 
          padding: 16px; 
          border-radius: 12px; 
        }
        .sessions-header { 
          font-size: 13px; 
          font-weight: 600; 
          color: #666; 
          margin-bottom: 12px; 
        }
        .sessions-list { 
          display: flex; 
          flex-direction: column; 
          gap: 12px; 
        }
        .session-item { 
          background: white; 
          padding: 12px; 
          border-radius: 8px; 
          border-left: 3px solid #E07B7B; 
        }
        .session-number { 
          font-size: 11px; 
          color: #999; 
          margin-bottom: 6px; 
          font-weight: 600; 
          text-transform: uppercase; 
        }
        .session-times { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 6px; 
        }
        .session-time { 
          display: flex; 
          flex-direction: column; 
        }
        .time-label { 
          font-size: 10px; 
          color: #999; 
        }
        .time-value { 
          font-size: 13px; 
          color: #333; 
          font-weight: 600; 
        }
        .session-duration { 
          font-size: 16px; 
          font-weight: 600; 
          color: #E07B7B; 
          text-align: center; 
          margin-top: 4px; 
        }
        .summary-box { 
          background: white; 
          padding: 18px 20px; 
          margin: 20px 0; 
          border-radius: 14px; 
          box-shadow: 0 4px 14px rgba(0,0,0,0.08); 
          text-align: left; 
        }
        .summary-box p { 
          font-size: 15px; 
          color: #444; 
          margin: 8px 0; 
          font-weight: 500; 
        }
        .summary-box b { 
          color: #222; 
          font-weight: 600; 
        }
        .main-content { 
          flex: 1; 
          padding: 32px; 
          display: flex; 
          position: relative; 
          overflow-y: auto; 
        }
        .content-wrapper { 
          display: flex; 
          gap: 32px; 
          width: 100%; 
          max-width: 1400px; 
          margin: 0 auto; 
        }
        .action-section { 
          flex: 1; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        }
        .calendar-section { 
          flex: 0 0 400px; 
          display: flex; 
          flex-direction: column; 
        }
        .calendar-container { 
          background: white; 
          padding: 24px; 
          border-radius: 16px; 
          box-shadow: 0 2px 12px rgba(0,0,0,0.06); 
          position: relative; 
        }
        .action-screen { 
          text-align: center; 
          max-width: 500px; 
          width: 100%; 
        }
        .check-icon { 
          width: 80px; 
          height: 80px; 
          border-radius: 50%; 
          border: 4px solid #E07B7B; 
          color: #E07B7B; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 48px; 
          margin: 0 auto 24px; 
        }
        .action-title { 
          font-size: 28px; 
          font-weight: 600; 
          color: #333; 
          margin-bottom: 8px; 
        }
        .action-subtitle { 
          font-size: 16px; 
          color: #999; 
          margin-bottom: 24px; 
        }
        .action-buttons-single { 
          display: flex; 
          justify-content: center; 
        }
        .action-btn { 
          padding: 48px 32px; 
          border: none; 
          border-radius: 16px; 
          cursor: pointer; 
          transition: all 0.3s; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 16px; 
          width: 100%; 
        }
        .action-buttons-single .action-btn { 
          max-width: 280px; 
        }
        .btn-icon { 
          font-size: 48px; 
        }
        .btn-text { 
          font-size: 18px; 
          font-weight: 600; 
        }
        .punch-in-btn { 
          background: linear-gradient(135deg, #E69B9B, #E07B7B); 
          color: white; 
        }
        .punch-out-btn { 
          background: linear-gradient(135deg, #A38B8B, #9B6B6B); 
          color: white; 
        }
        .action-btn:hover:not(:disabled) { 
          transform: translateY(-4px); 
          box-shadow: 0 8px 24px rgba(0,0,0,0.15); 
        }
        .action-btn:disabled { 
          opacity: 0.4; 
          cursor: not-allowed; 
        }
        .success-screen { 
          position: fixed; 
          right: 0; 
          top: 0; 
          bottom: 0; 
          width: 50%; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          padding: 64px; 
          text-align: center; 
          animation: slideIn 0.4s ease; 
          z-index: 100; 
        }
        .success-screen.punchin { 
          background: linear-gradient(135deg, #E69B9B, #E07B7B); 
        }
        .success-screen.punchout { 
          background: linear-gradient(135deg, #A38B8B, #9B6B6B); 
        }
        @keyframes slideIn { 
          from { transform: translateX(100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
        .success-icon { 
          width: 120px; 
          height: 120px; 
          border-radius: 50%; 
          border: 5px solid white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 72px; 
          margin-bottom: 32px; 
          animation: scaleIn 0.5s ease 0.2s both; 
        }
        @keyframes scaleIn { 
          from { transform: scale(0); } 
          to { transform: scale(1); } 
        }
        .success-title { 
          font-size: 42px; 
          font-weight: 600; 
          margin-bottom: 16px; 
        }
        .success-subtitle { 
          font-size: 18px; 
          opacity: 0.95; 
          margin-bottom: 32px; 
        }
        .success-message { 
          font-size: 20px; 
          font-weight: 500; 
          margin-bottom: 48px; 
          opacity: 0.95; 
        }
        .success-countdown { 
          font-size: 14px; 
          opacity: 0.8; 
        }
        .calendar { 
          display: flex; 
          flex-direction: column; 
          gap: 16px; 
          position: relative; 
        }
        .calendar-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        .calendar-nav { 
          background: none; 
          border: none; 
          font-size: 20px; 
          cursor: pointer; 
          color: #666; 
          padding: 4px 12px; 
        }
        .calendar-title { 
          font-size: 18px; 
          font-weight: 600; 
          color: #333; 
        }
        .calendar-days-header { 
          display: grid; 
          grid-template-columns: repeat(7, 1fr); 
          gap: 4px; 
          text-align: center; 
        }
        .calendar-day-name { 
          font-size: 12px; 
          font-weight: 600; 
          color: #999; 
          padding: 8px 0; 
        }
        .calendar-grid { 
          display: grid; 
          grid-template-columns: repeat(7, 1fr); 
          gap: 4px; 
        }
        .calendar-day { 
          aspect-ratio: 1; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          font-size: 14px; 
          font-weight: 500; 
          color: #333; 
          border-radius: 8px; 
          position: relative; 
          cursor: pointer; 
          transition: background-color 0.2s; 
        }
        .calendar-day:hover { 
          background-color: #f9f9f9; 
        }
        .calendar-day.empty { 
          background: none; 
          cursor: default; 
        }
        .calendar-day.today { 
          background: #E07B7B; 
          color: white; 
          font-weight: 600; 
        }
        .calendar-day.on-leave { 
          background: #f9f9f9; 
          color: #999; 
          text-decoration: line-through; 
        }
        .day-status-dots { 
          display: flex; 
          gap: 3px; 
          margin-top: 2px; 
        }
        .status-dot { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
        }
        .worked-dot { 
          background-color: #4CAF50; 
        }
        .leave-dot { 
          background-color: #f44336; 
        }
        .day-tooltip { 
          position: fixed; 
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
          padding: 12px; 
          z-index: 1000; 
          min-width: 160px; 
          pointer-events: none; 
        }
        .tooltip-content { 
          text-align: center; 
        }
        .tooltip-date { 
          font-weight: 600; 
          font-size: 14px; 
          margin-bottom: 4px; 
          color: #333; 
        }
        .tooltip-status { 
          font-size: 12px; 
          padding: 2px 6px; 
          border-radius: 4px; 
          display: inline-block; 
          margin-bottom: 6px; 
        }
        .tooltip-status.worked { 
          background: #e8f5e9; 
          color: #2e7d32; 
        }
        .tooltip-status.today { 
          background: #ffe0e0; 
          color: #E07B7B; 
        }
        .tooltip-time { 
          font-size: 11px; 
          color: #666; 
          margin: 2px 0; 
        }
        .tooltip-hours { 
          font-size: 12px; 
          font-weight: 600; 
          color: #333; 
          margin-top: 4px; 
        }
        .tooltip-arrow { 
          position: absolute; 
          bottom: -6px; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent; 
          border-right: 6px solid transparent; 
          border-top: 6px solid white; 
        }
        .calendar-legend { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 12px; 
          margin-top: 16px; 
        }
        .legend-item { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 12px; 
          color: #666; 
        }
        .legend-color { 
          width: 12px; 
          height: 12px; 
          border-radius: 50%; 
        }
        .legend-color.worked-dot { 
          background: #4CAF50; 
        }
        .legend-color.leave-dot { 
          background: #f44336; 
        }
        .legend-color.today { 
          background: #E07B7B; 
        }

        /* Mobile Styles */
        .mobile-container {
          width: 100%;
          min-height: 100vh;
          background: #f5f5f5;
        }
        
        .mobile-header {
          background: white;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .mobile-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .mobile-date-time {
          flex: 1;
        }
        
        .mobile-date-day {
          font-size: 14px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .mobile-date {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }
        
        .mobile-time {
          font-size: 20px;
          font-weight: 300;
          color: #333;
        }
        
        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .mobile-user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E69B9B, #E07B7B);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .mobile-user-details {
          display: flex;
          flex-direction: column;
        }
        
        .mobile-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .mobile-user-email {
          font-size: 11px;
          color: #999;
        }
        
        .mobile-monthly-stats {
          background: linear-gradient(135deg, #E69B9B, #E07B7B);
          padding: 12px;
          border-radius: 10px;
          color: white;
        }
        
        .mobile-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        
        .mobile-stat-item {
          background: rgba(255,255,255,0.15);
          padding: 8px;
          border-radius: 6px;
          text-align: center;
        }
        
        .mobile-stat-label {
          font-size: 9px;
          opacity: 0.9;
          margin-bottom: 2px;
          white-space: nowrap;
        }
        
        .mobile-stat-value {
          font-size: 16px;
          font-weight: 600;
        }
        
        .mobile-main-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .mobile-action-section {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        
        .mobile-action-screen {
          text-align: center;
          width: 100%;
        }
        
        .mobile-check-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid #E07B7B;
          color: #E07B7B;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 16px;
        }
        
        .mobile-action-title {
          font-size: 22px;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
        }
        
        .mobile-action-subtitle {
          font-size: 14px;
          color: #999;
          margin-bottom: 20px;
        }
        
        .mobile-summary-box {
          background: #f9f9f9;
          padding: 16px;
          margin: 16px 0;
          border-radius: 12px;
          text-align: left;
        }
        
        .mobile-summary-box p {
          font-size: 14px;
          color: #444;
          margin: 6px 0;
          font-weight: 500;
        }
        
        .mobile-summary-box b {
          color: #222;
          font-weight: 600;
        }
        
        .mobile-action-buttons-single {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        
        .mobile-action-btn {
          padding: 32px 24px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 300px;
        }
        
        .mobile-btn-icon {
          font-size: 36px;
        }
        
        .mobile-btn-text {
          font-size: 16px;
          font-weight: 600;
        }
        
        .mobile-today-summary {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        
        .mobile-summary-title {
          font-size: 14px;
          color: #999;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        .mobile-summary-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .mobile-stat-box {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 10px;
          text-align: center;
        }
        
        .mobile-stat-box-label {
          font-size: 11px;
          color: #999;
          margin-bottom: 6px;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .mobile-stat-box-value {
          font-size: 20px;
          font-weight: 600;
        }
        
        .mobile-stat-box-value.worked {
          color: #E07B7B;
        }
        
        .mobile-stat-box-value.out-time {
          color: #9B6B6B;
        }
        
        .mobile-calendar-section {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        
        .mobile-calendar-container {
          position: relative;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .content-wrapper {
            flex-direction: column;
            gap: 24px;
          }
          
          .calendar-section {
            flex: 0 0 auto;
          }
          
          .calendar-container {
            max-width: 100%;
          }
          
          .mobile-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          
          .mobile-stat-item {
            padding: 10px;
          }
        }

        @media (max-width: 768px) {
          .attendance-container {
            flex-direction: column;
          }
          
          .sidebar {
            width: 100%;
            padding: 16px;
            box-shadow: none;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .main-content {
            padding: 16px;
          }
          
          .content-wrapper {
            gap: 20px;
          }
          
          .action-btn {
            padding: 32px 24px;
          }
          
          .btn-icon {
            font-size: 36px;
          }
          
          .btn-text {
            font-size: 16px;
          }
          
          .calendar-title {
            font-size: 16px;
          }
          
          .calendar-day {
            font-size: 13px;
          }
          
          .day-status-dots {
            margin-top: 1px;
          }
          
          .status-dot {
            width: 5px;
            height: 5px;
          }
          
          .success-screen {
            width: 100%;
            padding: 32px;
          }
          
          .success-icon {
            width: 80px;
            height: 80px;
            font-size: 48px;
          }
          
          .success-title {
            font-size: 28px;
          }
          
          .success-message {
            font-size: 16px;
          }
          
          .mobile-header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .mobile-user-info {
            width: 100%;
            justify-content: space-between;
          }
          
          .mobile-stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .mobile-stat-label {
            font-size: 8px;
          }
          
          .mobile-stat-value {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .summary-stats-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .stat-box {
            padding: 12px;
          }
          
          .calendar-grid {
            gap: 2px;
          }
          
          .calendar-day {
            border-radius: 4px;
          }
          
          .action-screen {
            max-width: 100%;
          }
          
          .action-buttons-single .action-btn {
            max-width: 100%;
          }
          
          .mobile-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .mobile-summary-stats-grid {
            grid-template-columns: 1fr;
          }
          
          .mobile-action-btn {
            padding: 24px 20px;
          }
          
          .mobile-btn-icon {
            font-size: 32px;
          }
          
          .mobile-btn-text {
            font-size: 14px;
          }
          
          .mobile-action-title {
            font-size: 20px;
          }
          
          .calendar-day-name {
            font-size: 11px;
          }
          
          .calendar-day {
            font-size: 12px;
          }
        }

        @media (max-width: 360px) {
          .mobile-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .mobile-stat-item {
            padding: 6px;
          }
          
          .mobile-stat-label {
            font-size: 7px;
          }
          
          .mobile-stat-value {
            font-size: 12px;
          }
          
          .calendar-grid {
            gap: 1px;
          }
          
          .calendar-day {
            font-size: 11px;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .day-tooltip {
            display: none !important;
          }
          
          .calendar-day {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default PunchInPunchOut;