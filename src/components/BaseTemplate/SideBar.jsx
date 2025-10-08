import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./SideBar.scss";

function SideBar({ onLogout }) {
  const [openMenu, setOpenMenu] = useState(true); // Start open by default
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

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
        <h3 className="sidebar-title" onClick={toggleMenu}>
          👥 HR Management
          <span className="arrow">{openMenu ? "▲" : "▼"}</span>
        </h3>

        {openMenu && (
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/hr/cv-management"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMobileOpen(false)}
              >
                📄 CV Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hr/interview-management"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMobileOpen(false)}
              >
                👤 Interview Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hr/offer-letter"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMobileOpen(false)}
              >
                📝 Offer Letter
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hr/employee-management"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMobileOpen(false)}
              >
                👥 Employee Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hr/attendance"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMobileOpen(false)}
              >
                📌 Attendance
              </NavLink>
            </li>
             <li>
              <NavLink
                to="/hr/ExperienceCertificate"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMobileOpen(false)}
              >
                🏅 ExperienceCertificate
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