import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./SideBar.scss";

function SideBar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button className="hamburger" onClick={toggleMobile}>
        {isMobileOpen ? "✖" : "☰"}
      </button>

      <div className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        <h3 className="sidebar-title" onClick={toggleMenu}>
          👥 HR
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
                to="/hr/salary-certificate"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMobileOpen(false)}
              >
                💰 Salary Certificate
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hr/experience-certificate"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setIsMobileOpen(false)}
              >
                🎓 Experience Certificate
              </NavLink>
            </li>
          </ul>
        )}
      </div>
    </>
  );
}

export default SideBar;
