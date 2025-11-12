import { useState, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
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
  const [masterDropdownOpen, setMasterDropdownOpen] = useState(false);
  const [requestDropdownOpen, setRequestDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || user?.email || "User";
  const userLevel = user?.user_level || "User";
  const isAdmin = userLevel === "Admin" || userLevel === "Super Admin";

  // ✅ Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch user-specific menu if not admin
  useEffect(() => {
    if (!isAdmin) {
      api
        .get("/user-controll/my-menu/")
        .then((res) => {
          const menus = res.data?.menu || res.data?.menu_tree || [];
          setMenuTree(menus);
          localStorage.setItem("menuTree", JSON.stringify(menus));
        })
        .catch((err) => console.error("❌ Failed to fetch user menu:", err));
    }
  }, [isAdmin]);

  // ✅ Build dynamic menu
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
      return { name: root.name, path: rootPath, hasDropdown: children.length > 0, children };
    });
  }

  // ✅ Admin menus
  const adminNavItems = [
    { name: "Dashboard" },
    { name: "HR Management", hasDropdown: true },
    { name: "Marketing" },
    { name: "Vehicle Management", hasDropdown: true },
    { name: "Target Management" },
    { name: "Warehouse Management" },
    { name: "Delivery Management" },
    { name: "User Management", hasDropdown: true },
    { name: "Master", hasDropdown: true },
  ];

  const userNavItems = buildNavFromTree(menuTree);
  const navItems = isAdmin ? adminNavItems : userNavItems;

  // ✅ Dropdown menus
  const hrMenuItems = [
    { name: "CV Management", path: "/cv-management" },
    { name: "Interview Management", path: "/interview-management" },
    { name: "Offer Letter", path: "/offer-letter" },
    { name: "Employee Management", path: "/employee-management" },
    { name: "Attendance Management", path: "/attendance-management" },
    { name: "Punch In/Punch Out", path: "/punch-in-out" },
    { name: "Leave Management", path: "/leave-management" },
    {
      name: "Request",
      children: [
        { name: "Leave Request", path: "/hr/request/leave" },
        { name: "Late Request", path: "/hr/request/late" },
        { name: "Early Request", path: "/hr/request/early" },
      ],
    },
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

  const masterMenuItems = [
    { name: "Job Titles", path: "/master/job-titles" },
    { name: "List", path: "/master/job-titles/list" },
  ];

  const styles = {
    navbarContainer: {
      backgroundColor: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
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
      padding: "12px 20px",
      borderBottom: "1px solid #e5e7eb",
    },
    bottomNavbar: {
      display: isMobile ? (mobileMenuOpen ? "block" : "none") : "flex",
      justifyContent: "center",
      flexDirection: isMobile ? "column" : "row",
      padding: "10px 20px",
      background: "linear-gradient(to right, #f8fafc, #f1f5f9)",
      borderBottom: "1px solid #e2e8f0",
    },
    navLink: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "10px 14px",
      textDecoration: "none",
      color: "#475569",
      fontSize: "14.5px",
      fontWeight: "600",
      transition: "all 0.25s ease",
      borderBottom: "2px solid transparent",
    },
    dropdownMenu: {
      position: "absolute",
      top: "100%",
      left: 0,
      backgroundColor: "#fff",
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
      backgroundColor: "#fff",
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src="/assets/omega-logo.png"
            alt="Omega"
            style={{ width: 48, height: 48, objectFit: "contain" }}
          />
          <h1
            style={{
              fontSize: "28px",
              color: "#dc2626",
              fontWeight: "700",
              fontStyle: "italic",
            }}
          >
            Omega
          </h1>
        </div>

        {/* --- Mobile Hamburger Icon --- */}
        <div style={{ display: isMobile ? "block" : "none", cursor: "pointer" }}>
          {mobileMenuOpen ? (
            <X size={30} onClick={() => setMobileMenuOpen(false)} />
          ) : (
            <Menu size={30} onClick={() => setMobileMenuOpen(true)} />
          )}
        </div>

        {/* --- Profile Icon (desktop) --- */}
        {!isMobile && (
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
        )}
      </div>

      {/* --- Bottom Navbar --- */}
      <nav style={styles.bottomNavbar}>
        {navItems.map((item) => {
          const isDropdown =
            item.hasDropdown &&
            ["HR Management", "Vehicle Management", "User Management", "Master"].includes(
              item.name
            );

          const dropdownOpen =
            (item.name === "HR Management" && hrDropdownOpen) ||
            (item.name === "Vehicle Management" && vehicleDropdownOpen) ||
            (item.name === "User Management" && userDropdownOpen) ||
            (item.name === "Master" && masterDropdownOpen);

          const menuItems = isAdmin
            ? item.name === "HR Management"
              ? hrMenuItems
              : item.name === "Vehicle Management"
              ? vehicleMenuItems
              : item.name === "User Management"
              ? userMenuItems
              : item.name === "Master"
              ? masterMenuItems
              : []
            : item.children || [];

          return (
            <div
              key={item.name}
              onMouseEnter={() => {
                if (!isMobile) {
                  if (item.name === "HR Management") setHrDropdownOpen(true);
                  if (item.name === "Vehicle Management") setVehicleDropdownOpen(true);
                  if (item.name === "User Management") setUserDropdownOpen(true);
                  if (item.name === "Master") setMasterDropdownOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  setHrDropdownOpen(false);
                  setVehicleDropdownOpen(false);
                  setUserDropdownOpen(false);
                  setMasterDropdownOpen(false);
                  setRequestDropdownOpen(false);
                }
              }}
              style={{ position: "relative" }}
            >
              {/* --- Clickable Nav Item (fixed HR Management) --- */}
              {isDropdown ? (
                <>
                  <NavLink
                    to={`/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    style={({ isActive }) => ({
                      ...styles.navLink,
                      color: isActive ? "#dc2626" : styles.navLink.color,
                      borderBottomColor: isActive ? "#dc2626" : "transparent",
                      cursor: "pointer",
                    })}
                    onClick={(e) => {
                      // On desktop, clicking toggles dropdown instead of navigating
                      if (!isMobile) {
                        e.preventDefault();
                        if (item.name === "HR Management")
                          setHrDropdownOpen(!hrDropdownOpen);
                        if (item.name === "Vehicle Management")
                          setVehicleDropdownOpen(!vehicleDropdownOpen);
                        if (item.name === "User Management")
                          setUserDropdownOpen(!userDropdownOpen);
                        if (item.name === "Master")
                          setMasterDropdownOpen(!masterDropdownOpen);
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                  >
                    {item.name}
                    <ChevronDown
                      size={16}
                      style={{
                        transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "0.3s",
                      }}
                    />
                  </NavLink>

                  {dropdownOpen && (
                    <div style={styles.dropdownMenu}>
                      {menuItems.map((mi) =>
                        mi.children ? (
                          <div
                            key={mi.name}
                            style={{ position: "relative" }}
                            onMouseEnter={() => setRequestDropdownOpen(true)}
                            onMouseLeave={() => setRequestDropdownOpen(false)}
                          >
                            <div style={styles.dropdownItem}>
                              {mi.name} <ChevronDown size={14} style={{ float: "right" }} />
                            </div>
                            {requestDropdownOpen && (
                              <div style={styles.requestSubMenu}>
                                {mi.children.map((sub) => (
                                  <NavLink
                                    key={sub.name}
                                    to={sub.path}
                                    style={({ isActive }) => ({
                                      ...styles.dropdownItem,
                                      backgroundColor: isActive ? "#fee2e2" : "transparent",
                                      color: isActive ? "#dc2626" : "#64748b",
                                    })}
                                  >
                                    {sub.name}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
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
                        )
                      )}
                    </div>
                  )}
                </>
              ) : (
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>
    </header>
  );
}
