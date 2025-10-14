import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./SideBar.scss";
import { FaUserClock, FaCalendarCheck, FaUsersCog, FaUserPlus } from "react-icons/fa";

function SideBar({ onLogout }) {
  const [openHRMenu, setOpenHRMenu] = useState(true);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleHRMenu = () => setOpenHRMenu(!openHRMenu);
  const toggleUserMenu = () => setOpenUserMenu(!openUserMenu);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
      navigate("/login");
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button className="hamburger" onClick={toggleMobile}>
        {isMobileOpen ? "✖" : "☰"}
      </button>

      <div className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-brand">HR System</h2>
        </div>

        {/* HR Menu Section */}
        <h3 className="sidebar-title" onClick={toggleHRMenu}>
          👥 HR Management
          <span className="arrow">{openHRMenu ? "▲" : "▼"}</span>
        </h3>

        {openHRMenu && (
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/hr/cv-management" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                📄 CV Management
              </NavLink>
            </li>
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
            <li>
              <NavLink to="/hr/ExperienceCertificate" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                🏅 Experience Certificate
              </NavLink>
            </li>
            <li>
              <NavLink to="/hr/SalaryCertificate" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMobileOpen(false)}>
                💶 Salary Certificate
              </NavLink>
            </li>
          </ul>
        )}

        {/* USER MANAGEMENT SECTION */}
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
          </ul>
        )}

        {/* Logout Button at Bottom */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={toggleMobile} />}
    </>
  );
}

export default SideBar;
