import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import api from "../../api/client";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = user?.name || user?.email || "User";
  const userLevel = user?.user_level || "User";
  const isAdmin = userLevel === "Admin" || userLevel === "Super Admin";

  const [menuTree, setMenuTree] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dropdown states
  const [openDropdowns, setOpenDropdowns] = useState({});
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

  // ---------------- OUTSIDE CLICK CLOSE ----------------
  useEffect(() => {
    const onDocumentClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
        setOpenDropdowns({});
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  // ---------------- FORMAT MENU FROM BACKEND ----------------
function formatMenuItem(item) {
  if (!item) return null;

  const name = item.name || item.title || "menu";
  const key = item.key || item.id || name;

  return {
    id: item.id,
    key: key,
    name: name,
    title: name,
    path:
      item.path ||
      `/${key.toString().toLowerCase().replace(/\s+/g, "-")}`,

    children: (item.children || []).map((child) => formatMenuItem(child)),

    allowed_actions: item.allowed_actions || {
      can_view: item.can_view ?? true,
      can_edit: item.can_edit ?? false,
      can_delete: item.can_delete ?? false,
    },
  };
}




  // ---------------- FETCH MENU TREE ----------------
useEffect(() => {
  const fetchMenus = async () => {
    setLoading(true);
    try {
      if (!isAdmin) {
        // Normal User → Fetch assigned menus
        const response = await api.get("/user-controll/my-menu/");
        console.log("User Menu Response:", response.data);

        const menuArr = response.data?.menu || [];   // ✅ FIX 1: Extract actual menu array

        const formatted = menuArr.map((item) => formatMenuItem(item));  // ✅ FIX 2: Format correctly
        console.log("Formatted Menu:", formatted);

        setMenuTree(formatted);
        localStorage.setItem("menuTree", JSON.stringify(formatted));
      } else {
        setMenuTree([]);
      }
    } catch (error) {
      console.error("❌ Failed to load user menu:", error);

      const cached = JSON.parse(localStorage.getItem("menuTree") || "[]");
      if (cached.length > 0) {
        setMenuTree(cached);
        console.log("Using cached menu");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchMenus();
}, [isAdmin]);

  // ---------------- TOGGLE DROPDOWN ----------------
  const toggleDropdown = (menuName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns({});
    setMobileMenuOpen(false);
  };

  // ---------------- ADMIN MENU (STATIC) ----------------
  const adminNavItems = [
    { name: "Dashboard", path: "/" },
    { 
      name: "HR Management", 
      hasDropdown: true,
      children: [
        { name: "CV Management", path: "/cv-management" },
        { name: "Interview Management", path: "/interview-management" },
        { name: "Offer Letter", path: "/offer-letter" },
        { name: "Employee Management", path: "/employee-management" },
        { name: "Attendance Management", path: "/attendance-management" },
        { name: "Punch In/Punch Out", path: "/punch-in-out" },
        {
          name: "Leave Management",
          children: [
            { name: "Leave List", path: "/leave-management/leave-list" },
            { name: "Early List", path: "/leave-management/early-list" },
            { name: "Late List", path: "/leave-management/late-list" },
            { name: "Break List", path: "/leave-management/break-list" },

          ],
        },
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
      ]
    },
    { name: "Marketing", path: "/marketing" },
    { 
      name: "Vehicle Management", 
      hasDropdown: true,
      children: [
        { name: "Company Vehicle", path: "/company-vehicle" },
        { name: "Non Company Vehicle", path: "/non-company-vehicle" },
      ]
    },
    { name: "Target Management", path: "/target-management" },
    { name: "Warehouse Management", path: "/warehouse-management" },
    { name: "Delivery Management", path: "/delivery-management" },
    { 
      name: "User Management", 
      hasDropdown: true,
      children: [
        { name: "Add User", path: "/add-user" },
        { name: "User Control", path: "/user-control" },
      ]
    },
    { 
      name: "Master", 
      hasDropdown: true,
      children: [
        { name: "Job Titles", path: "/master/job-titles" },
        { name: "List", path: "/master/job-titles/list" },
      ]
    },
  ];

  // Use admin menu or user menu based on role
  const navItems = isAdmin ? adminNavItems : menuTree;

  // ---------------- RENDER DROPDOWN ITEMS ----------------
  const renderDropdownItems = (items, parentKey = "") => {
    return items.map((item, index) => {
      const itemKey = `${parentKey}-${item.name}-${index}`;
      
      if (item.children && item.children.length > 0) {
        return (
          <div
            key={itemKey}
            style={{ position: "relative" }}
            onMouseEnter={() => !isMobile && toggleDropdown(itemKey)}
            onMouseLeave={() => !isMobile && toggleDropdown(itemKey)}
          >
            <div
              style={{
                ...styles.dropdownItem,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onClick={() => isMobile && toggleDropdown(itemKey)}
            >
              {item.name}
              <ChevronDown
                size={14}
                style={{
                  transform: openDropdowns[itemKey] ? "rotate(-90deg)" : "rotate(0deg)",
                  transition: "0.3s",
                }}
              />
            </div>

            {openDropdowns[itemKey] && (
              <div style={styles.requestSubMenu}>
                {renderDropdownItems(item.children, itemKey)}
              </div>
            )}
          </div>
        );
      }

      return (
        <NavLink
          key={itemKey}
          to={item.path}
          onClick={closeAllDropdowns}
          style={({ isActive }) => ({
            ...styles.dropdownItem,
            backgroundColor: isActive ? "#fee2e2" : "transparent",
            color: isActive ? "#dc2626" : "#64748b",
          })}
        >
          {item.name}
        </NavLink>
      );
    });
  };

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
      marginTop: "2px",
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
      marginLeft: "2px",
    },
  };

  // Show loading state
  if (loading && !isAdmin) {
    return (
      <header style={styles.navbarContainer}>
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
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Loading menu...</div>
        </div>
      </header>
    );
  }

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

        {/* ---------------- MOBILE MENU ICON ---------------- */}
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
        {navItems.length === 0 && !isAdmin && !loading ? (
          <div style={{ padding: "10px", color: "#6b7280", fontSize: "14px" }}>
            No menus assigned. Please contact administrator.
          </div>
        ) : (
          navItems.map((item, index) => {
            const itemKey = `nav-${item.name}-${index}`;
            const hasDropdown = item.hasDropdown || (item.children && item.children.length > 0);

            return (
              <div
                key={itemKey}
                onMouseEnter={() => !isMobile && hasDropdown && toggleDropdown(itemKey)}
                onMouseLeave={() => !isMobile && hasDropdown && toggleDropdown(itemKey)}
                style={{ position: "relative" }}
              >
                {hasDropdown ? (
                  <>
                    <div
                      style={{
                        ...styles.navLink,
                        cursor: "pointer",
                        color: location.pathname.startsWith(item.path || `/${item.name.toLowerCase()}`) 
                          ? "#dc2626" 
                          : "#475569",
                        borderBottomColor: location.pathname.startsWith(item.path || `/${item.name.toLowerCase()}`)
                          ? "#dc2626"
                          : "transparent",
                      }}
                      onClick={() => {
                        if (isMobile) {
                          toggleDropdown(itemKey);
                        }
                      }}
                    >
                      {item.name}
                      <ChevronDown
                        size={16}
                        style={{
                          transform: openDropdowns[itemKey] ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "0.3s",
                        }}
                      />
                    </div>

                    {openDropdowns[itemKey] && (
                      <div style={styles.dropdownMenu}>
                        {renderDropdownItems(item.children || [], itemKey)}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path || `/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    style={({ isActive }) => ({
                      ...styles.navLink,
                      color: isActive ? "#dc2626" : styles.navLink.color,
                      borderBottomColor: isActive ? "#dc2626" : "transparent",
                    })}
                    onClick={closeAllDropdowns}
                  >
                    {item.name}
                  </NavLink>
                )}
              </div>
            );
          })
        )}
      </nav>
    </header>
  );
}