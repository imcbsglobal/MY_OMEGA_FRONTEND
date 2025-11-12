// src/components/UserManagement/ConfigureAccess.jsx
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
import menuList from "../../constants/menuList";

export default function ConfigureAccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [menuStructure, setMenuStructure] = useState(menuList);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState({});
  const [openMenu, setOpenMenu] = useState(null);

  // ✅ Fetch menu tree and assigned menus
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const treeRes = await api.get("/user-controll/admin/menu-tree/");
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

        const userRes = await api.get(
          `/user-controll/admin/user/${id}/menus/`
        );
        const savedIds = userRes.data.menu_ids || [];
        const initialChecked = {};
        savedIds.forEach((mid) => {
          initialChecked[mid] = { main: true, view: true, edit: true, delete: true };
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

  // ✅ Toggle menu (main checkbox)
  const toggleSubMenu = (menuId) =>
    setChecked((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], main: !prev[menuId]?.main },
    }));

  // ✅ Toggle view/edit/delete options
  const toggleAction = (menuId, action) =>
    setChecked((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [action]: !prev[menuId]?.[action] },
    }));

  // ✅ Save only menu_ids to backend
  const handleSave = async () => {
    if (!id || isNaN(Number(id))) {
      alert("⚠️ Invalid user ID.");
      return;
    }

    // collect menu IDs that have main checked
    const selectedMenuIds = Object.keys(checked)
      .filter((mid) => checked[mid]?.main)
      .map((mid) => Number(mid));

    if (selectedMenuIds.length === 0) {
      alert("⚠️ Please select at least one menu.");
      return;
    }

    const payload = { menu_ids: selectedMenuIds };

    try {
      const res = await api.post(
        `/user-controll/admin/user/${id}/menus/`,
        payload
      );
      console.log("✅ Response:", res.data);
      alert("✅ Menu access saved successfully!");
    } catch (error) {
      console.error("❌ Error saving access:", error.response?.data || error.message);
      alert(
        JSON.stringify(
          error.response?.data || "❌ Failed to save permissions.",
          null,
          2
        )
      );
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        Loading menu data...
      </p>
    );

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
          }}
        >
          ← Back
        </button>

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

            {openMenu === idx &&
              block.children?.map((child) => (
                <div key={child.id}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="checkbox"
                        checked={checked[child.id]?.main || false}
                        onChange={() => toggleSubMenu(child.id)}
                        style={{ transform: "scale(1.1)", cursor: "pointer" }}
                      />
                      {child.title}
                    </div>

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
