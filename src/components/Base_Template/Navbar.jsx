import { useState, useEffect, useRef } from "react";
import { 
  ChevronRight, Menu, X, LogOut, LayoutDashboard, Users, Megaphone, 
  Wrench, Target, Warehouse, Truck, UserCog, Settings, Briefcase,
  FileText, Calendar, Clock, UserCheck, Award, DollarSign, Car,
  ClipboardList, UserPlus, Shield, Building2
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import api from "../../api/client";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = user?.name || user?.email || "User";
  const userLevel = user?.user_level || "User";
  const isAdmin = userLevel === "Admin" || userLevel === "Super Admin";

  const [menuTree, setMenuTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const sidebarRef = useRef(null);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Outside click close for mobile
  useEffect(() => {
    const onDocumentClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target) && isMobile) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [isMobile]);

  // Icon mapping for user menu items based on name
  const getIconForMenuItem = (name) => {
    const iconMap = {
      'dashboard': LayoutDashboard,
      'hr': Users,
      'administration': Shield,
      'marketing': Megaphone,
      'services': Wrench,
      'projects': Target,
      'vehicle management': Car,
      'vehicle': Car,
      'imc connect': Briefcase,
      'planet': Target,
      'imc drive': FileText,
      'public folder': FileText,
      'sysmac': Settings,
      'social media': Megaphone,
      'accounts': DollarSign,
      'user management': UserCog,
      'master': Settings,
      'cv management': FileText,
      'interview management': Briefcase,
      'offer letter': FileText,
      'employee management': Users,
      'attendance': Calendar,
      'salary certificate': DollarSign,
      'experience certificate': Award,
      'duties and responsibility': ClipboardList,
      'department': Building2,
    };

    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    return FileText; // Default icon
  };

  // Format menu item
  function formatMenuItem(item) {
    if (!item) return null;

    const name = item.name || item.title || "menu";
    const key = item.key || item.id || name;

    return {
      id: item.id,
      key: key,
      name: name,
      title: name,
      path: item.path || `/${key.toString().toLowerCase().replace(/\s+/g, "-")}`,
      icon: getIconForMenuItem(name),
      children: (item.children || []).map((child) => formatMenuItem(child)),
      allowed_actions: item.allowed_actions || {
        can_view: item.can_view ?? true,
        can_edit: item.can_edit ?? false,
        can_delete: item.can_delete ?? false,
      },
    };
  }

  // Fetch menu tree
  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      try {
        if (!isAdmin) {
          const response = await api.get("/user-controll/my-menu/");
          console.log("User Menu Response:", response.data);
          const menuArr = response.data?.menu || [];
          const formatted = menuArr.map((item) => formatMenuItem(item));
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

  // Toggle dropdown
  const toggleDropdown = (menuName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Admin menu items
  const adminNavItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { 
      name: "HR Management", 
      icon: Users,
      hasDropdown: true,
      children: [
        { name: "CV Management", path: "/cv-management", icon: FileText },
        { name: "Interview Management", path: "/interview-management", icon: Briefcase },
        { name: "Offer Letter", path: "/offer-letter", icon: FileText },
        { name: "Employee Management", path: "/employee-management", icon: Users },
        { name: "Attendance Management", path: "/attendance-management", icon: Calendar },
        { name: "Punch In/Punch Out", path: "/punch-in-out", icon: Clock },
        {
          name: "Leave Management",
          icon: ClipboardList,
          children: [
            { name: "Leave List", path: "/leave-management/leave-list", icon: FileText },
            { name: "Early List", path: "/leave-management/early-list", icon: Clock },
            { name: "Late List", path: "/leave-management/late-list", icon: Clock },
       
          ],
        },
        {
          name: "Request",
          icon: ClipboardList,
          children: [
            { name: "Leave Request", path: "/hr/request/leave", icon: FileText },
            { name: "Late Request", path: "/hr/request/late", icon: Clock },
            { name: "Early Request", path: "/hr/request/early", icon: Clock },
          ],
        },
        { name: "Experience Certificate", path: "/experience-certificate", icon: Award },
        { name: "Salary Certificate", path: "/salary-certificate", icon: DollarSign },
      ]
    },
    {
      name: "Marketing",
      path: "/under-construction",
      icon: Megaphone
    },
    {
      name: "Vehicle Management",
      path: "/under-construction",
      icon: Car
    },
    {
      name: "Target Management",
      path: "/under-construction",
      icon: Target
    },
    {
      name: "Warehouse Management",
      path: "/under-construction",
      icon: Warehouse
    },
    {
      name: "Delivery Management",
      path: "/under-construction",
      icon: Truck
    },
    { 
      name: "User Management", 
      icon: UserCog,
      hasDropdown: true,
      children: [
        { name: "Add User", path: "/add-user", icon: UserPlus },
        { name: "User Control", path: "/user-control", icon: Shield },
      ]
    },
    { 
      name: "Master", 
      icon: Settings,
      hasDropdown: true,
      children: [
        { name: "Department", path: "/master/department", icon: Building2 },
        { name: "Job Titles", path: "/master/job-titles", icon: Briefcase },
      ]
    },
  ];

  const navItems = isAdmin ? adminNavItems : menuTree;

  // Render menu items recursively
  const renderMenuItems = (items, parentKey = "", level = 0) => {
    return items.map((item, index) => {
      const itemKey = `${parentKey}-${item.name}-${index}`;
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openDropdowns[itemKey];
      const isActive = location.pathname === item.path;
      const IconComponent = item.icon;

      if (hasChildren) {
        return (
          <div key={itemKey}>
            <div
              onClick={() => toggleDropdown(itemKey)}
              style={{
                ...styles.menuItem,
                paddingLeft: `${16 + level * 16}px`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {IconComponent && <IconComponent size={18} style={{ marginRight: "12px", color: "#64748b" }} />}
              <span style={{ flex: 1, fontSize: "14px", fontWeight: "500" }}>
                {item.name}
              </span>
              <ChevronRight
                size={16}
                style={{
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  color: "#94a3b8"
                }}
              />
            </div>
            {isOpen && (
              <div style={{ overflow: "hidden" }}>
                {renderMenuItems(item.children, itemKey, level + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <NavLink
          key={itemKey}
          to={item.path || `/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
          style={({ isActive }) => ({
            ...styles.menuItem,
            paddingLeft: `${16 + level * 16}px`,
            textDecoration: "none",
            display: "flex",
            backgroundColor: isActive ? "#fee2e2" : "transparent",
            color: isActive ? "#dc2626" : "#475569",
            borderLeft: isActive ? "3px solid #dc2626" : "3px solid transparent",
          })}
          onClick={closeMobileMenu}
          onMouseEnter={(e) => {
            if (!e.currentTarget.classList.contains('active')) {
              e.currentTarget.style.backgroundColor = "#f8fafc";
            }
          }}
          onMouseLeave={(e) => {
            const isLinkActive = location.pathname === item.path;
            if (!isLinkActive) {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          {IconComponent && <IconComponent size={18} style={{ marginRight: "12px", color: isActive ? "#dc2626" : "#64748b" }} />}
          <span style={{ fontSize: "14px", fontWeight: "500" }}>{item.name}</span>
        </NavLink>
      );
    });
  };

  const styles = {
    sidebar: {
      width: isMobile ? (mobileMenuOpen ? "280px" : "0") : "280px",
      backgroundColor: "#ffffff",
      boxShadow: "2px 0 12px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      position: isMobile ? "fixed" : "fixed",
      left: 0,
      top: 0,
      height: "100vh",
      zIndex: 1000,
      transition: "all 0.3s ease",
      overflow: "hidden",
    },
    header: {
      padding: "20px 16px",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#ffffff",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    menuContainer: {
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      padding: "12px 0",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      transition: "all 0.2s ease",
      borderLeft: "3px solid transparent",
      color: "#475569",
    },
    userSection: {
      padding: "16px",
      borderTop: "1px solid #f1f5f9",
      backgroundColor: "#fafafa",
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "12px",
    },
    logoutButton: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#dc2626",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "background-color 0.2s",
    },
    mobileToggle: {
      position: "fixed",
      top: "20px",
      left: "20px",
      zIndex: 1001,
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "10px",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      display: isMobile ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 999,
      display: isMobile && mobileMenuOpen ? "block" : "none",
    },
  };

  if (loading && !isAdmin) {
    return (
      <>
        <div style={styles.mobileToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} color="#1e293b" />
        </div>
        <aside style={styles.sidebar} ref={sidebarRef}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <img
                src="/assets/omega-logo.png"
                alt="Omega"
                style={{ height: "32px", objectFit: "contain" }}
              />
            </div>
          </div>
          <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>
            Loading menu...
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      <div 
        style={styles.mobileToggle}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} color="#1e293b" /> : <Menu size={24} color="#1e293b" />}
      </div>

      <div 
        style={styles.overlay}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside style={styles.sidebar} ref={sidebarRef}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <img
              src="/assets/omega-logo.png"
              alt="Omega"
              style={{ height: "32px", objectFit: "contain" }}
            />
          </div>
        </div>

        <div style={styles.menuContainer}>
          {navItems.length === 0 && !isAdmin && !loading ? (
            <div style={{ padding: "16px", color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
              No menus assigned. Please contact administrator.
            </div>
          ) : (
            renderMenuItems(navItems)
          )}
        </div>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <img
              src={user?.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40"}
              alt="User"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #fee2e2",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {username}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {userLevel}
              </div>
            </div>
          </div>
          <button
            style={styles.logoutButton}
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#b91c1c"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#dc2626"}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}