  import { useState, useEffect, useRef } from "react";
  import { 
    ChevronRight, Menu, X, LogOut, LayoutDashboard, Users, Megaphone, 
    Wrench, Target, Warehouse, Truck, UserCog, Settings, Briefcase,
    FileText, Calendar, Clock, UserCheck, Award, DollarSign, Car,
    ClipboardList, UserPlus, Shield, Building2, PanelLeftClose, PanelLeft,
    ChevronDown
  } from "lucide-react";
  import { NavLink, useLocation, useNavigate } from "react-router-dom";
  import api from "../../api/client";

  export default function Navbar({ onCollapseChange }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const username = user?.name || user?.email || "User";
    const userLevel = user?.user_level || "User";
    const isAdmin = userLevel === "Admin" || userLevel === "Super Admin";

    const [menuTree, setMenuTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const [activeNestedSubmenu, setActiveNestedSubmenu] = useState(null);
    const [expandedMobileMenus, setExpandedMobileMenus] = useState([]);
    const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 280 });
    const [nestedSubmenuPosition, setNestedSubmenuPosition] = useState({ top: 0, left: 540 });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showExpandIcon, setShowExpandIcon] = useState(false);

    const location = useLocation();
    const sidebarRef = useRef(null);
    const submenuRef = useRef(null);
    const nestedSubmenuRef = useRef(null);

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

    useEffect(() => {
      if (onCollapseChange) {
        onCollapseChange(isCollapsed);
      }
    }, [isCollapsed, onCollapseChange]);

    useEffect(() => {
      const onDocumentClick = (e) => {
        if (
          sidebarRef.current && 
          !sidebarRef.current.contains(e.target) && 
          submenuRef.current &&
          !submenuRef.current.contains(e.target) &&
          nestedSubmenuRef.current &&
          !nestedSubmenuRef.current.contains(e.target) &&
          isMobile
        ) {
          setMobileMenuOpen(false);
          setActiveSubmenu(null);
          setActiveNestedSubmenu(null);
        }
      };
      document.addEventListener("mousedown", onDocumentClick);
      return () => document.removeEventListener("mousedown", onDocumentClick);
    }, [isMobile]);

    useEffect(() => {
      if (!isAdmin && location.pathname === "/") {
        navigate("/punch-in-out", { replace: true });
      }
    }, [isAdmin, location.pathname, navigate]);

    const getIconForMenuItem = (name) => {
      const iconMap = {
        'dashboard': LayoutDashboard,
        'recruitment': Users,
        'hr management': Users,
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
        'attendance management': Calendar,
        'punch in': Clock,
        'punch out': Clock,
        'punch in/punch out': Clock,
        'leave management': ClipboardList,
        'leave list': FileText,
        'early list': Clock,
        'late list': Clock,
        'request': ClipboardList,
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
      return FileText;
    };

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

    useEffect(() => {
      const fetchMenus = async () => {
        setLoading(true);
        try {
          if (!isAdmin) {
            const response = await api.get("/user-controll/my-menu/");
            const menuArr = response.data?.menu || [];
            const formatted = menuArr.map((item) => formatMenuItem(item));
            setMenuTree(formatted);
            localStorage.setItem("menuTree", JSON.stringify(formatted));
          } else {
            setMenuTree([]);
          }
        } catch (error) {
          console.error("⚠️ Failed to load user menu:", error);
          const cached = JSON.parse(localStorage.getItem("menuTree") || "[]");
          if (cached.length > 0) {
            setMenuTree(cached);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchMenus();
    }, [isAdmin]);

    const closeMobileMenu = () => {
      if (isMobile) {
        setMobileMenuOpen(false);
      }
      setActiveSubmenu(null);
      setActiveNestedSubmenu(null);
      setExpandedMobileMenus([]);
    };

    const adminNavItems = [
      { name: "Dashboard", path: "/", icon: LayoutDashboard },
      { 
        name: "HR Management", 
        icon: Users,
        children: [
          { 
            name: "Recruitment", 
            icon: Users,
            children: [
              { name: "CV Management", path: "/cv-management", icon: FileText },
              { name: "Interview Management", path: "/interview-management", icon: Briefcase },
              { name: "Offer Letter", path: "/offer-letter", icon: FileText },
            ]
          },
          { name: "Attendance Management", path: "/attendance-management", icon: Calendar },
          { name: "Punch In/Punch Out", path: "/punch-in-out", icon: Clock },
          {
            name: "HR Master",
            icon: Settings,
            children: [
              { name: "Employee Management", path: "/employee-management", icon: Users },
              { name: "Job Titles", path: "/master/job-titles", icon: Briefcase },
              { name: "Leave Types", path: "/master/leave-types", icon: ClipboardList },
              { name: "Salary Certificate", path: "/hr/salary-certificate", icon: DollarSign },
              { name: "Experience Certificate", path: "/hr/experience-certificate", icon: Award },
            ]
          },
          {
            name: "Leave Management",
            icon: ClipboardList,
            children: [
              { name: "Leave List", path: "/leave-management/leave-list", icon: FileText },
              { name: "Early List", path: "/leave-management/early-list", icon: Clock },
              { name: "Late List", path: "/leave-management/late-list", icon: Clock },
            ]
          },
          {
            name: "Request",
            icon: ClipboardList,
            children: [
              { name: "Leave Request", path: "/hr/request/leave", icon: FileText },
              { name: "Late Request", path: "/hr/request/late", icon: Clock },
              { name: "Early Request", path: "/hr/request/early", icon: Clock },
            ]
          },
        ]
      },
      { name: "Marketing", path: "/under-construction", icon: Megaphone },
      { name: "Vehicle Management", path: "/under-construction", icon: Car },
      { name: "Target Management", path: "/under-construction", icon: Target },
      { name: "Warehouse Management", path: "/under-construction", icon: Warehouse },
      { name: "Delivery Management", path: "/under-construction", icon: Truck },
      { 
        name: "User Management", 
        icon: UserCog,
        children: [
          { name: "Add User", path: "/add-user", icon: UserPlus },
          { name: "User Control", path: "/user-control", icon: Shield },
        ]
      },
      { 
        name: "Master", 
        icon: Settings,
        children: [
          { name: "Department", path: "/master/department", icon: Building2 },
        ]
      },
    ];

    const navItems = isAdmin ? adminNavItems : menuTree;

    const handleMenuClick = (item, event, itemKey) => {
      if (item.children && item.children.length > 0) {
        event.preventDefault();
        
        if (!isMobile) {
          // Desktop behavior - horizontal submenu
          const rect = event.currentTarget.getBoundingClientRect();
          const sidebarWidth = isCollapsed ? 70 : 280;
          setSubmenuPosition({
            top: rect.top,
            left: sidebarWidth
          });
        }
        
        setActiveSubmenu(activeSubmenu === itemKey ? null : itemKey);
        setActiveNestedSubmenu(null);
      } else {
        setActiveSubmenu(null);
        setActiveNestedSubmenu(null);
        closeMobileMenu();
      }
    };

    const handleNestedMenuClick = (item, event, itemKey) => {
      if (item.children && item.children.length > 0) {
        event.preventDefault();
        
        if (!isMobile) {
          // Desktop behavior - horizontal nested submenu
          const rect = event.currentTarget.getBoundingClientRect();
          setNestedSubmenuPosition({
            top: rect.top,
            left: submenuPosition.left + 260
          });
        }
        
        setActiveNestedSubmenu(activeNestedSubmenu === itemKey ? null : itemKey);
      } else {
        setActiveNestedSubmenu(null);
        closeMobileMenu();
      }
    };

    const renderMobileSubmenu = (items, parentKey = "", level = 1) => {
      return items.map((item, index) => {
        const itemKey = `${parentKey}-sub-${item.name}-${index}`;
        const hasChildren = item.children && item.children.length > 0;
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon;
        
        // Check if this specific item is expanded
        const isExpanded = expandedMobileMenus.includes(itemKey);

        if (hasChildren) {
          return (
            <div key={itemKey}>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Toggle the nested submenu in the array
                  setExpandedMobileMenus(prev => 
                    prev.includes(itemKey) 
                      ? prev.filter(key => key !== itemKey)
                      : [...prev, itemKey]
                  );
                }}
                style={{
                  ...styles.mobileSubmenuItem,
                  backgroundColor: isExpanded ? "#fee2e2" : "transparent",
                  color: isExpanded ? "#dc2626" : "#475569",
                  paddingLeft: `${16 + (level * 12)}px`,
                }}
              >
                {IconComponent && <IconComponent size={16} style={{ marginRight: "10px", color: isExpanded ? "#dc2626" : "#64748b" }} />}
                <span style={{ flex: 1, fontSize: "13px", fontWeight: "500" }}>
                  {item.name}
                </span>
                <ChevronDown 
                  size={14} 
                  style={{ 
                    color: "#94a3b8",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s"
                  }} 
                />
              </div>
              {isExpanded && (
                <div style={{ backgroundColor: level === 1 ? "#f1f5f9" : "#e2e8f0" }}>
                  {renderMobileSubmenu(item.children, itemKey, level + 1)}
                </div>
              )}
            </div>
          );
        }

        return (
          <NavLink
            key={itemKey}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.mobileSubmenuItem,
              textDecoration: "none",
              display: "flex",
              backgroundColor: isActive ? "#fee2e2" : "transparent",
              color: isActive ? "#dc2626" : "#475569",
              paddingLeft: `${16 + (level * 12)}px`,
            })}
            onClick={closeMobileMenu}
          >
            {IconComponent && <IconComponent size={16} style={{ marginRight: "10px", color: isActive ? "#dc2626" : "#64748b" }} />}
            <span style={{ fontSize: "13px", fontWeight: "500" }}>{item.name}</span>
          </NavLink>
        );
      });
    };

    const renderMainMenuItems = (items) => {
      return items.map((item, index) => {
        const itemKey = `main-${item.name}-${index}`;
        const hasChildren = item.children && item.children.length > 0;
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon;
        const isSubmenuActive = activeSubmenu === itemKey;

        if (hasChildren) {
          return (
            <div key={itemKey}>
              <div
                onClick={(e) => handleMenuClick(item, e, itemKey)}
                title={isCollapsed ? item.name : ""}
                style={{
                  ...styles.menuItem,
                  cursor: "pointer",
                  backgroundColor: isSubmenuActive ? "#fee2e2" : "transparent",
                  color: isSubmenuActive ? "#dc2626" : "#475569",
                  borderLeft: isSubmenuActive ? "3px solid #dc2626" : "3px solid transparent",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmenuActive) {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmenuActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {IconComponent && <IconComponent size={18} style={{ marginRight: isCollapsed ? "0" : "12px", color: isSubmenuActive ? "#dc2626" : "#64748b" }} />}
                {!isCollapsed && (
                  <>
                    <span style={{ flex: 1, fontSize: "14px", fontWeight: "500" }}>
                      {item.name}
                    </span>
                    {isMobile ? (
                      <ChevronDown 
                        size={16} 
                        style={{ 
                          color: "#94a3b8",
                          transform: isSubmenuActive ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s"
                        }} 
                      />
                    ) : (
                      <ChevronRight size={16} style={{ color: "#94a3b8" }} />
                    )}
                  </>
                )}
              </div>
              {isMobile && isSubmenuActive && item.children && (
                <div style={{ backgroundColor: "#f8fafc" }}>
                  {renderMobileSubmenu(item.children, itemKey)}
                </div>
              )}
            </div>
          );
        }

        return (
          <NavLink
            key={itemKey}
            to={item.path}
            title={isCollapsed ? item.name : ""}
            style={({ isActive }) => ({
              ...styles.menuItem,
              textDecoration: "none",
              display: "flex",
              backgroundColor: isActive ? "#fee2e2" : "transparent",
              color: isActive ? "#dc2626" : "#475569",
              borderLeft: isActive ? "3px solid #dc2626" : "3px solid transparent",
              justifyContent: isCollapsed ? "center" : "flex-start",
            })}
            onClick={closeMobileMenu}
            onMouseEnter={(e) => {
              const isLinkActive = location.pathname === item.path;
              if (!isLinkActive) {
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
            {IconComponent && <IconComponent size={18} style={{ marginRight: isCollapsed ? "0" : "12px", color: isActive ? "#dc2626" : "#64748b" }} />}
            {!isCollapsed && <span style={{ fontSize: "14px", fontWeight: "500" }}>{item.name}</span>}
          </NavLink>
        );
      });
    };

    const renderSubmenuItems = (items, parentKey = "") => {
      return items.map((item, index) => {
        const itemKey = `${parentKey}-sub-${item.name}-${index}`;
        const hasChildren = item.children && item.children.length > 0;
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon;
        const isNestedSubmenuActive = activeNestedSubmenu === itemKey;

        if (hasChildren) {
          return (
            <div
              key={itemKey}
              onClick={(e) => handleNestedMenuClick(item, e, itemKey)}
              style={{
                ...styles.submenuItem,
                cursor: "pointer",
                backgroundColor: isNestedSubmenuActive ? "#fee2e2" : "transparent",
                color: isNestedSubmenuActive ? "#dc2626" : "#475569",
              }}
              onMouseEnter={(e) => {
                if (!isNestedSubmenuActive) {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }
              }}
              onMouseLeave={(e) => {
                if (!isNestedSubmenuActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {IconComponent && <IconComponent size={16} style={{ marginRight: "10px", color: isNestedSubmenuActive ? "#dc2626" : "#64748b" }} />}
              <span style={{ flex: 1, fontSize: "13px", fontWeight: "500" }}>
                {item.name}
              </span>
              <ChevronRight size={14} style={{ color: "#94a3b8" }} />
            </div>
          );
        }

        return (
          <NavLink
            key={itemKey}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.submenuItem,
              textDecoration: "none",
              display: "flex",
              backgroundColor: isActive ? "#fee2e2" : "transparent",
              color: isActive ? "#dc2626" : "#475569",
            })}
            onClick={closeMobileMenu}
            onMouseEnter={(e) => {
              const isLinkActive = location.pathname === item.path;
              if (!isLinkActive) {
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
            {IconComponent && <IconComponent size={16} style={{ marginRight: "10px", color: isActive ? "#dc2626" : "#64748b" }} />}
            <span style={{ fontSize: "13px", fontWeight: "500" }}>{item.name}</span>
          </NavLink>
        );
      });
    };

    const renderNestedSubmenuItems = (items) => {
      return items.map((item, index) => {
        const itemKey = `nested-${item.name}-${index}`;
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon;

        return (
          <NavLink
            key={itemKey}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.submenuItem,
              textDecoration: "none",
              display: "flex",
              backgroundColor: isActive ? "#fee2e2" : "transparent",
              color: isActive ? "#dc2626" : "#475569",
            })}
            onClick={closeMobileMenu}
            onMouseEnter={(e) => {
              const isLinkActive = location.pathname === item.path;
              if (!isLinkActive) {
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
            {IconComponent && <IconComponent size={16} style={{ marginRight: "10px", color: isActive ? "#dc2626" : "#64748b" }} />}
            <span style={{ fontSize: "13px", fontWeight: "500" }}>{item.name}</span>
          </NavLink>
        );
      });
    };

    const getActiveSubmenuContent = () => {
      if (!activeSubmenu) return null;

      const findItem = (items, key) => {
        for (const item of items) {
          const itemKey = `main-${item.name}-${items.indexOf(item)}`;
          if (itemKey === key) return item;
          
          if (item.children) {
            const found = findItem(item.children, key);
            if (found) return found;
          }
        }
        return null;
      };

      const activeItem = findItem(navItems, activeSubmenu);
      return activeItem?.children || null;
    };

    const getActiveNestedSubmenuContent = () => {
      if (!activeNestedSubmenu || !activeSubmenu) return null;

      const submenuContent = getActiveSubmenuContent();
      if (!submenuContent) return null;

      for (let i = 0; i < submenuContent.length; i++) {
        const item = submenuContent[i];
        const itemKey = `${activeSubmenu}-sub-${item.name}-${i}`;
        if (itemKey === activeNestedSubmenu) {
          return item.children || null;
        }
      }

      return null;
    };

    const sidebarWidth = isCollapsed ? 70 : 280;

    const styles = {
      sidebar: {
        width: isMobile ? (mobileMenuOpen ? "280px" : "0") : `${sidebarWidth}px`,
        backgroundColor: "#ffffff",
        boxShadow: "2px 0 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        zIndex: 1000,
        transition: "all 0.3s ease",
        overflow: "hidden",
      },
      submenuPanel: {
        width: "260px",
        backgroundColor: "#ffffff",
        boxShadow: "4px 0 16px rgba(0,0,0,0.12)",
        position: "fixed",
        top: submenuPosition.top,
        left: submenuPosition.left,
        maxHeight: `calc(100vh - ${submenuPosition.top}px)`,
        overflowY: "auto",
        zIndex: 1001,
        borderRadius: "0 8px 8px 0",
        padding: "8px 0",
      },
      nestedSubmenuPanel: {
        width: "260px",
        backgroundColor: "#ffffff",
        boxShadow: "4px 0 16px rgba(0,0,0,0.12)",
        position: "fixed",
        top: nestedSubmenuPosition.top,
        left: nestedSubmenuPosition.left,
        maxHeight: `calc(100vh - ${nestedSubmenuPosition.top}px)`,
        overflowY: "auto",
        zIndex: 1002,
        borderRadius: "0 8px 8px 0",
        padding: "8px 0",
      },
      header: {
        padding: "20px 16px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "space-between",
        backgroundColor: "#ffffff",
      },
      logo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
      },
      collapseButton: {
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        transition: "background-color 0.2s",
      },
      menuContainer: {
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "12px 0",
        scrollbarWidth: "thin",
        scrollbarColor: "#cbd5e1 #f1f5f9",
      },
      menuItem: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        transition: "all 0.2s ease",
        borderLeft: "3px solid transparent",
        color: "#475569",
      },
      submenuItem: {
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        transition: "all 0.2s ease",
        color: "#475569",
      },
      mobileSubmenuItem: {
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        transition: "all 0.2s ease",
        color: "#475569",
        cursor: "pointer",
      },
      userSection: {
        padding: "16px",
        borderTop: "1px solid #f1f5f9",
        backgroundColor: "#fafafa",
        display: isCollapsed ? "none" : "block",
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
        zIndex: 1003,
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
        display: (isMobile && mobileMenuOpen) || (!isMobile && (activeSubmenu || activeNestedSubmenu)) ? "block" : "none",
      },
    };

    if (loading && !isAdmin) {
      return (
        <>
          <div style={styles.mobileToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} color="#1e293b" />
          </div>
          <div style={styles.overlay} onClick={() => setMobileMenuOpen(false)} />
          <aside style={styles.sidebar} ref={sidebarRef}>
            <div style={styles.header}>
              <div style={styles.logo}>
                <img
                  src="/assets/omega-logo.png"
                  alt="Omega"
                  style={{ height: "32px", objectFit: "contain" }}
                />
              </div>
              {isMobile && (
                <X 
                  size={24} 
                  color="#64748b" 
                  style={{ cursor: "pointer" }}
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}
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
          onClick={() => {
            setMobileMenuOpen(false);
            setActiveSubmenu(null);
            setActiveNestedSubmenu(null);
          }}
        />

        <aside 
          style={styles.sidebar} 
          ref={sidebarRef}
          onMouseEnter={() => {
            if (isCollapsed && !isMobile) {
              setShowExpandIcon(true);
            }
          }}
          onMouseLeave={() => {
            if (isCollapsed && !isMobile) {
              setShowExpandIcon(false);
            }
          }}
        >
          <div style={styles.header}>
            {!isCollapsed && (
              <div style={styles.logo}>
                <img
                  src="/assets/omega-logo.png"
                  alt="Omega"
                  style={{ height: "32px", objectFit: "contain" }}
                />
              </div>
            )}
            {!isMobile && !isCollapsed && (
              <button
                style={styles.collapseButton}
                onClick={() => setIsCollapsed(!isCollapsed)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                title="Collapse"
              >
                <PanelLeftClose 
                  size={20} 
                  color="#64748b"
                />
              </button>
            )}
          </div>

          <div style={styles.menuContainer}>
            {isCollapsed && !isMobile && showExpandIcon && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f1f5f9",
                  marginBottom: "8px"
                }}
              >
                <button
                  style={{
                    ...styles.collapseButton,
                    backgroundColor: "transparent"
                  }}
                  onClick={() => setIsCollapsed(false)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  title="Expand"
                >
                  <PanelLeft 
                    size={20} 
                    color="#64748b"
                  />
                </button>
              </div>
            )}
            {navItems.length === 0 && !isAdmin && !loading ? (
              <div style={{ padding: "16px", color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
                {isCollapsed ? "No menu" : "No menus assigned. Please contact administrator."}
              </div>
            ) : (
              renderMainMenuItems(navItems)
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

        {!isMobile && activeSubmenu && getActiveSubmenuContent() && (
          <div style={styles.submenuPanel} ref={submenuRef}>
            {renderSubmenuItems(getActiveSubmenuContent(), activeSubmenu)}
          </div>
        )}

        {!isMobile && activeNestedSubmenu && getActiveNestedSubmenuContent() && (
          <div style={styles.nestedSubmenuPanel} ref={nestedSubmenuRef}>
            {renderNestedSubmenuItems(getActiveNestedSubmenuContent())}
          </div>
        )}
      </>
    );
  }