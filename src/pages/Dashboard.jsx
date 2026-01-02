import React from "react";

export default function Dashboard() {
  return (
    <div style={page}>
      {/* Header */}
      <div style={header}>
        <h1 style={headerTitle}>Welcome To Dashboard</h1>
        <p style={headerSubtitle}>Welcome back! Here's your workforce overview</p>
      </div>

      {/* ================= TOP STATS ================= */}
      <div style={statsGrid}>
        <div style={{...statCard, ...gradientBlue}}>
          <div style={statHeader}>
            <span style={statLabel}>Total Employees</span>
            <div style={iconCircle}>👥</div>
          </div>
          <h2 style={statValue}>1,258</h2>
          <p style={statChange}>All personnel</p>
        </div>

        <div style={{...statCard, ...gradientGreen}}>
          <div style={statHeader}>
            <span style={statLabel}>Active Jobs</span>
            <div style={iconCircle}>💼</div>
          </div>
          <h2 style={statValue}>24</h2>
          <p style={trendPositive}>↗ Trending up 5%</p>
        </div>

        <div style={{...statCard, ...gradientPurple}}>
          <div style={statHeader}>
            <span style={statLabel}>New Hires (30 Days)</span>
            <div style={iconCircle}>✨</div>
          </div>
          <h2 style={statValue}>15</h2>
          <p style={trendPositive}>↗ Trending up 5%</p>
        </div>

        <div style={{...statCard, ...gradientOrange}}>
          <div style={statHeader}>
            <span style={statLabel}>PTO Requests Awaiting</span>
            <div style={iconCircle}>⏰</div>
          </div>
          <h2 style={statValue}>7</h2>
          <span style={badge}>⚠ Needs Action!</span>
        </div>
      </div>

      {/* ================= TREND CHART ================= */}
      <div style={chartCard}>
        <div style={chartHeader}>
          <div>
            <h3 style={sectionTitle}>📊 Hiring & Turnover Trend</h3>
            <p style={sectionSub}>
              Showing new hires registration over the last 12 months
            </p>
          </div>
          <button style={filterButton}>Last 12 Months ▾</button>
        </div>

        <svg width="100%" height="240" viewBox="0 0 800 240" style={{marginTop: '20px'}}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1="0" y1="60" x2="800" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="0" y1="120" x2="800" y2="120" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="0" y1="180" x2="800" y2="180" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />

          {/* Area */}
          <polygon
            fill="url(#chartGradient)"
            points="
              0,190
              100,180
              200,165
              300,120
              360,150
              420,80
              480,150
              620,175
              800,175
              800,220
              0,220
            "
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke="#dc2626"
            strokeWidth="3"
            points="
              0,190
              100,180
              200,165
              300,120
              360,150
              420,80
              480,150
              620,175
              800,175
            "
          />

          {/* Data Points */}
          <circle cx="420" cy="80" r="6" fill="#ffffff" stroke="#dc2626" strokeWidth="3" />
          <circle cx="100" cy="180" r="4" fill="#dc2626" />
          <circle cx="200" cy="165" r="4" fill="#dc2626" />
          <circle cx="300" cy="120" r="4" fill="#dc2626" />
          <circle cx="620" cy="175" r="4" fill="#dc2626" />
        </svg>

        <div style={chartFooter}>
          <div style={growthBadge}>
            📈 Net Workforce Growth trending up by <strong>9.5%</strong> this quarter
          </div>
          <p style={period}>
            Data Period: January – December 2025
          </p>
        </div>
      </div>

      {/* ================= BOTTOM PANELS ================= */}
      <div style={bottomGrid}>
        <div style={panel}>
          <h4 style={panelTitle}>🎯 Urgent HR Tasks</h4>
          <div style={divider}></div>

          <div style={taskItem}>
            <div style={taskNumber}>1</div>
            <div>
              <p style={taskText}>Pending Onboarding Documents</p>
              <p style={muted}>5 employees have incomplete files.</p>
            </div>
          </div>

          <div style={taskItem}>
            <div style={taskNumber}>2</div>
            <div>
              <p style={taskText}>Performance Reviews Overdue</p>
              <p style={muted}>3 teams delayed.</p>
            </div>
          </div>

          <div style={taskItem}>
            <div style={taskNumber}>3</div>
            <div>
              <p style={taskText}>Safety Certifications Expire This Month</p>
              <p style={muted}>Requires immediate attention</p>
            </div>
          </div>
        </div>

        <div style={panel}>
          <h4 style={panelTitle}>📰 Recent Blog/Policy Updates</h4>
          <div style={divider}></div>
          
          <div style={updateCard}>
            <div style={updateIcon}>📋</div>
            <div>
              <p style={updateTitle}>New Company PTO Policy Released</p>
              <p style={muted}>
                📅 Dec 11, 2025 • ✍️ HR Team • ⏱ 5 min read
              </p>
              <button style={readMoreButton}>Read More →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PROFESSIONAL STYLES WITH GRADIENTS ================= */

const page = {
  background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
  minHeight: "100vh",
  padding: "16px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  maxWidth: "100%",
  overflowX: "hidden",
};

const header = {
  marginBottom: "28px",
};

const headerTitle = {
  fontSize: "32px",
  fontWeight: "700",
  background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  marginBottom: "4px",
};

const headerSubtitle = {
  color: "#64748b",
  fontSize: "15px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const statCard = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
};

const gradientBlue = {
  borderLeft: "4px solid #dc2626",
  background: "linear-gradient(135deg, #ffffff 0%, #fee2e2 100%)",
};

const gradientGreen = {
  borderLeft: "4px solid #ef4444",
  background: "linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)",
};

const gradientPurple = {
  borderLeft: "4px solid #b91c1c",
  background: "linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)",
};

const gradientOrange = {
  borderLeft: "4px solid #dc2626",
  background: "linear-gradient(135deg, #ffffff 0%, #fee2e2 100%)",
};

const statHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const statLabel = {
  fontSize: "13px",
  color: "#64748b",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const iconCircle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
};

const statValue = {
  fontSize: "36px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "4px",
};

const statChange = {
  fontSize: "13px",
  color: "#64748b",
};

const trendPositive = {
  fontSize: "13px",
  color: "#10b981",
  fontWeight: "600",
};

const badge = {
  display: "inline-block",
  background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  color: "#dc2626",
  padding: "6px 14px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
  marginTop: "8px",
};

const chartCard = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "28px",
  marginBottom: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const chartHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "8px",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "4px",
};

const sectionSub = {
  fontSize: "13px",
  color: "#64748b",
};

const filterButton = {
  background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
  border: "1px solid #cbd5e1",
  padding: "8px 16px",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#475569",
  cursor: "pointer",
  fontWeight: "500",
};

const chartFooter = {
  marginTop: "20px",
};

const growthBadge = {
  display: "inline-block",
  background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
  color: "#991b1b",
  padding: "10px 18px",
  borderRadius: "10px",
  fontSize: "14px",
  marginBottom: "8px",
  fontWeight: "600",
};

const period = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "8px",
};

const bottomGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "20px",
};

const panel = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const panelTitle = {
  fontSize: "17px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "12px",
};

const divider = {
  height: "1px",
  background: "linear-gradient(90deg, #e2e8f0 0%, transparent 100%)",
  marginBottom: "16px",
};

const taskItem = {
  display: "flex",
  gap: "14px",
  marginBottom: "18px",
  padding: "12px",
  borderRadius: "10px",
  background: "#f8fafc",
  transition: "all 0.2s ease",
};

const taskNumber = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: "700",
  flexShrink: 0,
};

const taskText = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e293b",
  marginBottom: "4px",
};

const muted = {
  fontSize: "12px",
  color: "#94a3b8",
};

const updateCard = {
  display: "flex",
  gap: "14px",
  padding: "16px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
  border: "1px solid #fecaca",
};

const updateIcon = {
  width: "44px",
  height: "44px",
  borderRadius: "12px",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  flexShrink: 0,
};

const updateTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e293b",
  marginBottom: "6px",
};

const readMoreButton = {
  marginTop: "10px",
  background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
  color: "#ffffff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
};