// src/components/Base_Template/Dashboard.jsx - UPDATED WITH REAL API INTEGRATION

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Icons (inline SVG helpers) ─────────────────────────────────────────────
const IconEmployees = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconPresent = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconOnLeave = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconAbsent = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconPending = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconDoc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

// ─── API Configuration ──────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000/api";

async function apiFetch(path) {
  const token = localStorage.getItem("accessToken") || "";
  
  try {
    const url = `${API_BASE}${path}`;
    console.log(`📡 Fetching: ${url}`);
    
    const res = await fetch(url, {
      headers: { 
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
    });
    
    console.log(`📡 API ${path} → Status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ API Error ${path}:`, res.status, errorText);
      return null;
    }
    
    const data = await res.json();
    console.log(`✅ API ${path} returned data`);
    return data;
  } catch (err) {
    console.error(`❌ Fetch error for ${path}:`, err);
    return null;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function buildMonthlyHiringData(employees) {
  // Group employees by joining month for the chart
  const counts = {};
  
  employees.forEach((emp) => {
    // Try multiple field paths for joining date
    const doj = emp.date_of_joining || 
                emp.joining_date ||
                (emp.job_info && emp.job_info.date_of_joining);
    
    if (!doj) return;
    const d = new Date(doj);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  // Generate last 12 months
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    months.push({ month: labels[d.getMonth()], value: counts[key] || 0 });
  }
  return months;
}

// ─── Custom Tooltip for chart ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
        padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,.12)", fontSize: 13
      }}>
        <p style={{ margin: 0, color: "#64748b", fontWeight: 600 }}>{label}</p>
        <p style={{ margin: "2px 0 0", color: "#dc2626", fontWeight: 700 }}>
          New Hires: <span>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ── state ──────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        console.log("🚀 Starting dashboard data fetch...");

        // 1. Fetch Users from User API
        console.log("📊 Fetching users...");
        const usersData = await apiFetch("/user-controll/admin/users/");
        const allUsers = Array.isArray(usersData) ? usersData : (usersData?.results || []);
        const totalUsers = allUsers.length;
        console.log(`✅ Found ${totalUsers} users`);

        // 2. Fetch Employees from Employee Management API
        console.log("📊 Fetching employees...");
        const employeesData = await apiFetch("/employee-management/employees/");
        const allEmployees = Array.isArray(employeesData) ? employeesData : (employeesData?.results || []);
        const totalEmployees = allEmployees.length;
        console.log(`✅ Found ${totalEmployees} employees`);

        // Build chart data from employees
        const monthlyData = buildMonthlyHiringData(allEmployees);
        setChartData(monthlyData);

        // 3. Fetch Attendance Summary from HR API
        console.log("📊 Fetching attendance summary...");
        const attendanceSummary = await apiFetch("/hr/attendance/summary-all/");
        console.log("📊 Attendance Summary Response:", attendanceSummary);

        let presentToday = 0;
        let onLeaveToday = 0;
        let absentToday = 0;

        if (attendanceSummary && Array.isArray(attendanceSummary)) {
          // Process the summary data
          attendanceSummary.forEach((summary) => {
            const status = (summary.status || "").toLowerCase();
            const count = summary.count || 0;

            if (status === "present" || status === "half_day") {
              presentToday += count;
            } else if (status.includes("leave") || status === "on_leave") {
              onLeaveToday += count;
            } else if (status === "absent") {
              absentToday += count;
            }
          });
        } else if (attendanceSummary) {
          // If it's an object with direct counts
          presentToday = attendanceSummary.present || attendanceSummary.present_count || 0;
          onLeaveToday = attendanceSummary.on_leave || attendanceSummary.leave_count || 0;
          absentToday = attendanceSummary.absent || attendanceSummary.absent_count || 0;
        }

        // Calculate absent if not provided (total employees - present - on leave)
        if (absentToday === 0 && totalEmployees > 0) {
          absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);
        }

        console.log(`✅ Attendance - Present: ${presentToday}, Leave: ${onLeaveToday}, Absent: ${absentToday}`);

        // 4. Fetch Leave Requests (pending count)
        console.log("📊 Fetching leave requests...");
        const leaveData = await apiFetch("/hr/leave/?status=pending");
        const allLeaves = Array.isArray(leaveData) ? leaveData : (leaveData?.results || []);
        const pendingLeaves = allLeaves.length;
        console.log(`✅ Found ${pendingLeaves} pending leave requests`);

        // Update state
        setStats({
          totalUsers,
          totalEmployees,
          presentToday,
          onLeaveToday,
          absentToday,
          pendingLeaves,
        });

        console.log("✅ Dashboard data loaded successfully!");
      } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        padding: 32, fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#f8fafc", minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, border: "4px solid #e2e8f0",
            borderTop: "4px solid #dc2626", borderRadius: "50%",
            margin: "0 auto 16px", animation: "spin 1s linear infinite",
          }}></div>
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      padding: 32,
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          color: "#1e293b",
          letterSpacing: "-0.01em",
        }}>
          Welcome To Dashboard
        </h1>
        <p style={{
          margin: "6px 0 0",
          fontSize: 14,
          color: "#64748b",
        }}>
          Welcome back! Here's your workforce overview
        </p>
      </div>

      {/* ── Top row: 5 stat cards (with Total Users added) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 18,
        marginBottom: 24,
      }}>
        {/* Total Users */}
        <div style={{
          background: "#fff",
          border: "2px solid #e0e7ff",
          borderRadius: 14,
          padding: 22,
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <span style={{
              background: "#eef2ff",
              borderRadius: 10,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6366f1",
            }}>
              <IconEmployees />
            </span>
          </div>
          <div>
            <p style={{
              margin: 0,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6366f1",
              fontWeight: 600,
            }}>
              TOTAL USERS
            </p>
            <h2 style={{
              margin: "6px 0 2px",
              fontSize: 32,
              fontWeight: 700,
              color: "#1e293b",
            }}>
              {stats.totalUsers}
            </h2>
            <p style={{
              margin: 0,
              fontSize: 12,
              color: "#64748b",
            }}>
              All registered users
            </p>
          </div>
        </div>

        {/* Total Employees */}
        <div style={{
          background: "#fff",
          border: "2px solid #fee2e2",
          borderRadius: 14,
          padding: 22,
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <span style={{
              background: "#fef2f2",
              borderRadius: 10,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
            }}>
              <IconEmployees />
            </span>
          </div>
          <div>
            <p style={{
              margin: 0,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#dc2626",
              fontWeight: 600,
            }}>
              TOTAL EMPLOYEES
            </p>
            <h2 style={{
              margin: "6px 0 2px",
              fontSize: 32,
              fontWeight: 700,
              color: "#1e293b",
            }}>
              {stats.totalEmployees}
            </h2>
            <p style={{
              margin: 0,
              fontSize: 12,
              color: "#64748b",
            }}>
              All personnel
            </p>
          </div>
        </div>

        {/* Present Today */}
        <div style={{
          background: "#fff",
          border: "2px solid #d1fae5",
          borderRadius: 14,
          padding: 22,
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <span style={{
              background: "#d1fae5",
              borderRadius: 10,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#059669",
            }}>
              <IconPresent />
            </span>
          </div>
          <div>
            <p style={{
              margin: 0,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#059669",
              fontWeight: 600,
            }}>
              PRESENT TODAY
            </p>
            <h2 style={{
              margin: "6px 0 2px",
              fontSize: 32,
              fontWeight: 700,
              color: "#1e293b",
            }}>
              {stats.presentToday}
            </h2>
            <p style={{
              margin: 0,
              fontSize: 12,
              color: "#64748b",
            }}>
              {stats.presentToday === 0 ? "No records yet today" : "Working today"}
            </p>
          </div>
        </div>

        {/* On Leave Today */}
        <div style={{
          background: "#fff",
          border: "2px solid #fef3c7",
          borderRadius: 14,
          padding: 22,
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <span style={{
              background: "#fef3c7",
              borderRadius: 10,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d97706",
            }}>
              <IconOnLeave />
            </span>
          </div>
          <div>
            <p style={{
              margin: 0,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#d97706",
              fontWeight: 600,
            }}>
              ON LEAVE TODAY
            </p>
            <h2 style={{
              margin: "6px 0 2px",
              fontSize: 32,
              fontWeight: 700,
              color: "#1e293b",
            }}>
              {stats.onLeaveToday}
            </h2>
            <p style={{
              margin: 0,
              fontSize: 12,
              color: "#64748b",
            }}>
              {stats.onLeaveToday === 0 ? "No leaves today" : "Taking leave"}
            </p>
          </div>
        </div>

        {/* Absent Today */}
        <div style={{
          background: "#fff",
          border: "2px solid #fed7aa",
          borderRadius: 14,
          padding: 22,
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <span style={{
              background: "#fed7aa",
              borderRadius: 10,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ea580c",
            }}>
              <IconAbsent />
            </span>
          </div>
          <div>
            <p style={{
              margin: 0,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#ea580c",
              fontWeight: 600,
            }}>
              ABSENT TODAY
            </p>
            <h2 style={{
              margin: "6px 0 2px",
              fontSize: 32,
              fontWeight: 700,
              color: "#1e293b",
            }}>
              {stats.absentToday}
            </h2>
            <p style={{
              margin: 0,
              fontSize: 12,
              color: "#64748b",
            }}>
              {stats.absentToday === 0 ? "All accounted for" : "No attendance record"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Hiring & Turnover Trend Chart ── */}
      <div style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
      }}>
        {/* chart header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📈</span> Hiring & Turnover Trend
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
              Showing new hires registration over the last 12 months
            </p>
          </div>
          <span style={{
            border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 12px",
            fontSize: 12, color: "#64748b", background: "#f8fafc",
          }}>
            Last 12 Months ▾
          </span>
        </div>

        {/* chart */}
        <div style={{ width: "100%", height: 200, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#dc2626"
                strokeWidth={2.5}
                fill="url(#redGrad)"
                dot={{ r: 3, fill: "#dc2626", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#dc2626", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* net growth badge */}
        {chartData.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              color: "#dc2626",
              fontWeight: 600,
            }}>
              ☑ Net Workforce Growth trending up by{" "}
              <strong>
                {(() => {
                  const last3 = chartData.slice(-3).reduce((a, c) => a + c.value, 0);
                  const prev3 = chartData.slice(-6, -3).reduce((a, c) => a + c.value, 0);
                  if (prev3 === 0) return last3 > 0 ? "↑ new" : "0%";
                  return `${(((last3 - prev3) / prev3) * 100).toFixed(1)}%`;
                })()}
              </strong>{" "}
              this quarter
            </span>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#94a3b8" }}>
              Data Period: Based on employee joining dates
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom row: Urgent HR Tasks + Recent Policy Updates ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 18,
      }}>
        {/* Urgent HR Tasks */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
          padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🎯</span> Urgent HR Tasks
          </h3>

          {/* Pending Leave Approvals */}
          {stats.pendingLeaves > 0 && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <span style={{
                background: "#dc2626", color: "#fff", borderRadius: "50%",
                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2,
              }}>
                {stats.pendingLeaves}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                  Pending Leave Approvals
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>
                  {stats.pendingLeaves} leave request{stats.pendingLeaves > 1 ? "s" : ""} need your review.
                </p>
              </div>
            </div>
          )}

          {/* Absent employees */}
          {stats.absentToday > 0 && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <span style={{
                background: "#ea580c", color: "#fff", borderRadius: "50%",
                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2,
              }}>
                {stats.absentToday}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                  Employees Absent Today
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>
                  {stats.absentToday} employee{stats.absentToday > 1 ? "s" : ""} have no attendance record for today.
                </p>
              </div>
            </div>
          )}

          {/* No tasks fallback */}
          {stats.pendingLeaves === 0 && stats.absentToday === 0 && (
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
              ✅ No urgent tasks right now. All clear!
            </p>
          )}
        </div>

        {/* Recent Blog / Policy Updates */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
          padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📋</span> Recent Blog / Policy Updates
          </h3>

          {[
            { title: "New Company PTO Policy Released", date: "Dec 11, 2025", author: "HR Team", read: "5 min read" },
            { title: "Updated Work-From-Home Guidelines", date: "Dec 05, 2025", author: "HR Team", read: "3 min read" },
            { title: "Q4 Performance Review Schedule", date: "Nov 28, 2025", author: "HR Team", read: "4 min read" },
          ].map((post, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              paddingBottom: i < 2 ? 14 : 0, marginBottom: i < 2 ? 14 : 0,
              borderBottom: i < 2 ? "1px solid #f1f5f9" : "none",
            }}>
              <div style={{
                background: "#fef2f2", borderRadius: 8, padding: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#dc2626",
              }}>
                <IconDoc />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{post.title}</p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8" }}>
                  📅 {post.date} · 👤 {post.author} · ⏱ {post.read}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}