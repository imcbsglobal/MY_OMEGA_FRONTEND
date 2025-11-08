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
import api from "../../api/client"; // ✅ Axios client (already configured)
import menuList from "../../constants/menuList";

export default function ConfigureAccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [menuStructure, setMenuStructure] = useState(menuList);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  // ✅ Fetch both menu tree and user's saved menus
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch menu tree
        const treeRes = await api.get("user-controll/admin/menu-tree/");
        console.log("Fetched menu tree:", treeRes.data);

        const formatted = treeRes.data.map((menu) => ({
          id: menu.id,
          title: menu.name || menu.title || "Untitled Menu",
          children:
            menu.children?.map((child) => ({
              id: child.id,
              title: child.name || child.title || "Untitled Submenu",
            })) || [],
        }));
        setMenuStructure(formatted.length > 0 ? formatted : menuList);

        // 2️⃣ Fetch saved menu IDs for this user
        const userRes = await api.get(`user-controll/admin/user/${id}/menus/`);
        const savedIds = userRes.data.menu_ids || [];
        console.log("✅ Saved menu IDs:", savedIds);

        // 3️⃣ Initialize check state
        const initialChecked = {};
        savedIds.forEach((mid) => {
          initialChecked[mid] = { main: true };
        });
        setChecked(initialChecked);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("⚠️ Failed to load menu data. Using default list.");
        setMenuStructure(menuList);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Toggle submenu checkbox
  const toggleSubMenu = (id) => {
    setChecked((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        main: !prev[id]?.main,
      },
    }));
  };

  // ✅ Toggle inner actions (View/Edit/Delete)
  const toggleAction = (id, action) => {
    setChecked((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [action]: !prev[id]?.[action],
      },
    }));
  };

  // ✅ Save permissions (includes View/Edit/Delete)
  const handleSave = async () => {
    if (!id || id === "default" || isNaN(Number(id))) {
      alert("⚠️ Invalid user ID.");
      return;
    }

    // Convert checked items to full permission objects
    const formattedPermissions = Object.entries(checked).map(([menuId, perms]) => ({
      menu_id: Number(menuId),
      view: perms.view || false,
      edit: perms.edit || false,
      delete: perms.delete || false,
      main: perms.main || false,
    }));

    console.log("📤 Sending to backend:", { user_id: id, permissions: formattedPermissions });

    try {
      const res = await api.post(`user-controll/admin/user/${id}/menus/`, {
        permissions: formattedPermissions,
      });
      console.log("✅ Response:", res.data);
      alert("✅ Permissions saved successfully!");
    } catch (error) {
      console.error("❌ Error saving access:", error);
      alert("❌ Failed to save permissions. Check backend logs.");
    }
  };

  // ✅ Loading UI
  if (loading)
    return <p style={{ textAlign: "center", padding: "20px" }}>Loading menu data...</p>;

  // ✅ Fallback UI
  if (!menuStructure || menuStructure.length === 0)
    return (
      <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
        No menu data found.
      </p>
    );

  // ✅ Icons mapping
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

  // ✅ UI Render
  return (
    <div
      style={{
        padding: "25px",
        background: "#f3f4f6",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "25px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/user-control")}
          style={{
            padding: "8px 16px",
            background: "#1f2937",
            color: "#fff",
            fontSize: "13px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            marginBottom: "18px",
            fontWeight: "600",
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <div
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 15px",
            fontWeight: "600",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px",
            width: "fit-content",
          }}
        >
          Configure Menu Access for USER #{id}
        </div>

        {/* Menu List */}
        {menuStructure.map((block, idx) => (
          <div
            key={block.id || idx}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              marginBottom: "14px",
              overflow: "hidden",
            }}
          >
            {/* Section Header */}
            <div
              onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
              style={{
                fontWeight: "600",
                background: "#f9fafb",
                padding: "10px 14px",
                borderBottom: "1px solid #e5e7eb",
                fontSize: "13.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#1e3a8a",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {iconMap[block.title] || <FaTools />} {block.title}
              </span>
              <span style={{ color: "#2563eb" }}>{openMenu === idx ? "▲" : "▼"}</span>
            </div>

            {/* Submenus */}
            {openMenu === idx &&
              block.children?.map((child) => (
                <div key={child.id} style={{ background: "#fff" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#1d4ed8",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {/* ✅ Main Submenu Checkbox */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="checkbox"
                        checked={checked[child.id]?.main || false}
                        onChange={() => toggleSubMenu(child.id)}
                        style={{ transform: "scale(1.1)", cursor: "pointer" }}
                      />
                      {child.title}
                    </div>

                    {/* ✅ View/Edit/Delete Options */}
                    <div style={{ display: "flex", gap: "15px", color: "#374151" }}>
                      {["view", "edit", "delete"].map((action) => (
                        <label
                          key={action}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12.5px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked[child.id]?.[action] || false}
                            onChange={() => toggleAction(child.id, action)}
                            style={{ transform: "scale(1)", cursor: "pointer" }}
                          />
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}

        {/* Save Button */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              background: "#16a34a",
              color: "#fff",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            ✅ Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
