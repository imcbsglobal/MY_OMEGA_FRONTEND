import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, User, Save, X, RefreshCw } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function UserControlPanel() {
  const token = localStorage.getItem("access");
  const refreshToken = localStorage.getItem("refresh");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [menuTree, setMenuTree] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedMenuIds, setSelectedMenuIds] = useState(new Set());
  const [originalMenuIds, setOriginalMenuIds] = useState(new Set());
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  async function refreshAccessToken() {
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();
      localStorage.setItem("access", data.access);
      return data.access;
    } catch (e) {
      console.error("Token refresh failed:", e);
      return null;
    }
  }

  async function fetchWithAuth(url, options = {}, retryWithRefresh = true) {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 && retryWithRefresh) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
      }
    }
    return res;
  }

  async function fetchUsers() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetchWithAuth(`${API_BASE}/user-controll/admin/users/`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to load users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMenuTree() {
    try {
      const res = await fetchWithAuth(`${API_BASE}/user-controll/admin/menu-tree/`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to load menu tree");
      setMenuTree(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Error loading menus");
    }
  }

  async function fetchUserMenus(userId) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/user-controll/admin/user/${userId}/menus/`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to load user menus");
      const menuIds = new Set(data.menu_ids || []);
      setSelectedMenuIds(menuIds);
      setOriginalMenuIds(menuIds);
    } catch (e) {
      setErr(e.message || "Error loading user menus");
      setSelectedMenuIds(new Set());
      setOriginalMenuIds(new Set());
    }
  }

  async function saveUserMenus() {
  if (!selectedUserId) return;
  setSaving(true);
  setErr("");
  setSuccess("");
  try {
    const res = await fetchWithAuth(
      `${API_BASE}/user-controll/admin/user/${selectedUserId}/menus/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_ids: Array.from(selectedMenuIds) }),
      }
    );
    const data = await res.json();
    
    // ADD THIS LOGGING
    console.log("Response status:", res.status);
    console.log("Response data:", data);
    
    if (!res.ok) throw new Error(data?.detail || JSON.stringify(data) || "Failed to save menus");
    
    setSuccess(`✓ Menu permissions saved successfully!`);
    setShowMenuEditor(false);
    setOriginalMenuIds(new Set(selectedMenuIds));
    setTimeout(() => setSuccess(""), 5000);
  } catch (e) {
    console.error("Save error:", e);
    setErr(e.message || "Error saving menus");
  } finally {
    setSaving(false);
  }
}

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    fetchMenuTree();
  }, [token]);

  function handleSelectUser(userId) {
    setSelectedUserId(userId);
    setShowMenuEditor(false);
    setErr("");
    setSuccess("");
  }

  async function handleMakeChanges() {
    if (!selectedUserId) return;
    setShowMenuEditor(true);
    await fetchUserMenus(selectedUserId);
  }

  function toggleMenu(menuId, item) {
    const newSet = new Set(selectedMenuIds);
    if (newSet.has(menuId)) {
      newSet.delete(menuId);
      removeChildren(item, newSet);
    } else {
      newSet.add(menuId);
      addParents(item, newSet);
    }
    setSelectedMenuIds(newSet);
  }

  function removeChildren(item, targetSet) {
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        targetSet.delete(child.id);
        removeChildren(child, targetSet);
      });
    }
  }

  function addParents(item, targetSet) {
    if (item.parent) {
      targetSet.add(item.parent);
      const parent = findMenuItem(menuTree, item.parent);
      if (parent) addParents(parent, targetSet);
    }
  }

  function findMenuItem(items, id) {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children && item.children.length > 0) {
        const found = findMenuItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function selectAllMenus() {
    const allIds = new Set();
    function collectIds(items) {
      items.forEach(item => {
        allIds.add(item.id);
        if (item.children && item.children.length > 0) {
          collectIds(item.children);
        }
      });
    }
    collectIds(menuTree);
    setSelectedMenuIds(allIds);
  }

  function deselectAllMenus() {
    setSelectedMenuIds(new Set());
  }

  function resetChanges() {
    setSelectedMenuIds(new Set(originalMenuIds));
  }

  const selectedUser = users.find(u => u.id === selectedUserId);
  const hasChanges = JSON.stringify([...selectedMenuIds].sort()) !== JSON.stringify([...originalMenuIds].sort());

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>Please login to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "1.5rem" }}>
      <div style={{ maxWidth: "112rem", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", margin: "0 0 0.5rem" }}>
            User Control Panel
          </h1>
          <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>Manage menu permissions for users</p>
        </div>

        {success && (
          <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem", color: "#15803d", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem" }}>✓</span>
            <span>{success}</span>
          </div>
        )}

        {err && (
          <div style={{ marginBottom: "1rem", padding: "1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", color: "#dc2626" }}>
            {err}
          </div>
        )}

        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: window.innerWidth >= 1024 ? "1fr 2fr" : "1fr" }}>
          {/* User List */}
          <div>
            <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#374151" }}>Users</h2>
                <button
                  onClick={fetchUsers}
                  style={{ padding: "0.5rem", background: "transparent", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  title="Refresh users"
                >
                  <RefreshCw style={{ width: "1rem", height: "1rem", color: "#6b7280" }} />
                </button>
              </div>
              
              {loading ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <div style={{ width: "2rem", height: "2rem", border: "2px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
                  <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>Loading users...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : users.length === 0 ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "1rem 0" }}>No users found</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "600px", overflowY: "auto" }}>
                  {users.map(user => {
                    const isAdmin = user.is_superuser || user.is_staff;
                    const userLevel = user.is_superuser ? "Super Admin" : user.is_staff ? "Admin" : "User";
                    const isSelected = selectedUserId === user.id;
                    
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.75rem",
                          borderRadius: "0.75rem",
                          background: isSelected ? "#eff6ff" : "#f9fafb",
                          border: `2px solid ${isSelected ? "#2563eb" : "transparent"}`,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.background = "#f3f4f6";
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.background = "#f9fafb";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <User style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: "600", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                              {user.username}
                            </p>
                            <p style={{ fontSize: "0.875rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "0.125rem 0" }}>
                              {user.email}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "0.125rem 0.5rem",
                                fontSize: "0.75rem",
                                borderRadius: "0.375rem",
                                background: isAdmin ? "#f3e8ff" : "#f3f4f6",
                                color: isAdmin ? "#7e22ce" : "#374151",
                                fontWeight: 600
                              }}>
                                {userLevel}
                              </span>
                              {isAdmin && (
                                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>(All Menus)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* User Details & Menu Editor */}
          <div>
            {!selectedUser ? (
              <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "3rem", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <User style={{ width: "4rem", height: "4rem", color: "#d1d5db", margin: "0 auto 1rem" }} />
                <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>Select a user to manage permissions</p>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#374151" }}>
                    User Details
                  </h2>
                  <div style={{ background: "#f9fafb", borderRadius: "0.75rem", padding: "1rem" }}>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: "600", color: "#374151" }}>Username: </span>
                      <span style={{ color: "#111827" }}>{selectedUser.username}</span>
                    </div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: "600", color: "#374151" }}>Email: </span>
                      <span style={{ color: "#111827" }}>{selectedUser.email}</span>
                    </div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: "600", color: "#374151" }}>Name: </span>
                      <span style={{ color: "#111827" }}>
                        {selectedUser.first_name} {selectedUser.last_name}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: "600", color: "#374151" }}>Role: </span>
                      <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.875rem",
                        borderRadius: "0.375rem",
                        background: (selectedUser.is_superuser || selectedUser.is_staff) ? "#f3e8ff" : "#f3f4f6",
                        color: (selectedUser.is_superuser || selectedUser.is_staff) ? "#7e22ce" : "#374151"
                      }}>
                        {selectedUser.is_superuser ? "Super Admin" : selectedUser.is_staff ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                </div>

                {!showMenuEditor ? (
                  <button
                    onClick={handleMakeChanges}
                    style={{
                      width: "100%",
                      background: "#2563eb",
                      color: "#fff",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "0.6rem",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                    onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                  >
                    Edit Menu Permissions
                  </button>
                ) : (
                  <MenuEditor
                    menuTree={menuTree}
                    selectedMenuIds={selectedMenuIds}
                    originalMenuIds={originalMenuIds}
                    onToggle={toggleMenu}
                    onSelectAll={selectAllMenus}
                    onDeselectAll={deselectAllMenus}
                    onReset={resetChanges}
                    onSave={saveUserMenus}
                    onCancel={() => {
                      setShowMenuEditor(false);
                      setSelectedMenuIds(new Set(originalMenuIds));
                    }}
                    saving={saving}
                    hasChanges={hasChanges}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuEditor({ menuTree, selectedMenuIds, originalMenuIds, onToggle, onSelectAll, onDeselectAll, onReset, onSave, onCancel, saving, hasChanges }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#374151", margin: 0 }}>
          Menu Permissions
        </h3>
        <button
          onClick={onCancel}
          style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", padding: "0.25rem" }}
        >
          <X style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={onSelectAll} style={{
          padding: "0.375rem 0.75rem",
          fontSize: "0.875rem",
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontWeight: 500
        }}>
          Select All
        </button>
        <button onClick={onDeselectAll} style={{
          padding: "0.375rem 0.75rem",
          fontSize: "0.875rem",
          background: "#f3f4f6",
          color: "#374151",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontWeight: 500
        }}>
          Deselect All
        </button>
        {hasChanges && (
          <button onClick={onReset} style={{
            padding: "0.375rem 0.75rem",
            fontSize: "0.875rem",
            background: "#fef3c7",
            color: "#92400e",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontWeight: 500
          }}>
            Reset Changes
          </button>
        )}
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          {selectedMenuIds.size} menus selected
        </span>
      </div>

      <div style={{
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "1rem",
        background: "#f9fafb",
        maxHeight: "400px",
        overflowY: "auto",
        marginBottom: "1rem"
      }}>
        {menuTree.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "1rem 0" }}>No menus available</p>
        ) : (
          <MenuTreeView items={menuTree} selectedIds={selectedMenuIds} onToggle={onToggle} />
        )}
      </div>

      {hasChanges && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.75rem",
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "0.5rem",
          color: "#92400e",
          fontSize: "0.875rem"
        }}>
          You have unsaved changes
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={onSave}
          disabled={saving || !hasChanges}
          style={{
            flex: 1,
            background: hasChanges ? "#16a34a" : "#9ca3af",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.6rem",
            border: "none",
            cursor: hasChanges ? "pointer" : "not-allowed",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: (saving || !hasChanges) ? 0.6 : 1
          }}
        >
          {saving ? (
            <>
              <div style={{ width: "1rem", height: "1rem", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
              Saving...
            </>
          ) : (
            <>
              <Save style={{ width: "1rem", height: "1rem" }} />
              Save Changes
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.6rem",
            border: "2px solid #d1d5db",
            background: "#fff",
            color: "#374151",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function MenuTreeView({ items, selectedIds, onToggle, level = 0 }) {
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    const allParentIds = new Set();
    function collectParents(nodes) {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allParentIds.add(node.id);
          collectParents(node.children);
        }
      });
    }
    collectParents(items);
    setExpandedIds(allParentIds);
  }, [items]);

  function toggleExpand(id) {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  }

  if (!items || items.length === 0) {
    return <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No menus available</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {items.map(item => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedIds.has(item.id);
        const isChecked = selectedIds.has(item.id);

        return (
          <div key={item.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem",
                paddingLeft: `${level * 1.25 + 0.5}rem`,
                borderRadius: "0.5rem",
                background: isChecked ? "#eff6ff" : "transparent",
                transition: "background 0.2s"
              }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown style={{ width: "1rem", height: "1rem" }} />
                  ) : (
                    <ChevronRight style={{ width: "1rem", height: "1rem" }} />
                  )}
                </button>
              ) : (
                <div style={{ width: "1rem" }} />
              )}
              
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(item.id, item)}
                style={{
                  width: "1rem",
                  height: "1rem",
                  cursor: "pointer",
                  accentColor: "#2563eb"
                }}
              />
              
              <label 
                onClick={() => onToggle(item.id, item)}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  color: "#374151",
                  userSelect: "none",
                  fontWeight: isChecked ? 600 : 400
                }}
              >
                {item.name}
                {item.path && item.path !== '#' && (
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
                    ({item.path})
                  </span>
                )}
              </label>
            </div>

            {hasChildren && isExpanded && (
              <MenuTreeView
                items={item.children}
                selectedIds={selectedIds}
                onToggle={onToggle}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}