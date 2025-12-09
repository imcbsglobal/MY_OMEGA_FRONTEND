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
    // { id: 8001, title: "Marketing", children: [] },
    // {
    //   id: 8002,
    //   title: "Vehicle Management",
    //   children: [
    //     { id: 8003, title: "Company Vehicle", path: "/company-vehicle" },
    //     { id: 8004, title: "Non Company Vehicle", path: "/non-company-vehicle" },
    //   ],
    // },
    // { id: 8005, title: "Target Management", children: [] },
    // { id: 8006, title: "Warehouse Management", children: [] },
    // { id: 8007, title: "Delivery Management", children: [] },
    // {
    //   id: 8008,
    //   title: "Master",
    //   children: [
    //     { id: 8009, title: "Job Titles", path: "/master/job-titles" },
    //   ],
    // },
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
              checked={checked[child.id]?.main || false}
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

        setMenuStructure(finalTree);

        const userRes = await api.get(`/user-controll/admin/user/${id}/menus/`);
        const saved = userRes.data.menu_perms || [];

        const initialChecked = {};
        saved.forEach((p) => {
          const mid = Number(p.menu_id ?? p.id ?? p);
          initialChecked[mid] = {
            main: true,
            view: Boolean(p.can_view ?? true),
            edit: Boolean(p.can_edit ?? false),
            delete: Boolean(p.can_delete ?? false),
          };
        });

        setChecked(initialChecked);
      } catch (err) {
        console.error(err);
        alert("Failed to load menu data");
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Toggle menu (unchanged)
  const toggleSubMenu = (menuId) => {
    setChecked((prev) => {
      const current = prev[menuId]?.main || false;
      return {
        ...prev,
        [menuId]: {
          main: !current,
          view: !current,
          edit: !current,
          delete: !current,
        },
      };
    });
  };

  // Toggle action (unchanged)
  const toggleAction = (menuId, action) => {
    setChecked((prev) => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        main: true,
        [action]: !prev[menuId]?.[action],
      },
    }));
  };

  // Save (unchanged)
  const handleSave = async () => {
    const selectedIds = Object.keys(checked)
      .filter((id) => checked[id].main)
      .map(Number);

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