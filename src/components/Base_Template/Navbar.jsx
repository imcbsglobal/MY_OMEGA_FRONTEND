import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import api from "../../api/client";

// IMPORTANT: Import your master menuList
import menuList from "../../constants/menuList";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || user?.email || "User";
  const userLevel = user?.user_level || "User";
  const isAdmin = userLevel === "Admin" || userLevel === "Super Admin";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const location = useLocation();
  const navRef = useRef(null);
  const profileRef = useRef(null);

  // ---------------- HANDLE RESIZE ----------------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // close dropdowns on outside click
  useEffect(() => {
    const onDocumentClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        // clicked outside nav: close mobile menu and dropdowns
        setMobileMenuOpen(false);
        setHrDropdownOpen(false);
        setVehicleDropdownOpen(false);
        setUserDropdownOpen(false);
        setMasterDropdownOpen(false);
        setRequestDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  // ---------------- FILTER MENU BASED ON menu_ids ----------------
  function buildUserMenu(menuIds) {
    const filterRecursively = (menu) => {
      if (!menuIds.includes(menu.id)) return null;

      const children =
        menu.children
          ?.map(filterRecursively)
          .filter((c) => c !== null) || [];

      return { ...menu, children };
    };

    return menuList
      .map(filterRecursively)
      .filter((m) => m !== null);
  }

  // ---------------- FETCH USER MENU PERMISSIONS ----------------
  useEffect(() => {
    if (!isAdmin && user?.id) {
      api
        .get(`/user-controll/admin/user/${user.id}/menus/`)
        .then((res) => {
          const menuIds = res.data.menu_ids || [];
          const filteredTree = buildUserMenu(menuIds);

          setMenuTree(filteredTree);
          localStorage.setItem("menuTree", JSON.stringify(filteredTree));
        })
        .catch((err) => {
          console.error("❌ Failed to fetch user menu:", err);
        });
    }
  }, [isAdmin, user?.id]);

  // ---------------- BUILD NAV FROM TREE ----------------
  function buildNavFromTree(tree = []) {
    return tree.map((root) => {
      const rootPath =
        root.path && root.path.startsWith("/")
          ? root.path
          : `/${(root.key || root.title || root.name)
              .toLowerCase()
              .replace(/\s+/g, "-")}`;

      const children = (root.children || []).map((c) => ({
        name: c.title || c.name,
        path:
          c.path && c.path.startsWith("/")
            ? c.path
            : `/${(c.key || c.title || c.name)
                .toLowerCase()
                .replace(/\s+/g, "-")}`,
      }));

      return {
        name: root.title || root.name,
        path: rootPath,
        hasDropdown: children.length > 0,
        children,
      };
    });
  }

  // ---------------- ADMIN MENU (unchanged) ----------------
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

  // ---------------- HR MENUS (ADMIN) ----------------
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

  // ---------------- VEHICLE MENUS (ADMIN) ----------------
  const vehicleMenuItems = [
    { name: "Company Vehicle", path: "/company-vehicle" },
    { name: "Non Company Vehicle", path: "/non-company-vehicle" },
  ];

  // ---------------- USER MENUS (ADMIN) ----------------
  const userMenuItems = [
    { name: "Add User", path: "/add-user" },
    { name: "User Control", path: "/user-control" },
  ];

  // ---------------- MASTER MENUS ----------------
  const masterMenuItems = [
    { name: "Job Titles", path: "/master/job-titles" },
    { name: "List", path: "/master/job-titles/list" },
  ];

  // ---------------- STYLES ----------------
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
    <header style={styles.navbarContainer} ref={navRef}>
      {/* ---------------- TOP NAVBAR ---------------- */}
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

        {/* ---------------- MOBILE ICON ---------------- */}
        <div style={{ display: isMobile ? "block" : "none", cursor: "pointer" }}>
          {mobileMenuOpen ? (
            <X size={30} onClick={() => setMobileMenuOpen(false)} />
          ) : (
            <Menu size={30} onClick={() => setMobileMenuOpen(true)} />
          )}
        </div>

        {/* ---------------- PROFILE DROPDOWN ---------------- */}
        {!isMobile && (
          <div style={{ position: "relative" }} ref={profileRef}>
            <img
              src={
                user?.photo ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40"
              }
              alt="User"
              style={{ width: 42, height: 42, borderRadius: "50%", cursor: "pointer" }}
              onClick={() => setProfileDropdownOpen((s) => !s)}
            />

            {profileDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "70px",
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  padding: "12px",
                  width: "220px",
                  zIndex: 3000,
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

      {/* ---------------- BOTTOM NAVBAR ---------------- */}
      <nav style={styles.bottomNavbar}>
        {navItems.map((item) => {
          const isDropdown =
            item.hasDropdown &&
            ["HR Management", "Vehicle Management", "User Management", "Master"].includes(item.name);

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
              {/* ---- MAIN NAV ITEM ---- */}
              {isDropdown ? (
                <>
                  <NavLink
                    to={`/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    style={({ isActive }) => ({
                      ...styles.navLink,
                      color: isActive ? "#dc2626" : styles.navLink.color,
                      borderBottomColor: isActive ? "#dc2626" : "transparent",
                    })}
                    onClick={(e) => {
                      // MOBILE: toggle dropdown instead of navigating
                      if (isMobile) {
                        e.preventDefault();
                        // toggle only the clicked dropdown, close others
                        setHrDropdownOpen((s) => (item.name === "HR Management" ? !s : false));
                        setVehicleDropdownOpen((s) => (item.name === "Vehicle Management" ? !s : false));
                        setUserDropdownOpen((s) => (item.name === "User Management" ? !s : false));
                        setMasterDropdownOpen((s) => (item.name === "Master" ? !s : false));
                        // make sure mobile menu stays open
                        setMobileMenuOpen(true);
                      } else {
                        // desktop: prevent navigation and rely on hover/toggle
                        e.preventDefault();
                        if (item.name === "HR Management") setHrDropdownOpen((s) => !s);
                        if (item.name === "Vehicle Management") setVehicleDropdownOpen((s) => !s);
                        if (item.name === "User Management") setUserDropdownOpen((s) => !s);
                        if (item.name === "Master") setMasterDropdownOpen((s) => !s);
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

                  {/* ---- DROPDOWN ---- */}
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
                                    onClick={() => {
                                      // close mobile menu after navigation
                                      setMobileMenuOpen(false);
                                      setHrDropdownOpen(false);
                                      setVehicleDropdownOpen(false);
                                      setUserDropdownOpen(false);
                                      setMasterDropdownOpen(false);
                                      setRequestDropdownOpen(false);
                                    }}
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
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setHrDropdownOpen(false);
                              setVehicleDropdownOpen(false);
                              setUserDropdownOpen(false);
                              setMasterDropdownOpen(false);
                            }}
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
