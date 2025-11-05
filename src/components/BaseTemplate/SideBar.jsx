import React, { useState, useMemo, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./SideBar.scss";
import { FaUserClock, FaCalendarCheck, FaUsersCog } from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000/api";

function SideBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuTree, setMenuTree] = useState([]);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const refreshToken = localStorage.getItem("refresh");
  const userLevel = localStorage.getItem("user_level") || "User";

  // Load menus on mount
  useEffect(() => {
    if (token) {
      fetchMyMenu();
    } else {
      setLoading(false);
      setError("Not authenticated");
    }
  }, [token]);

  // Refresh token if needed
  const refreshAccessToken = async () => {
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!res.ok) throw new Error("Failed to refresh token");
      
      const data = await res.json();
      localStorage.setItem("access", data.access);
      
      return data.access;
    } catch (err) {
      console.error("Token refresh failed:", err);
      handleLogout();
      return null;
    }
  };

  // Fetch user's menu from backend
  async function fetchMyMenu(retryWithRefresh = true) {
    if (!token) {
      setLoading(false);
      setError("Not authenticated");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/user-controll/my-menu/`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 && retryWithRefresh) {
        console.log("Token expired, refreshing...");
        const newToken = await refreshAccessToken();
        if (newToken) {
          return fetchMyMenu(false);
        }
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch menu: ${res.status}`);
      }

      const data = await res.json();
      console.log("Menu data from API:", data);
      
      const menus = data.menu || [];
      const adminStatus = data.is_admin || false;
      const level = data.user_level || userLevel;
      
      // Update state
      setMenuTree(menus);
      setIsAdmin(adminStatus);
      setError("");
      
      // Store in localStorage
      localStorage.setItem("allowed_menus", JSON.stringify(menus));
      localStorage.setItem("is_admin", JSON.stringify(adminStatus));
      localStorage.setItem("user_level", level);
      
      // Auto-expand parent menus
      autoExpandParents(menus);
      
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function autoExpandParents(items) {
    const allParentIds = new Set();
    function collectParents(nodes) {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allParentIds.add(node.id);
          collectParents(node.children);
        }
      });
    }
    collectParents(items);
    setExpandedMenus(allParentIds);
  }

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const getIcon = (iconName) => {
    if (!iconName) return null;

    const iconMap = {
      "FaUserClock": <FaUserClock className="sidebar-icon" />,
      "FaCalendarCheck": <FaCalendarCheck className="sidebar-icon" />,
      "FaUsersCog": <FaUsersCog className="sidebar-icon" />,
    };

    if (iconMap[iconName]) {
      return iconMap[iconName];
    }

    return <span className="sidebar-icon">{iconName}</span>;
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.id);

    if (hasChildren) {
      return (
        <div key={item.id}>
          <h3 className="sidebar-title" onClick={() => toggleMenu(item.id)}>
            {getIcon(item.icon)} {item.name}
            <span className="arrow">{isExpanded ? "▲" : "▼"}</span>
          </h3>

          {isExpanded && (
            <ul className="sidebar-menu">
              {item.children.map(child => renderMenuItem(child))}
            </ul>
          )}
        </div>
      );
    } else {
      return (
        <li key={item.id}>
          <NavLink
            to={item.path}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setIsMobileOpen(false)}
          >
            {getIcon(item.icon)} <span>{item.name}</span>
          </NavLink>
        </li>
      );
    }
  };

  return (
    <>
      <button className="hamburger" onClick={toggleMobile}>
        {isMobileOpen ? "✖" : "☰"}
      </button>

      <div className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-brand">HR System</h2>
          {userLevel && (
            <span className="user-level-badge">
              {userLevel}
            </span>
          )}
        </div>

        {loading ? (
          <div className="sidebar-loading">
            <div className="spinner"></div>
            <p>Loading menu...</p>
          </div>
        ) : error ? (
          <div className="sidebar-error">
            <p style={{ color: '#ef4444', padding: '16px' }}>⚠️ {error}</p>
            <button 
              onClick={() => navigate("/login")}
              style={{ 
                margin: '8px 16px',
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
          </div>
        ) : menuTree.length === 0 ? (
          <div className="sidebar-empty">
            <p>No menus available</p>
            {!isAdmin && (
              <p style={{ fontSize: '0.9em', marginTop: '8px', padding: '0 16px' }}>
                Contact admin to assign menu permissions
              </p>
            )}
            <button 
              onClick={fetchMyMenu}
              style={{ 
                margin: '8px 16px',
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Menus
            </button>
          </div>
        ) : (
          <div className="sidebar-content">
            {menuTree.map(item => renderMenuItem(item))}
          </div>
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