import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import api from "../../api/client";

export default function Navbar() {
  const [menuTree, setMenuTree] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("menuTree") || "[]");
    } catch {
      return [];
    }
  });
  const [hrDropdownOpen, setHrDropdownOpen] = useState(false);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [requestDropdownOpen, setRequestDropdownOpen] = useState(false); // ✅ For click dropdown inside HR
  const location = useLocation();

  // ✅ User info
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || user?.email || "User";
  const userLevel = user?.user_level || "User";
  const isAdmin = userLevel === "Admin" || userLevel === "Super Admin";

  // ✅ Fetch menu for normal user only
  useEffect(() => {
    if (!isAdmin) {
      api
        .get("user-controll/my-menu/")
        .then((res) => {
          const menus = res.data?.menu || res.data?.menu_tree || [];
          setMenuTree(menus);
          localStorage.setItem("menuTree", JSON.stringify(menus));
          console.log("✅ User Menu Loaded:", menus);
        })
        .catch((err) => console.error("❌ Failed to fetch user menu:", err));
    }
  }, [isAdmin]);

  function buildNavFromTree(tree = []) {
    if (!Array.isArray(tree)) return [];

    return tree.map((root) => {
      const rootPath =
        root.path && root.path.startsWith("/")
          ? root.path
          : `/${(root.key || root.name).toLowerCase().replace(/\s+/g, "-")}`;

      const children = (root.children || []).map((c) => ({
        name: c.name,
        path:
          c.path && c.path.startsWith("/")
            ? c.path
            : `/${(c.key || c.name).toLowerCase().replace(/\s+/g, "-")}`,
      }));

      return {
        name: root.name,
        path: rootPath,
        hasDropdown: children.length > 0,
        children,
      };
    });
  }

  // ✅ Admin navbar setup
  const adminNavItems = [
    { name: "Dashboard" },
    { name: "HR Management", hasDropdown: true },
    { name: "Marketing" },
    { name: "Vehicle Management", hasDropdown: true },
    { name: "Target Management" },
    { name: "Warehouse Management" },
    { name: "Delivery Management" },
    { name: "User Management", hasDropdown: true },
    { name: "Master" },
  ];

  const userNavItems = buildNavFromTree(menuTree);
  const navItems = isAdmin ? adminNavItems : userNavItems;

  // ✅ HR dropdown data
  const hrMenuItems = [
    { name: "CV Management", path: "/cv-management" },
    { name: "Interview Management", path: "/interview-management" },
    { name: "Offer Letter", path: "/offer-letter" },
    { name: "Employee Management", path: "/employee-management" },
    { name: "Attendance Management", path: "/attendance-management" },
    { name: "Punch In/Punch Out", path: "/punch-in-out" },
    { name: "Leave Management", path: "/leave-management" },

    // ✅ Request click dropdown (no hover)
    { name: "Request", path: "#" },

    { name: "Experience Certificate", path: "/experience-certificate" },
    { name: "Salary Certificate", path: "/salary-certificate" },
  ];

  const vehicleMenuItems = [
    { name: "Company Vehicle", path: "/company-vehicle" },
    { name: "Non Company Vehicle", path: "/non-company-vehicle" },
  ];

  const userMenuItems = [
    { name: "Add User", path: "/add-user" },
    { name: "User Control", path: "/user-control" },
  ];

  // ✅ Styles
  const styles = {
    navbarContainer: {
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    topNavbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 40px",
      borderBottom: "1px solid #e5e7eb",
    },
    logoSection: { display: "flex", alignItems: "center", gap: "8px" },
    logoImage: { width: "48px", height: "48px", objectFit: "contain" },
    navbarTitle: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#dc2626",
      fontStyle: "italic",
      margin: 0,
    },
    bottomNavbar: {
      display: "flex",
      justifyContent: "center",
      padding: "0 40px",
      background: "linear-gradient(to right, #f8fafc, #f1f5f9)",
      borderBottom: "1px solid #e2e8f0",
    },
    navLink: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "14px 18px",
      textDecoration: "none",
      color: "#475569",
      fontSize: "14.5px",
      fontWeight: "600",
      transition: "all 0.25s ease",
      borderBottom: "2px solid transparent",
      borderRadius: "6px 6px 0 0",
    },
    dropdownMenu: {
      position: "absolute",
      top: "100%",
      left: 0,
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
      minWidth: "220px",
      zIndex: 2000,
      padding: "6px",
    },
    dropdownItem: {
      display: "block",
      padding: "10px 16px",
      textDecoration: "none",
      color: "#64748b",
      fontSize: "13.5px",
      fontWeight: "500",
      borderRadius: "7px",
      marginBottom: "3px",
    },
    requestSubMenu: {
      position: "absolute",
      top: 0,
      left: "100%",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      minWidth: "200px",
      padding: "6px",
      zIndex: 2500,
    },
  };

  return (
    <header style={styles.navbarContainer}>
      {/* --- Top Navbar --- */}
      <div style={styles.topNavbar}>
        <div style={styles.logoSection}>
          <img src="/assets/omega-logo.png" alt="Omega" style={styles.logoImage} />
          <h1 style={styles.navbarTitle}>Omega</h1>
        </div>

        {/* --- Profile --- */}
        <div style={{ position: "relative" }}>
          <img
            src={
              user?.photo ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40"
            }
            alt="User"
            style={{ width: 42, height: 42, borderRadius: "50%", cursor: "pointer" }}
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          />
          {profileDropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "60px",
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                padding: "12px",
                width: "220px",
              }}
            >
              <p style={{ fontWeight: "600" }}>Hello, {username}</p>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>{userLevel}</p>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Bottom Navbar --- */}
      <nav style={styles.bottomNavbar}>
        {navItems.map((item) => {
          const isDropdown =
            item.hasDropdown &&
            ["HR Management", "Vehicle Management", "User Management"].includes(item.name);

          const dropdownOpen =
            (item.name === "HR Management" && hrDropdownOpen) ||
            (item.name === "Vehicle Management" && vehicleDropdownOpen) ||
            (item.name === "User Management" && userDropdownOpen);

          const menuItems = isAdmin
            ? item.name === "HR Management"
              ? hrMenuItems
              : item.name === "Vehicle Management"
              ? vehicleMenuItems
              : item.name === "User Management"
              ? userMenuItems
              : []
            : item.children || [];

          return (
            <div
              key={item.name}
              onMouseEnter={() => {
                if (item.name === "HR Management") setHrDropdownOpen(true);
                if (item.name === "Vehicle Management") setVehicleDropdownOpen(true);
                if (item.name === "User Management") setUserDropdownOpen(true);
              }}
              onMouseLeave={() => {
                if (item.name === "HR Management") setHrDropdownOpen(false);
                if (item.name === "Vehicle Management") setVehicleDropdownOpen(false);
                if (item.name === "User Management") setUserDropdownOpen(false);
                setRequestDropdownOpen(false);
              }}
              style={{ position: "relative" }}
            >
              {!isDropdown ? (
                <NavLink
                  to={
                    item.path
                      ? item.path
                      : item.name === "Dashboard"
                      ? "/"
                      : `/${item.name.toLowerCase().replace(/\s+/g, "-")}`
                  }
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    color: isActive ? "#dc2626" : styles.navLink.color,
                    borderBottomColor: isActive ? "#dc2626" : "transparent",
                  })}
                >
                  {item.name}
                </NavLink>
              ) : (
                <>
                  <div
                    style={{
                      ...styles.navLink,
                      color: dropdownOpen ? "#dc2626" : styles.navLink.color,
                      cursor: "pointer",
                    }}
                  >
                    {item.name}
                    <ChevronDown
                      size={16}
                      style={{
                        marginLeft: "4px",
                        transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "0.3s",
                      }}
                    />
                  </div>

                  {dropdownOpen && (
                    <div style={styles.dropdownMenu}>
                      {menuItems.map((mi) => {
                        if (mi.name !== "Request") {
                          // Normal HR items
                          return (
                            <NavLink
                              key={mi.name}
                              to={mi.path}
                              style={({ isActive }) => ({
                                ...styles.dropdownItem,
                                backgroundColor: isActive ? "#fee2e2" : "transparent",
                                color: isActive ? "#dc2626" : "#64748b",
                              })}
                            >
                              {mi.name}
                            </NavLink>
                          );
                        }

                        // ✅ Request click-to-toggle dropdown
                        return (
                          <div key="request" style={{ position: "relative" }}>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setRequestDropdownOpen(!requestDropdownOpen);
                              }}
                              style={{
                                ...styles.dropdownItem,
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              Request <span style={{ fontSize: 12 }}>▼</span>
                            </div>

                            {requestDropdownOpen && (
                              <div style={styles.requestSubMenu}>
                                {[
                                  { name: "Leave Request", path: "/request/leave" },
                                  { name: "Late Request", path: "/request/late" },
                                  { name: "Early Request", path: "/request/early" },
                                ].map((sub) => (
                                  <NavLink
                                    key={sub.name}
                                    to={sub.path}
                                    style={({ isActive }) => ({
                                      ...styles.dropdownItem,
                                      backgroundColor: isActive
                                        ? "#fee2e2"
                                        : "transparent",
                                      color: isActive ? "#dc2626" : "#64748b",
                                    })}
                                  >
                                    {sub.name}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>
    </header>
  );
}
