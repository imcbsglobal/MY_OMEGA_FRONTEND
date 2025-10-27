// src/User_control/user_control_panel.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ucListUsers,
  ucMenuTree,
  ucGetUserMenus,
  ucSetUserMenus,
} from "../services/api";
import "./user_control.css";

/** Recursive tree (two+ levels) to render menu items with checkboxes */
function Tree({ nodes, checked, onToggle }) {
  return (
    <ul className="uc-tree">
      {nodes.map((n) => (
        <li key={n.id}>
          {n.path && n.path !== "#" ? (
            <label className="uc-leaf">
              <input
                type="checkbox"
                checked={checked.has(n.id)}
                onChange={() => onToggle(n.id)}
              />
              <span className="uc-leaf-label">{n.name}</span>
              <small className="uc-path">{n.path}</small>
            </label>
          ) : (
            <div className="uc-group">{n.name}</div>
          )}

          {n.children?.length ? (
            <Tree nodes={n.children} checked={checked} onToggle={onToggle} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function UserControlPanel() {
  const [users, setUsers] = useState([]);
  const [menuTree, setMenuTree] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [checked, setChecked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // initial load: users + full menu tree
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [u, m] = await Promise.all([ucListUsers(), ucMenuTree()]);
        setUsers(u || []);
        setMenuTree(m || []);
      } catch (e) {
        setError(e?.message || "Failed to load user control data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // load a single user's menu selections
  const loadUserMenus = async (userId) => {
    setSelectedUser(userId);
    setChecked(new Set());
    setError("");
    if (!userId) return;

    try {
      const data = await ucGetUserMenus(userId);
      setChecked(new Set((data?.menu_ids || []).filter(Boolean)));
    } catch (e) {
      setError(e?.message || "Failed to load user's menu selections");
    }
  };

  // toggle a single checkbox id
  const toggle = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // save changes
  const save = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setError("");
    try {
      await ucSetUserMenus(selectedUser, Array.from(checked));
      alert("Saved access for user.");
    } catch (e) {
      setError(e?.message || "Failed to save access");
    } finally {
      setSaving(false);
    }
  };

  const userOptions = useMemo(
    () =>
      (users || []).map((u) => (
        <option key={u.id} value={u.id}>
          {u.username} {u.email ? `(${u.email})` : ""}{" "}
          {u.is_superuser ? "— Super Admin" : ""}
        </option>
      )),
    [users]
  );

  if (loading) {
    return (
      <div className="uc-panel">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="uc-panel">
      <div className="uc-header">
        <h2>🔒 User Control Panel</h2>
        <p className="uc-sub">
          Super Admin can allocate which menu items each user can access.
        </p>
      </div>

      {error && <div className="uc-error">{error}</div>}

      <div className="uc-row">
        <div className="uc-col">
          <label className="uc-label">Select User</label>
          <select
            className="uc-select"
            onChange={(e) => loadUserMenus(e.target.value)}
            value={selectedUser}
          >
            <option value="">— choose a user —</option>
            {userOptions}
          </select>
        </div>

        <div className="uc-col uc-right">
          <button className="uc-button" disabled={!selectedUser || saving} onClick={save}>
            {saving ? "Saving…" : "Save Access"}
          </button>
        </div>
      </div>

      <div className="uc-body">
        {selectedUser ? (
          <Tree nodes={menuTree} checked={checked} onToggle={toggle} />
        ) : (
          <p className="uc-hint">Pick a user to manage access.</p>
        )}
      </div>
    </div>
  );
}
