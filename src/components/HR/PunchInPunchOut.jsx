import React, { useState, useEffect } from 'react';
import api from '../../api/client'; // Import the configured axios client

const PunchInPunchOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successType, setSuccessType] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [todayStatus, setTodayStatus] = useState({ 
    punch_records: [], 
    total_working_hours: 0
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
  const [myRecords, setMyRecords] = useState([]);
  const [calendarSummary, setCalendarSummary] = useState({});
  const [lastPunchTime, setLastPunchTime] = useState(null);

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
    fetchMyRecords();
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

  const fetchMyRecords = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await api.get(`/hr/attendance/my_records/?month=${month}&year=${year}`);
      
      if (response.data) {
        const records = response.data.results || response.data || [];
        setMyRecords(records);
        
        // Process records for calendar summary
        const summary = {};
        records.forEach(record => {
          const date = new Date(record.date || record.punch_time);
          const day = date.getDate();
          
          if (!summary[day]) {
            summary[day] = {
              total_hours: 0,
              punch_ins: [],
              punch_outs: [],
              status: 'absent'
            };
          }
          
          if (record.punch_type === 'in') {
            summary[day].punch_ins.push(new Date(record.punch_time));
            if (summary[day].punch_ins.length === 1) {
              summary[day].first_punch_in = new Date(record.punch_time);
            }
          } else if (record.punch_type === 'out') {
            summary[day].punch_outs.push(new Date(record.punch_time));
            if (summary[day].punch_outs.length > 0) {
              summary[day].last_punch_out = new Date(record.punch_time);
            }
          }
          
          // Calculate total hours for the day
          if (record.total_hours) {
            summary[day].total_hours = parseFloat(record.total_hours);
          }
          
          // Determine status
          if (summary[day].punch_ins.length > 0 || summary[day].total_hours > 0) {
            summary[day].status = 'worked';
          }
        });
        
        setCalendarSummary(summary);
      }
    } catch (error) {
      console.error('Error fetching my records:', error);
      setMyRecords([]);
      setCalendarSummary({});
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/hr/attendance/today_status/');
      if (response.data) {
        const punchRecords = response.data.punch_records || [];
        
        setTodayStatus({ 
          punch_records: punchRecords,
          total_working_hours: response.data.total_working_hours || 0
        });
        
        // Check if user is currently punched in (last punch is IN)
        if (punchRecords.length > 0) {
          const lastPunch = punchRecords[punchRecords.length - 1];
          setIsCurrentlyPunchedIn(lastPunch.punch_type === 'in');
          
          // Set last punch time
          if (lastPunch.punch_time) {
            setLastPunchTime(new Date(lastPunch.punch_time));
          }
        } else {
          setIsCurrentlyPunchedIn(false);
          setLastPunchTime(null);
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

  const calculateTimeSinceLastPunch = () => {
    if (!lastPunchTime || !isCurrentlyPunchedIn) return null;
    
    const now = new Date();
    const diffMs = now - lastPunchTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { hours: diffHours, minutes: diffMinutes, seconds: diffSeconds };
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
      setLastPunchTime(new Date());
      await fetchTodayAttendance();
      await fetchMonthlySummary();
      await fetchMyRecords();
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
      setLastPunchTime(null);
      await fetchTodayAttendance();
      await fetchMonthlySummary();
      await fetchMyRecords();
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

  const getDaySummary = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayKey = day;
    
    // Check if on leave first
    if (isDateOnLeave(new Date(date))) {
      return {
        status: 'leave',
        worked: false,
        firstPunchIn: null,
        lastPunchOut: null,
        totalHours: 0
      };
    }
    
    // Check calendar summary from my_records API
    if (calendarSummary[dayKey]) {
      const summary = calendarSummary[dayKey];
      return {
        status: summary.status,
        worked: summary.status === 'worked',
        firstPunchIn: summary.first_punch_in || null,
        lastPunchOut: summary.last_punch_out || null,
        totalHours: summary.total_hours || 0,
        punchIns: summary.punch_ins || [],
        punchOuts: summary.punch_outs || []
      };
    }
    
    // Fallback to attendance history
    if (attendanceHistory[dayKey]) {
      const records = attendanceHistory[dayKey].punch_records;
      const inRecords = records.filter(r => r.punch_type === 'in');
      const outRecords = records.filter(r => r.punch_type === 'out');
      
      return {
        status: attendanceHistory[dayKey].worked ? 'worked' : 'absent',
        worked: attendanceHistory[dayKey].worked,
        firstPunchIn: inRecords.length > 0 ? new Date(inRecords[0].punch_time) : null,
        lastPunchOut: outRecords.length > 0 ? new Date(outRecords[outRecords.length - 1].punch_time) : null,
        totalHours: attendanceHistory[dayKey].total_hours || 0
      };
    }
    
    // Check if it's a future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date > today) {
      return { status: 'future', worked: false, firstPunchIn: null, lastPunchOut: null, totalHours: 0 };
    }
    
    return { status: 'absent', worked: false, firstPunchIn: null, lastPunchOut: null, totalHours: 0 };
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
      const daySummary = getDaySummary(day);
      const { status, worked } = daySummary;
      
      let dayClass = `calendar-day ${isToday ? 'today' : ''}`;
      if (status === 'leave') dayClass += ' on-leave';
      if (status === 'worked') dayClass += ' worked-day';
      if (status === 'absent') dayClass += ' absent-day';
      if (status === 'future') dayClass += ' future-day';
      
      days.push(
        <div 
          key={day} 
          className={dayClass}
          onMouseEnter={(e) => handleDayHover(e, day)}
          onMouseLeave={() => setHoveredDay(null)}
          onClick={() => setHoveredDay(hoveredDay === day ? null : day)}
        >
          {day}
          <div className="day-status-dots">
            {status === 'worked' && <div className="status-dot worked-dot" title="Worked"></div>}
            {status === 'leave' && <div className="status-dot leave-dot" title="On Leave"></div>}
            {status === 'absent' && <div className="status-dot absent-dot" title="Absent"></div>}
            {status === 'future' && <div className="status-dot future-dot" title="Future Date"></div>}
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
        
        <div className="calendar-summary-stats">
          <div className="summary-stat-item">
            <div className="summary-stat-label">Worked Days</div>
            <div className="summary-stat-value">
              {Object.values(calendarSummary).filter(s => s.status === 'worked').length}
            </div>
          </div>
          <div className="summary-stat-item">
            <div className="summary-stat-label">Total Hours</div>
            <div className="summary-stat-value">
              {Object.values(calendarSummary).reduce((total, s) => total + (s.total_hours || 0), 0).toFixed(1)}h
            </div>
          </div>
          <div className="summary-stat-item">
            <div className="summary-stat-label">Leave Days</div>
            <div className="summary-stat-value">
              {Object.values(calendarSummary).filter(s => s.status === 'leave').length}
            </div>
          </div>
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
                const daySummary = getDaySummary(hoveredDay);
                const { status, firstPunchIn, lastPunchOut, totalHours, punchIns, punchOuts } = daySummary;
                
                if (status === 'leave') {
                  return <div className="tooltip-status leave">On Leave</div>;
                } else if (status === 'worked') {
                  return (
                    <>
                      <div className="tooltip-status worked">Worked - {formatHoursMinutes(totalHours)}</div>
                      {firstPunchIn && (
                        <div className="tooltip-time">First In: {formatTime(firstPunchIn)}</div>
                      )}
                      {lastPunchOut && (
                        <div className="tooltip-time">Last Out: {formatTime(lastPunchOut)}</div>
                      )}
                      {punchIns && punchIns.length > 0 && (
                        <div className="tooltip-detail">
                          <div className="tooltip-detail-label">Punch Ins:</div>
                          <div className="tooltip-detail-times">
                            {punchIns.slice(0, 3).map((time, idx) => (
                              <div key={idx} className="tooltip-detail-time">{formatTime(time)}</div>
                            ))}
                            {punchIns.length > 3 && <div className="tooltip-detail-time">+{punchIns.length - 3} more</div>}
                          </div>
                        </div>
                      )}
                      {totalHours > 0 && (
                        <div className="tooltip-hours">Total Hours: {formatHoursMinutes(totalHours)}</div>
                      )}
                    </>
                  );
                } else if (status === 'absent') {
                  return <div className="tooltip-status absent">Absent</div>;
                } else if (status === 'future') {
                  return <div className="tooltip-status future">Future Date</div>;
                }
              })()}
            </div>
            <div className="tooltip-arrow"></div>
          </div>
        )}
        
        {/* <div className="calendar-legend">
          <div className="legend-item"><div className="legend-color worked-dot"></div><span>Worked</span></div>
          <div className="legend-item"><div className="legend-color leave-dot"></div><span>Leave</span></div>
          <div className="legend-item"><div className="legend-color absent-dot"></div><span>Absent</span></div>
          <div className="legend-item"><div className="legend-color today"></div><span>Today</span></div>
        </div> */}
      </div>
    );
  };

  const renderTodayPunchRecords = () => {
    if (!todayStatus.punch_records || todayStatus.punch_records.length === 0) {
      return <p style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>No punch records yet</p>;
    }

    return (
      <div className="punch-records-list">
        {todayStatus.punch_records.map((record, index) => (
          <div key={index} className="punch-record-item">
            <div className={`punch-record-type ${record.punch_type}`}>
              {record.punch_type === 'in' ? '👆 IN' : '👇 OUT'}
            </div>
            <div className="punch-record-time">
              {formatTime(new Date(record.punch_time))}
            </div>
            <div className="punch-record-note">
              {record.note || ''}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCurrentSessionTimer = () => {
    if (!isCurrentlyPunchedIn || !lastPunchTime) return null;
    
    const timeSince = calculateTimeSinceLastPunch();
    if (!timeSince) return null;
    
    return (
      <div className="current-session-timer">
        <div className="timer-label">Current Session:</div>
        <div className="timer-display">
          {String(timeSince.hours).padStart(2, '0')}:
          {String(timeSince.minutes).padStart(2, '0')}:
          {String(timeSince.seconds).padStart(2, '0')}
        </div>
        <div className="timer-note">Since {formatTime(lastPunchTime)}</div>
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
                <div className="stat-box-label">Worked Hours</div>
                <div className="stat-box-value worked">
                  {formatHoursMinutes(todayStatus.total_working_hours || 0)}
                </div>
              </div>
              {isCurrentlyPunchedIn && (
                <div className="stat-box">
                  <div className="stat-box-label">Current Session</div>
                  <div className="stat-box-value session-timer">
                    {(() => {
                      const timeSince = calculateTimeSinceLastPunch();
                      return timeSince ? 
                        `${String(timeSince.hours).padStart(2, '0')}:${String(timeSince.minutes).padStart(2, '0')}` : 
                        '00:00';
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="summary-section">
            <div className="summary-title">Today's Punches</div>
            {renderTodayPunchRecords()}
            {renderCurrentSessionTimer()}
          </div>
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
  <div className="action-screen">

    <div className="action-top">
      {!isCurrentlyPunchedIn ? (
        <>
          <h2 className="action-title">Ready to punch in?</h2>

          {lastPunchTime && (
            <div className="last-punch-info">
              Last punch out: {formatTime(lastPunchTime)}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="check-icon">✓</div>
          <h2 className="action-title">You are punched in</h2>
          <div className="action-subtitle">to {branch}</div>

          <div className="session-timer-display">
            <div className="timer-large">
              {(() => {
                const t = calculateTimeSinceLastPunch();
                return t
                  ? `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}:${String(t.seconds).padStart(2, '0')}`
                  : '00:00:00';
              })()}
            </div>
            <div className="timer-note">
              Since {formatTime(lastPunchTime)}
            </div>
          </div>
        </>
      )}

      {/* ✅ BUTTON ALWAYS CLOSE TO TEXT */}
      <div className="action-buttons-single">
        {!isCurrentlyPunchedIn ? (
          <button
            className="action-btn punch-in-btn"
            onClick={handlePunchIn}
            disabled={loading}
          >
            <div className="btn-icon">👆</div>
            <div className="btn-text">
              {loading ? "Processing..." : "Punch In"}
            </div>
          </button>
        ) : (
          <button
            className="action-btn punch-out-btn"
            onClick={handlePunchOut}
            disabled={loading}
          >
            <div className="btn-icon">👇</div>
            <div className="btn-text">
              {loading ? "Processing..." : "Punch Out"}
            </div>
          </button>
        )}
      </div>
    </div>

  </div>
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
                  {lastPunchTime && (
                    <div className="mobile-last-punch-info">
                      <p>Last punch out: {formatTime(lastPunchTime)}</p>
                    </div>
                  )}
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
                  
                  <div className="mobile-session-timer-display">
                    <div className="mobile-timer-title">Current Session:</div>
                    <div className="mobile-timer-large">
                      {(() => {
                        const timeSince = calculateTimeSinceLastPunch();
                        return timeSince ? 
                          `${String(timeSince.hours).padStart(2, '0')}:${String(timeSince.minutes).padStart(2, '0')}` : 
                          '00:00';
                      })()}
                    </div>
                    <div className="mobile-timer-note">Since {formatTime(lastPunchTime)}</div>
                  </div>
                  
                  <div className="mobile-summary-box">
                    <p><b>Total Today:</b> {formatHoursMinutes(todayStatus.total_working_hours || 0)}</p>
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
                  <div className="mobile-stat-box-label">Worked Hours</div>
                  <div className="mobile-stat-box-value worked">
                    {formatHoursMinutes(todayStatus.total_working_hours || 0)}
                  </div>
                </div>
                {isCurrentlyPunchedIn && (
                  <div className="mobile-stat-box">
                    <div className="mobile-stat-box-label">Current Session</div>
                    <div className="mobile-stat-box-value session-timer">
                      {(() => {
                        const timeSince = calculateTimeSinceLastPunch();
                        return timeSince ? 
                          `${String(timeSince.hours).padStart(2, '0')}:${String(timeSince.minutes).padStart(2, '0')}` : 
                          '00:00';
                      })()}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mobile-punch-records-section">
                <div className="mobile-summary-title">Today's Punches</div>
                {renderTodayPunchRecords()}
                {isCurrentlyPunchedIn && lastPunchTime && (
                  <div className="mobile-current-session">
                    <div className="mobile-session-label">Current Session:</div>
                    <div className="mobile-session-time">
                      {(() => {
                        const timeSince = calculateTimeSinceLastPunch();
                        return timeSince ? 
                          `${String(timeSince.hours).padStart(2, '0')}:${String(timeSince.minutes).padStart(2, '0')}:${String(timeSince.seconds).padStart(2, '0')}` : 
                          '00:00:00';
                      })()}
                    </div>
                  </div>
                )}
              </div>
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
        .stat-box-value.session-timer { 
          color: #4CAF50; 
          font-family: monospace; 
          font-size: 20px; 
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
          flex: 0 0 450px; 
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
        width: 100%;
        max-width: 520px;
        min-height: 360px;      /* keeps layout stable */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center; /* center everything */
        text-align: center;
      }
        .action-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.action-buttons-single {
  margin-top: 24px; /* 👈 keeps button close */
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
        .last-punch-info { 
          margin: 10px 0 20px; 
          color: #666; 
          font-size: 14px; 
        }
        .session-timer-display { 
          background: linear-gradient(135deg, #f0f9f0, #e8f5e9); 
          padding: 20px; 
          border-radius: 14px; 
          margin: 20px 0; 
          border: 2px solid #4CAF50; 
        }
        .timer-title { 
          font-size: 14px; 
          color: #2e7d32; 
          margin-bottom: 8px; 
          font-weight: 600; 
        }
        .timer-large { 
          font-size: 36px; 
          font-weight: 700; 
          color: #2e7d32; 
          font-family: monospace; 
          margin-bottom: 6px; 
        }
        .timer-note { 
          font-size: 12px; 
          color: #666; 
        }
        .action-buttons-single { 
          display: flex; 
          justify-content: center; 
        }
       .action-btn {
        background: linear-gradient(135deg, #f2a1a1, #e98181);
        border: none;
        border-radius: 18px;

        width: 280px;       /* ✅ NORMAL WIDTH */
        height: 160px;      /* ✅ NORMAL HEIGHT */

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

        .action-buttons-single .action-btn { 
         max-width: 360px;
        
        
        }
        .btn-icon {
        font-size: 30px;  /* was too big before */
        margin-bottom: 6px;
      }

      .btn-text {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
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
          animation: slideIn 0.2s ease; 
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
          margin-bottom: 16px; 
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
        .calendar-summary-stats { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 8px; 
          margin-bottom: 16px; 
          padding: 12px; 
          background: #f9f9f9; 
          border-radius: 10px; 
        }
        .summary-stat-item { 
          text-align: center; 
        }
        .summary-stat-label { 
          font-size: 11px; 
          color: #666; 
          margin-bottom: 4px; 
          font-weight: 600; 
        }
        .summary-stat-value { 
          font-size: 16px; 
          font-weight: 600; 
          color: #E07B7B; 
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
          border: 1px solid transparent; 
        }
        .calendar-day:hover { 
          background-color: #f9f9f9; 
          border-color: #E07B7B; 
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
          background: #ffe0e0; 
          color: #999; 
          text-decoration: line-through; 
        }
        .calendar-day.worked-day { 
          background: #f0f9f0; 
        }
        .calendar-day.absent-day { 
          background: #f9f9f9; 
          color: #ccc; 
        }
        .calendar-day.future-day { 
          background: #f9f9f9; 
          color: #999; 
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
        .absent-dot { 
          background-color: #ccc; 
        }
        .future-dot { 
          background-color: #999; 
        }
        .day-tooltip { 
          position: fixed; 
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
          padding: 12px; 
          z-index: 1000; 
          min-width: 180px; 
          pointer-events: none; 
        }
        .tooltip-content { 
          text-align: center; 
        }
        .tooltip-date { 
          font-weight: 600; 
          font-size: 14px; 
          margin-bottom: 8px; 
          color: #333; 
          padding-bottom: 4px; 
          border-bottom: 1px solid #f0f0f0; 
        }
        .tooltip-status { 
          font-size: 12px; 
          padding: 4px 8px; 
          border-radius: 4px; 
          display: inline-block; 
          margin-bottom: 8px; 
          font-weight: 600; 
        }
        .tooltip-status.worked { 
          background: #e8f5e9; 
          color: #2e7d32; 
        }
        .tooltip-status.leave { 
          background: #ffebee; 
          color: #c62828; 
        }
        .tooltip-status.absent { 
          background: #f5f5f5; 
          color: #757575; 
        }
        .tooltip-status.future { 
          background: #f5f5f5; 
          color: #9e9e9e; 
        }
        .tooltip-status.today { 
          background: #ffe0e0; 
          color: #E07B7B; 
        }
        .tooltip-time { 
          font-size: 11px; 
          color: #666; 
          margin: 3px 0; 
        }
        .tooltip-hours { 
          font-size: 12px; 
          font-weight: 600; 
          color: #333; 
          margin-top: 6px; 
          padding-top: 4px; 
          border-top: 1px solid #f0f0f0; 
        }
        .tooltip-detail { 
          margin-top: 6px; 
          padding-top: 4px; 
          border-top: 1px solid #f0f0f0; 
        }
        .tooltip-detail-label { 
          font-size: 10px; 
          color: #999; 
          margin-bottom: 2px; 
        }
        .tooltip-detail-times { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 4px; 
          justify-content: center; 
        }
        .tooltip-detail-time { 
          font-size: 10px; 
          background: #f5f5f5; 
          padding: 2px 4px; 
          border-radius: 3px; 
          color: #666; 
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
        .legend-color.absent-dot { 
          background: #ccc; 
        }
        .legend-color.today { 
          background: #E07B7B; 
        }

        /* Punch Records Styling */
        .punch-records-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .punch-record-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #f9f9f9;
          border-radius: 8px;
          border-left: 4px solid #E07B7B;
        }
        
        .punch-record-item:nth-child(even) {
          border-left-color: #A38B8B;
        }
        
        .punch-record-type {
          font-weight: 600;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(224, 123, 123, 0.1);
        }
        
        .punch-record-type.in {
          color: #E07B7B;
        }
        
        .punch-record-type.out {
          color: #A38B8B;
        }
        
        .punch-record-time {
          font-family: monospace;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }
        
        .punch-record-note {
          font-size: 11px;
          color: #999;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .current-session-timer {
          margin-top: 16px;
          padding: 12px;
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          border-radius: 8px;
          text-align: center;
          border: 1px solid #4CAF50;
        }
        
        .timer-label {
          font-size: 12px;
          color: #2e7d32;
          margin-bottom: 4px;
          font-weight: 600;
        }
        
        .timer-display {
          font-family: monospace;
          font-size: 20px;
          font-weight: 700;
          color: #2e7d32;
          margin-bottom: 4px;
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
        
        .mobile-last-punch-info {
          margin: 10px 0 15px;
          color: #666;
          font-size: 13px;
        }
        
        .mobile-session-timer-display {
          background: linear-gradient(135deg, #f0f9f0, #e8f5e9);
          padding: 16px;
          border-radius: 12px;
          margin: 16px 0;
          border: 2px solid #4CAF50;
        }
        
        .mobile-timer-title {
          font-size: 13px;
          color: #2e7d32;
          margin-bottom: 6px;
          font-weight: 600;
        }
        
        .mobile-timer-large {
          font-size: 28px;
          font-weight: 700;
          color: #2e7d32;
          font-family: monospace;
          margin-bottom: 4px;
        }
        
        .mobile-timer-note {
          font-size: 11px;
          color: #666;
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
        
        .mobile-stat-box-value.session-timer {
          color: #4CAF50;
          font-family: monospace;
          font-size: 18px;
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
        
        .mobile-current-session {
          margin-top: 16px;
          padding: 12px;
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          border-radius: 8px;
          text-align: center;
          border: 1px solid #4CAF50;
        }
        
        .mobile-session-label {
          font-size: 12px;
          color: #2e7d32;
          margin-bottom: 4px;
          font-weight: 600;
        }
        
        .mobile-session-time {
          font-family: monospace;
          font-size: 18px;
          font-weight: 700;
          color: #2e7d32;
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
          
          .summary-stats-grid {
            grid-template-columns: 1fr;
          }
          
          .mobile-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          
          .mobile-stat-item {
            padding: 10px;
          }
          
          .mobile-summary-stats-grid {
            grid-template-columns: 1fr;
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
          
          .punch-record-item {
            padding: 8px 10px;
          }
          
          .punch-record-time {
            font-size: 13px;
          }
          
          .punch-record-note {
            display: none;
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
          
          .calendar-summary-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            padding: 8px;
          }
          
          .summary-stat-label {
            font-size: 9px;
          }
          
          .summary-stat-value {
            font-size: 14px;
          }
          
          .timer-large {
            font-size: 28px;
          }
          
          .mobile-timer-large {
            font-size: 24px;
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
          
          .calendar-summary-stats {
            grid-template-columns: 1fr;
            gap: 4px;
          }
          
          .timer-large {
            font-size: 24px;
          }
          
          .mobile-timer-large {
            font-size: 20px;
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