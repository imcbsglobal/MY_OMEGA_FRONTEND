import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaUserCog,
  FaHome,
  FaUsers,
  FaUserTie,
  FaCar,
  FaWarehouse,
  FaClipboardList,
  FaTruck,
  FaTools,
  FaChartBar,
} from "react-icons/fa";
import api from "../../api/client";

export default function ConfigureAccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [menuStructure, setMenuStructure] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState({});
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAllowedMenuIds, setUserAllowedMenuIds] = useState(new Set());

  // Missing HR (children)
  const missingHRMenus = [
    // { id: 5001, title: "CV Management", path: "/cv-management" },
    // { id: 5002, title: "Punch In/Punch Out", path: "/punch-in-out" },
    // { id: 5003, title: "Leave List", path: "/leave-management/leave-list" },
    // { id: 5004, title: "Early List", path: "/leave-management/early-list" },
    // { id: 5005, title: "Late List", path: "/leave-management/late-list" },
    // { id: 5006, title: "Break List", path: "/leave-management/break-list" },

    // {
    //   id: 6001,
    //   title: "Request",
    //   children: [
    //     { id: 6002, title: "Leave Request", path: "/hr/request/leave" },
    //     { id: 6003, title: "Late Request", path: "/hr/request/late" },
    //     { id: 6004, title: "Early Request", path: "/hr/request/early" },
    //   ],
    // },

    // { id: 7001, title: "Experience Certificate", path: "/experience-certificate" },
    // { id: 7002, title: "Salary Certificate", path: "/salary-certificate" },
  ];

  // Missing ROOT MENUS (top level)
  const missingRootMenus = [
    // Add missing root menus here. "Warehouse Management" is included below.
    {
      id: 8006,
      title: "Warehouse Management",
      name: "Warehouse Management",
      children: [
        { id: 8104, title: "Assign Work", name: "Assign Work", path: "/warehouse/assign" },
        { id: 8105, title: "Task Monitor", name: "Task Monitor", path: "/warehouse/admin" },
        { id: 8106, title: "My Warehouse Tasks", name: "My Warehouse Tasks", path: "/warehouse/mytasks" },
      ],
    },
  ];

  // Recursive renderer (unchanged)
  const renderChildren = (children, level = 1) =>
    children.map((child) => (
      <React.Fragment key={child.id}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: "1px solid #f3f4f6",
            marginLeft: `${level * 20}px`,
            fontSize: "13px",
            backgroundColor: level > 1 ? "#fafafa" : "transparent",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={selectedMenus.includes(child.id) || checked[child.id]?.main || false}
              onChange={() => toggleSubMenu(child.id)}
            />
            <span style={{ fontWeight: checked[child.id]?.main ? "500" : "normal" }}>
              {child.title}
            </span>
          </div>

          <div style={{ display: "flex", gap: "15px", color: "#374151" }}>
            {["view", "edit", "delete"].map((action) => (
              <label
                key={action}
                style={{
                  display: "flex",
                  gap: "5px",
                  fontSize: "12px",
                  cursor: "pointer",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked[child.id]?.[action] || false}
                  onChange={() => toggleAction(child.id, action)}
                />
                <span style={{ textTransform: "capitalize" }}>{action}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Render submenu children if present */}
        {child.children?.length > 0 && (
          <div>{renderChildren(child.children, level + 1)}</div>
        )}
      </React.Fragment>
    ));

  // Fetch + Inject missing menus
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user info
        const userRes = await api.get("/users/me/");
        const user = userRes.data;
        setCurrentUser(user);
        
        // If not superuser, get their allowed menu IDs
        if (!user.is_superuser) {
          try {
            const accessRes = await api.get(`/user-controll/admin/user/${user.id}/menus/`);
            const allowedIds = new Set(accessRes.data.menu_ids || []);
            setUserAllowedMenuIds(allowedIds);
          } catch (e) {
            console.warn("Could not fetch user's allowed menus:", e);
          }
        }
        
        const treeRes = await api.get("/user-controll/admin/menu-tree/");

        const formatMenu = (item) => ({
          id: item.id,
          title: item.name || item.title,
          children: item.children ? item.children.map(formatMenu) : [],
        });

        let finalTree = treeRes.data.map(formatMenu);

        // Inject missing HR children
        const hrNode = finalTree.find((m) => m.title === "HR Management");
        if (hrNode) {
          hrNode.children = [...hrNode.children, ...missingHRMenus];
        }

        // Inject missing root menus
        finalTree = [...finalTree, ...missingRootMenus];

        // Remove specific warehouse entries that shouldn't appear in Configure Access
        const removalNames = new Set(["Warehouses", "Stock", "Stock Transfer"]);
        const filterRemoved = (nodes) =>
          (nodes || [])
            .map((n) => ({ ...n, children: filterRemoved(n.children || []) }))
            .filter((n) => !removalNames.has(n.title));

        finalTree = filterRemoved(finalTree);
        
        // Filter menus based on user role
        if (!user.is_superuser) {
          // Non-superuser: only show menus they have access to
          const filterAllowedMenus = (nodes) => {
            return (nodes || [])
              .filter((n) => userAllowedMenuIds.has(n.id) || (n.children && n.children.length > 0))
              .map((n) => ({
                ...n,
                children: filterAllowedMenus(n.children || [])
              }));
          };
          finalTree = filterAllowedMenus(finalTree);
        }

        setMenuStructure(finalTree);
        console.log("ConfigureAccess: final menuStructure:", finalTree);

        // Load existing permissions for this user and initialize checked state
        try {
          const userRes = await api.get(`/user-controll/admin/user/${id}/menus/`);
          const saved = userRes.data.menu_perms || [];
          const menuIds = userRes.data.menu_ids || [];

          setSelectedMenus(menuIds);

          const initialChecked = {};
          saved.forEach((p) => {
            const mid = Number(p.menu_id ?? p.id ?? p);
            initialChecked[mid] = {
              main: true,
              view: Boolean(p.can_view),
              edit: Boolean(p.can_edit),
              delete: Boolean(p.can_delete),
            };
          });

          setChecked(initialChecked);
        } catch (e) {
          // If user-permissions fetch fails, keep defaults (all unchecked)
          console.warn("Failed to load user menu permissions", e);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load menu data");
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Toggle menu (manual configuration)
  const toggleSubMenu = (menuId) => {
    // Prevent non-superusers from toggling menus they don't have access to
    if (currentUser && !currentUser.is_superuser && !userAllowedMenuIds.has(menuId)) {
      alert("You don't have access to configure this menu");
      return;
    }

    setChecked((prev) => {
      const current = prev[menuId]?.main || false;
      // If unchecking main, clear all permissions
      if (current) {
        return {
          ...prev,
          [menuId]: {
            main: false,
            view: false,
            edit: false,
            delete: false,
          },
        };
      }
      // If checking main, just enable main, keep permissions as they were
      return {
        ...prev,
        [menuId]: {
          ...prev[menuId],
          main: true,
          view: prev[menuId]?.view || false,
          edit: prev[menuId]?.edit || false,
          delete: prev[menuId]?.delete || false,
        },
      };
    });
    // update selectedMenus in tandem
    setSelectedMenus((prev) => {
      const exists = prev.includes(menuId);
      if (exists) {
        return prev.filter((m) => m !== menuId);
      }
      return [...prev, menuId];
    });
  };

  // Toggle action
  const toggleAction = (menuId, action) => {
    // Prevent non-superusers from toggling permissions on menus they don't have access to
    if (currentUser && !currentUser.is_superuser && !userAllowedMenuIds.has(menuId)) {
      alert("You don't have access to configure permissions for this menu");
      return;
    }

    setChecked((prev) => {
      const newActionValue = !prev[menuId]?.[action];
      const updatedPerms = {
        ...prev[menuId],
        [action]: newActionValue,
      };

      // Auto-check main if any permission is checked
      const hasAnyPermission = updatedPerms.view || updatedPerms.edit || updatedPerms.delete;

      // keep selectedMenus in sync based on whether any permission remains
      setSelectedMenus((smPrev) => {
        const contains = smPrev.includes(menuId);
        if (hasAnyPermission && !contains) return [...smPrev, menuId];
        if (!hasAnyPermission && contains) return smPrev.filter((m) => m !== menuId);
        return smPrev;
      });

      return {
        ...prev,
        [menuId]: {
          ...updatedPerms,
          main: hasAnyPermission,
        },
      };
    });
  };

  // Save (unchanged)
  const handleSave = async () => {
    // Prefer selectedMenus (tracks checkbox state), but also include any checked entries
    const fromChecked = Object.keys(checked)
      .filter((id) => checked[id].main)
      .map(Number);

    const merged = Array.from(new Set([...(selectedMenus || []), ...fromChecked]));
    const selectedIds = merged;

    try {
      await api.post(`/user-controll/admin/user/${id}/menus/`, {
        menu_ids: selectedIds,
      });
      alert("Permissions saved!");
    } catch (err) {
      alert("Failed to save permissions");
    }
  };

  // Render (unchanged)
  if (loading) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        Loading menu structure...
      </div>
    );
  }

  return (
    <div style={{ padding: "25px", background: "#f3f4f6", minHeight: "100vh" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          background: "#fff",
          borderRadius: "12px",
          padding: "25px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => navigate("/user-control")}
          style={{
            padding: "8px 16px",
            background: "#1f2937",
            color: "#fff",
            borderRadius: "6px",
            marginBottom: "18px",
          }}
        >
          ← Back
        </button>

        {/* Show access restriction warning for non-superusers */}
        {currentUser && !currentUser.is_superuser && (
          <div style={{
            background: "#fef3c7",
            color: "#92400e",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "13px",
            border: "1px solid #fcd34d"
          }}>
            ⚠️ You can only configure menus you have access to. Superadmins can configure all menus.
          </div>
        )}

        <div
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "6px",
            marginBottom: "20px",
            width: "fit-content",
          }}
        >
          Configure Menu Access for User #{id}
        </div>

        {menuStructure.map((block, idx) => (
          <div
            key={block.id}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              marginBottom: "14px",
            }}
          >
            <div
              onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
              style={{
                fontWeight: "600",
                background: "#f9fafb",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              {block.title}
              <span>{openMenu === idx ? "▲" : "▼"}</span>
            </div>

            {openMenu === idx && (
              <div>{renderChildren(block.children || [])}</div>
            )}
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "12px 24px", 
              background: "#16a34a",
              color: "#fff",
              borderRadius: "8px",
            }}
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
}