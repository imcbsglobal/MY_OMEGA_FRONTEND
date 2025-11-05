// src/components/PunchinPunchout.jsx
import React, { useState, useEffect } from "react";
import {
  getTodayStatus as apiGetTodayStatus,
  punchIn as apiPunchIn,
  punchOut as apiPunchOut,
  default as hrApi
} from "../../services/api";
import "./PunchinPunchout.scss";

const PunchinPunchout = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 3500);
  };

  // Fetch today's attendance using exported helper
  // inside PunchinPunchout.jsx - replace fetchTodayStatus with this
const fetchTodayStatus = async () => {
  try {
    const data = await apiGetTodayStatus(); // expected: either attendance object or { message, date }
    // normalize response:
    if (!data) {
      setTodayStatus(null);
      return;
    }

    // If API returned "No attendance record for today" style object
    if (data.message && !data.id) {
      setTodayStatus(null);
      return;
    }

    // If we got an attendance object (serializer fields)
    const att = data;
    setTodayStatus({
      id: att.id,
      punchIn: att.punch_in_time
        ? new Date(att.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : null,
      punchOut: att.punch_out_time
        ? new Date(att.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : null,
      punchInLocation: att.punch_in_location,
      punchOutLocation: att.punch_out_location,
      workingHours: att.working_hours || 0,
      status: att.status_display || att.status,
      verificationStatus: att.verification_status_display || att.verification_status,
    });
  } catch (err) {
    console.error("fetchTodayStatus error:", err);
    // If API returned 404/204 with no body, treat as no record
    if (err?.response?.status === 404 || err?.response?.status === 204) {
      setTodayStatus(null);
      return;
    }
    showError(err?.response?.data?.detail || err?.message || "Failed to load today's status");
  }
};


  // Load month summary and day-by-day list using hrApi (axios instance) already configured in api.js
  const loadAttendanceRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // summary endpoint
      const summaryRes = await hrApi.get("/attendance/summary/", { params: { month, year } });
      setMonthlySummary(summaryRes.data);

      // attendance list for month
      const listRes = await hrApi.get("/attendance/", { params: { month, year } });
      // api.js unwrap returns .data when using helper but here we used hrApi directly so handle .data
      const raw = Array.isArray(listRes.data) ? listRes.data : (listRes.data.results || []);
      const mapped = raw.map((att) => {
        const dateStr = att.date;
        const day = dateStr ? new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" }) : "";
        return {
          date: dateStr,
          day,
          status: att.status_display || att.status || "Not Marked",
          punchIn: att.punch_in_time
            ? new Date(att.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--:--",
          punchOut: att.punch_out_time
            ? new Date(att.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--:--",
          verificationStatus: att.verification_status_display || att.verification_status || "",
          raw: att,
        };
      });

      setAttendanceRecords(mapped);
    } catch (err) {
      console.error("loadAttendanceRecords error:", err);
      // if err is axios error, it may have err.response.data; fallback to message
      const msg = err?.response?.data?.detail || err?.message || "Failed to load attendance records";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Punch in uses helper in api.js which already attaches auth & handles refresh
  const handlePunchIn = async () => {
    setLoading(true);
    try {
      const payload = {
        location: "Office Entrance", // replace with geolocation if required
        latitude: 0.0,
        longitude: 0.0,
        note: "",
      };
      await apiPunchIn(payload);
      // refresh local data
      await fetchTodayStatus();
      await loadAttendanceRecords();
    } catch (err) {
      console.error("handlePunchIn", err);
      showError(err?.message || "Punch in failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setLoading(true);
    try {
      const payload = {
        location: "Office Exit",
        latitude: 0.0,
        longitude: 0.0,
        note: "",
      };
      await apiPunchOut(payload);
      await fetchTodayStatus();
      await loadAttendanceRecords();
    } catch (err) {
      console.error("handlePunchOut", err);
      showError(err?.message || "Punch out failed");
    } finally {
      setLoading(false);
    }
  };

  // Initial load and whenever month/year changes
  useEffect(() => {
    fetchTodayStatus();
    loadAttendanceRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // Render
  return (
    <div className="attendance-container">
      <h2>My Attendance Records</h2>

      {error && <div className="error-message">{error}</div>}

      <section className="today-card">
        <h3>Today's Summary</h3>
        {todayStatus ? (
          <div className="today-details">
            <div><strong>Punch In:</strong> {todayStatus.punchIn || "--:--"}</div>
            <div><strong>Punch Out:</strong> {todayStatus.punchOut || "--:--"}</div>
            <div><strong>Working Hours:</strong> {Number(todayStatus.workingHours || 0).toFixed(2)} hrs</div>
            <div><strong>Status:</strong> {todayStatus.status || "Not Marked"}</div>
            <div><strong>Verification:</strong> {todayStatus.verificationStatus || "Pending"}</div>
          </div>
        ) : (
          <div>No record for today.</div>
        )}

        <div className="actions">
          {!todayStatus?.punchIn && (
            <button onClick={handlePunchIn} disabled={loading}>
              Punch In
            </button>
          )}
          {todayStatus?.punchIn && !todayStatus?.punchOut && (
            <button onClick={handlePunchOut} disabled={loading}>
              Punch Out
            </button>
          )}
        </div>
      </section>

      {monthlySummary && (
        <section className="monthly-summary">
          <h3>
            {new Date(currentDate.getFullYear(), currentDate.getMonth()).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}{" "}
            Summary
          </h3>
          <div className="summary-grid">
            <div>Total Days: {monthlySummary.total_days}</div>
            <div>Verified Full Days: {monthlySummary.verified_full_days}</div>
            <div>Full (Unverified): {monthlySummary.full_days_unverified}</div>
            <div>Verified Half Days: {monthlySummary.verified_half_days}</div>
            <div>Half (Unverified): {monthlySummary.half_days_unverified}</div>
            <div>Leaves: {monthlySummary.leaves}</div>
            <div>Holidays: {monthlySummary.holidays}</div>
            <div>Not Marked: {monthlySummary.not_marked}</div>
            <div>Total Working Hours: {parseFloat(monthlySummary.total_working_hours || 0).toFixed(2)} hrs</div>
          </div>
        </section>
      )}

      <section className="attendance-table">
        <h3>Daily Attendance</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((rec, idx) => (
                  <tr key={idx}>
                    <td>{rec.date}</td>
                    <td>{rec.day}</td>
                    <td>{rec.status}</td>
                    <td>{rec.punchIn}</td>
                    <td>{rec.punchOut}</td>
                    <td>{rec.verificationStatus}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No records found for this month.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default PunchinPunchout;
