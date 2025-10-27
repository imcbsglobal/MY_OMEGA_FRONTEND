// SideBar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./SideBar.scss";
import { FaUserClock, FaCalendarCheck, FaUsersCog } from "react-icons/fa";

function SideBar() {
  const [openHRMenu, setOpenHRMenu] = useState(true);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ read logged-in user (should include is_superuser from /me)
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const toggleHRMenu = () => setOpenHRMenu(!openHRMenu);
  const toggleUserMenu = () => setOpenUserMenu(!openUserMenu);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <button className="hamburger" onClick={toggleMobile}>
        {isMobileOpen ? "✖" : "☰"}
      </button>

      <div className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-brand">HR System</h2>
        </div>

        <h3 className="sidebar-title" onClick={toggleHRMenu}>
          👥 HR Management
          <span className="arrow">{openHRMenu ? "▲" : "▼"}</span>
        </h3>

        {openHRMenu && (
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/hr/interview-management" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                👤 Interview Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/hr/offer-letter" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                📝 Offer Letter
              </NavLink>
            </li>
            <li>
              <NavLink to="/hr/employee-management" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                👥 Employee Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/hr/attendance" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                📌 Attendance Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/hr/PunchinPunchout" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                <FaUserClock className="sidebar-icon" />
                <span>Punch In / Punch Out</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/hr/leave-management" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                <FaCalendarCheck className="sidebar-icon" />
                <span>Leave Management</span>
              </NavLink>
            </li>
          </ul>
        )}

        <h3 className="sidebar-title" onClick={toggleUserMenu}>
          🧑 User Management
          <span className="arrow">{openUserMenu ? "▲" : "▼"}</span>
        </h3>

        {openUserMenu && (
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/user/list" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                <FaUsersCog className="sidebar-icon" />
                <span>User List</span>
              </NavLink>
            </li>

            {/* ✅ Super Admin–only link */}
            {user?.is_superuser && (
              <li>
                <NavLink
                  to="/admin/user-control"
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={() => setIsMobileOpen(false)}
                >
                  🔒 User Control
                </NavLink>
              </li>
            )}
          </ul>
        )}

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {isMobileOpen && <div className="sidebar-overlay" onClick={toggleMobile} />}
    </>
  );
}

export default SideBar;
