import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

const emptyPerm = () => ({ can_view: false, can_edit: false, can_delete: false });

export default function ConfigureAccess() {
  const navigate = useNavigate();
  const { id: userId } = useParams();

  const [menuStructure, setMenuStructure] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [perms, setPerms] = useState({});
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("User");

  // Load menu tree + user permissions
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Menu tree
        const treeRes = await api.get("/user-controll/admin/menu-tree/");
        if (!Array.isArray(treeRes.data)) {
          setError(`menu-tree returned unexpected data: ${JSON.stringify(treeRes.data)}`);
          setLoading(false);
          return;
        }
        if (treeRes.data.length === 0) {
          setError("No menus in database. Run: python manage.py seed_menus");
          setLoading(false);
          return;
        }

        // Attach parent_id to every node for tree traversal
        const attachParent = (nodes, parentId = null) =>
          (nodes || []).map((n) => ({
            ...n,
            parent_id: parentId,
            children: attachParent(n.children || [], n.id),
          }));

        const tree = attachParent(treeRes.data);
        setMenuStructure(tree);

        // 2. Load existing user permissions
        try {
          const userRes = await api.get(`/user-controll/admin/user/${userId}/menus/`);
          console.log("[ConfigureAccess] loaded user perms:", userRes.data);

          const saved = userRes.data.menu_perms || [];
          const loaded = {};
          saved.forEach((p) => {
            const mid = Number(p.menu_id ?? p.id);
            if (!mid) return;
            loaded[mid] = {
              can_view: Boolean(p.can_view),
              can_edit: Boolean(p.can_edit),
              can_delete: Boolean(p.can_delete),
            };
          });

          const menuIds = userRes.data.menu_ids || [];
          menuIds.forEach((mid) => {
            if (!loaded[mid]) {
              loaded[mid] = { can_view: true, can_edit: false, can_delete: false };
            }
          });

          setPerms(loaded);
          console.log("[ConfigureAccess] restored perms for", Object.keys(loaded).length, "menus");
        } catch (permErr) {
          console.warn("[ConfigureAccess] Could not load user perms:", permErr);
        }

        // 3. Get user name
        try {
          const usersRes = await api.get("/user-controll/admin/users/");
          const found = usersRes.data.find((u) => String(u.id) === String(userId));
          if (found) setUserName(found.name || found.username || found.email);
        } catch (_) {}

      } catch (err) {
        console.error("[ConfigureAccess] load error:", err);
        const status = err.response?.status;
        const detail = err.response?.data?.detail || err.message;
        setError(
          status === 403 ? "Permission denied — you need Admin/Super Admin access." :
          status === 401 ? "Not authenticated. Please log in again." :
          `Failed to load: ${detail}`
        );
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  // Toggle permission checkbox
  const toggleAction = useCallback((nodeId, action) => {
    setPerms((prev) => {
      const current = { ...emptyPerm(), ...prev[nodeId] };
      const updated = { ...prev };
      updated[nodeId] = { ...current, [action]: !current[action] };

      const any = updated[nodeId].can_view || updated[nodeId].can_edit || updated[nodeId].can_delete;
      if (!any) {
        delete updated[nodeId];
      } else {
        updated[nodeId].can_view = true;
      }
      return updated;
    });
  }, []);

  // Save permissions to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.entries(perms)
        .filter(([, p]) => p.can_view || p.can_edit || p.can_delete)
        .map(([id, p]) => ({
          menu_id: Number(id),
          can_view: Boolean(p.can_view),
          can_edit: Boolean(p.can_edit),
          can_delete: Boolean(p.can_delete),
        }));

      console.log("[ConfigureAccess] saving", items.length, "items:", items);
      await api.post(`/user-controll/admin/user/${userId}/menus/`, { items });
      alert(`Saved! ${items.length} menus assigned.`);
    } catch (err) {
      console.error("[ConfigureAccess] save error:", err);
      alert(`Save failed: ${err.response?.data?.detail || err.message}`);
    }
    setSaving(false);
  };

  // Clear all permissions
  const handleClearAll = async () => {
    if (!window.confirm("Remove ALL menu access for this user?")) return;
    setSaving(true);
    try {
      await api.post(`/user-controll/admin/user/${userId}/menus/`, { items: [] });
      setPerms({});
      alert("All permissions cleared.");
    } catch {
      alert("Failed to clear permissions.");
    }
    setSaving(false);
  };

  // Render a single menu row with checkboxes
  const renderRow = (node, depth = 0) => {
    const p = perms[node.id] || emptyPerm();
    const hasAny = p.can_view || p.can_edit || p.can_delete;

    return (
      <React.Fragment key={node.id}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 16px",
          paddingLeft: `${16 + depth * 22}px`,
          borderBottom: "1px solid #f1f5f9",
          background: hasAny ? "#f0fdf4" : depth > 0 ? "#fafafa" : "#fff",
          transition: "background 0.1s",
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: hasAny ? 600 : 400,
            color: hasAny ? "#166534" : "#374151",
            flex: 1,
          }}>
            {node.icon && <span style={{ marginRight: 6 }}>{node.icon}</span>}
            {node.name}
            {node.path && node.path !== "#" && (
              <span style={{ marginLeft: 8, fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                {node.path}
              </span>
            )}
          </span>
          <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
            {["can_view", "can_edit", "can_delete"].map((action) => (
              <label key={action} style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                cursor: "pointer",
                userSelect: "none",
                width: 60,
                justifyContent: "center",
              }}>
                <input
                  type="checkbox"
                  checked={Boolean(p[action])}
                  onChange={() => toggleAction(node.id, action)}
                  style={{ accentColor: "#16a34a", width: 14, height: 14, cursor: "pointer" }}
                />
                <span style={{
                  color: p[action] ? "#15803d" : "#9ca3af",
                  textTransform: "capitalize",
                }}>
                  {action.replace("can_", "")}
                </span>
              </label>
            ))}
          </div>
        </div>
        {(node.children || []).map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  // Render a menu section with header
  const renderSection = (section) => (
    <div key={section.id} style={{
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      marginBottom: 12,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        padding: "12px 16px",
        background: "#f8fafc",
        fontWeight: 700,
        fontSize: 14,
        color: "#1e293b",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span>{section.icon || "📁"}</span>
        {section.name || section.title}
      </div>
      <div>
        {(section.children || []).map((child) => renderRow(child, 0))}
      </div>
    </div>
  );

  const totalAssigned = Object.values(perms).filter((p) => p.can_view || p.can_edit || p.can_delete).length;

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontWeight: 600 }}>Loading menu configuration…</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <button
          onClick={() => navigate("/user-control")}
          style={{
            padding: "7px 14px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 7,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          ← Back
        </button>
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 10,
          padding: 24,
          maxWidth: 600,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>
            ❌ Error loading menus
          </div>
          <div style={{ fontSize: 14, color: "#7f1d1d" }}>{error}</div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div style={{
      padding: 24,
      background: "#f1f5f9",
      minHeight: "100vh",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: "#2563eb",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: "6px",
        marginBottom: "20px",
        width: "fit-content",
      }}>
        Configure Menu Access for User #{userId}
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* Header bar */}
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: "16px 24px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "7px 14px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 7,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              ← Back
            </button>
            <div>
              <div style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Configure Menu Access
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{userName}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8", lineHeight: 1 }}>
                {totalAssigned}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>menus assigned</div>
            </div>
            <button
              onClick={handleClearAll}
              disabled={saving || totalAssigned === 0}
              style={{
                padding: "8px 16px",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                color: "#dc2626",
                borderRadius: 8,
                cursor: totalAssigned === 0 ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 13,
                opacity: totalAssigned === 0 ? 0.5 : 1,
              }}
            >
              Clear All
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "8px 22px",
                background: saving ? "#86efac" : "#16a34a",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 13,
                boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
              }}
            >
              {saving ? "Saving…" : "💾 Save Permissions"}
            </button>
          </div>
        </div>

        {/* Info tip */}
        <div style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          padding: "10px 16px",
          marginBottom: 16,
          fontSize: 13,
          color: "#1e40af",
          display: "flex",
          gap: 8,
        }}>
          <span>ℹ️</span>
          <span>
            Check <strong>View</strong> to grant sidebar visibility. <strong>Edit</strong> and{" "}
            <strong>Delete</strong> control action buttons within the page.
          </span>
        </div>

        {/* Menu sections */}
        {menuStructure.length === 0 ? (
          <div style={{
            background: "#fff",
            borderRadius: 10,
            padding: "40px 24px",
            textAlign: "center",
            color: "#64748b",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600 }}>No menus in database</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              Run <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                python manage.py seed_menus
              </code>
            </div>
          </div>
        ) : (
          menuStructure.map((section) => renderSection(section))
        )}

        {/* Bottom save button */}
        {menuStructure.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 24, paddingBottom: 40 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "12px 40px",
                background: saving ? "#86efac" : "#16a34a",
                border: "none",
                color: "#fff",
                borderRadius: 10,
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 15,
                boxShadow: "0 4px 12px rgba(22,163,74,0.25)",
              }}
            >
              {saving ? "Saving…" : "💾 Save All Permissions"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}