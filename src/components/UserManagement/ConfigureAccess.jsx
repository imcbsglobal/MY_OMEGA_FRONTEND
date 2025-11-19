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
  const [openMenu, setOpenMenu] = useState(null);
  const [saving, setSaving] = useState(false);

  // Render nested children recursively
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
              checked={checked[child.id]?.main || false}
              onChange={() => toggleSubMenu(child.id)}
              style={{ cursor: "pointer" }}
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
                  style={{ cursor: "pointer" }}
                />
                <span style={{ textTransform: "capitalize" }}>{action}</span>
              </label>
            ))}
          </div>
        </div>

        {/* If child has its own children → render them recursively */}
        {child.children && child.children.length > 0 && (
          <div>{renderChildren(child.children, level + 1)}</div>
        )}
      </React.Fragment>
    ));

  // Fetch menu tree + user assigned menus
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch menu tree
        const treeRes = await api.get("/user-controll/admin/menu-tree/");

        // Recursive menu formatter
        const formatMenu = (item) => ({
          id: item.id,
          title: item.name || item.title,
          children: item.children ? item.children.map(formatMenu) : [],
        });

        // const formatted = treeRes.data.map(formatMenu);
        // setMenuStructure(formatted);

        // Fetch user's assigned menus
        // const userRes = await api.get(`/user-controll/admin/user/${id}/menus/`);
        // const savedIds = userRes.data.menu_perms || [];
        // console.log("Saved menu IDs:", savedIds);

        // const initialChecked = {};
        // savedIds.forEach((mid) => {
        //   initialChecked[mid] = {
        //     main: true,
        //     view: true,
        //     edit: true,
        //     delete: true,
        //   };
        // });

        // setChecked(initialChecked);



        const formatted = treeRes.data.map(formatMenu);
        setMenuStructure(formatted);

        // Build id -> node map for propagation
        const idMap = {};
        const buildIdMap = (nodes) => {
          nodes.forEach((n) => {
            idMap[n.id] = n;
            if (n.children && n.children.length) buildIdMap(n.children);
          });
        };
        buildIdMap(formatted);

        // Fetch user's assigned menus
        const userRes = await api.get(`/user-controll/admin/user/${id}/menus/`);
        const savedPerms = userRes.data.menu_perms || [];
        console.log("Saved menu permissions:", savedPerms);

        const initialChecked = {};
        // Support: array of IDs OR array of permission objects { menu_id, can_view, can_edit, can_delete }
        savedPerms.forEach((p) => {
          const mid = Number(p.menu_id ?? p.id ?? p.menu_id ?? p);
          if (!mid) return;
          initialChecked[mid] = {
            main: Boolean(p.can_view || p.can_edit || p.can_delete || p === mid),
            view: Boolean(p.can_view ?? p.view ?? (p === mid)),
            edit: Boolean(p.can_edit ?? p.edit ?? false),
            delete: Boolean(p.can_delete ?? p.delete ?? false),
          };
        });

        // Propagate flags up to parents: if any child has permissions, mark parent
        const propagateUp = (nodes) => {
          nodes.forEach((n) => {
            if (n.children && n.children.length > 0) {
              propagateUp(n.children);
              const anyView = n.children.some(c => initialChecked[c.id]?.view);
              const anyEdit = n.children.some(c => initialChecked[c.id]?.edit);
              const anyDelete = n.children.some(c => initialChecked[c.id]?.delete);
              if (anyView || anyEdit || anyDelete) {
                initialChecked[n.id] = initialChecked[n.id] || {
                  main: true,
                  view: anyView,
                  edit: anyEdit,
                  delete: anyDelete,
                };
              }
            }
          });
        };
        propagateUp(formatted);

        setChecked(initialChecked);

      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMsg = error.response?.data?.message || error.message || "Failed to load menu data";
        alert(`⚠️ ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Toggle main checkbox - when toggled, it also sets all permissions
  const toggleSubMenu = (menuId) => {
    setChecked((prev) => {
      const currentState = prev[menuId]?.main || false;
      return {
        ...prev,
        [menuId]: {
          main: !currentState,
          view: !currentState,
          edit: !currentState,
          delete: !currentState,
        },
      };
    });
  };

  // Toggle view / edit / delete
  const toggleAction = (menuId, action) => {
    setChecked((prev) => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        main: prev[menuId]?.main || false,
        [action]: !prev[menuId]?.[action],
      },
    }));
  };

  // Save menu permissions
  const handleSave = async () => {
    const selectedMenuIds = Object.keys(checked)
      .filter((mid) => checked[mid]?.main)
      .map((mid) => Number(mid));

    if (selectedMenuIds.length === 0) {
      alert("⚠️ Please select at least one menu.");
      return;
    }

    setSaving(true);
    try {
      const payload = { menu_ids: selectedMenuIds };
      const response = await api.post(`/user-controll/admin/user/${id}/menus/`, payload);
      console.log("Save response:", response.data);
      alert("✅ Menu access saved successfully!");
    } catch (error) {
      console.error("❌ Error saving access:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || "Failed to save permissions";
      alert(`❌ ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: "#f3f4f6"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            fontSize: "18px", 
            fontWeight: "500", 
            color: "#1f2937",
            marginBottom: "10px"
          }}>
            Loading menu data...
          </div>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid #e5e7eb",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }} />
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Icons mapping
  const iconMap = {
    Dashboard: <FaHome />,
    Administration: <FaUserCog />,
    HR: <FaUsers />,
    Marketing: <FaChartBar />,
    "Vehicle Management": <FaCar />,
    "Target Management": <FaClipboardList />,
    "Warehouse Management": <FaWarehouse />,
    "Delivery Management": <FaTruck />,
    "User Management": <FaUserTie />,
    Master: <FaTools />,
  };

  // Render page
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
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <button
          onClick={() => navigate("/user-control")}
          style={{
            padding: "8px 16px",
            background: "#1f2937",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            marginBottom: "18px",
            fontSize: "14px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.background = "#111827"}
          onMouseLeave={(e) => e.target.style.background = "#1f2937"}
        >
          ← Back
        </button>

        <div
          style={{
            background: "#2563eb",
            color: "white",
            padding: "12px 18px",
            fontWeight: "600",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "15px",
            width: "fit-content",
          }}
        >
          Configure Menu Access for User #{id}
        </div>

        {menuStructure.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            color: "#6b7280",
            fontSize: "14px"
          }}>
            No menu structure available
          </div>
        ) : (
          <>
            {/* Main menu blocks */}
            {menuStructure.map((block, idx) => (
              <div
                key={block.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  marginBottom: "14px",
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                  style={{
                    fontWeight: "600",
                    background: "#f9fafb",
                    padding: "12px 16px",
                    borderBottom: openMenu === idx ? "1px solid #e5e7eb" : "none",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "#1e3a8a",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#f9fafb"}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    {iconMap[block.title] || <FaTools />} {block.title}
                  </span>
                  <span style={{ color: "#2563eb", fontSize: "12px" }}>
                    {openMenu === idx ? "▲" : "▼"}
                  </span>
                </div>

                {openMenu === idx && block.children && block.children.length > 0 && (
                  <div>{renderChildren(block.children)}</div>
                )}
              </div>
            ))}

            <div style={{ textAlign: "center", marginTop: "25px" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "12px 24px",
                  background: saving ? "#9ca3af" : "#16a34a",
                  color: "#fff",
                  borderRadius: "6px",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.background = "#15803d";
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.target.style.background = "#16a34a";
                }}
              >
                {saving ? "Saving..." : "✅ Save Permissions"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}