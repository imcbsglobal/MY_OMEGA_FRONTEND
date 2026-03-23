import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function UserControl() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterLevel, setFilter]    = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/user-controll/admin/users/")
      .then((r) => setUsers(r.data))
      .catch((e) => console.error("Error fetching users:", e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      (u.name || u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const level = (u.user_level || "User");
    const matchLevel = filterLevel === "all" || level === filterLevel;
    return matchSearch && matchLevel;
  });

  const levelColor = (level) => {
    if (level === "Super Admin") return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
    if (level === "Admin")       return { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
    return                              { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontWeight: 600 }}>Loading users…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f1f5f9", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
            🔐 User Control Panel
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            Configure menu access and permissions for each user
          </p>
        </div>

        {/* Filter bar */}
        <div style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <input
            type="text"
            placeholder="🔍  Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
              color: "#0f172a",
            }}
          />
          {["all", "Super Admin", "Admin", "User"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                padding: "7px 14px",
                borderRadius: 7,
                border: "1px solid",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                ...(filterLevel === lvl
                  ? { background: "#1d4ed8", color: "#fff", borderColor: "#1d4ed8" }
                  : { background: "#f8fafc", color: "#374151", borderColor: "#e2e8f0" }),
              }}
            >
              {lvl === "all" ? `All (${users.length})` : lvl}
            </button>
          ))}
        </div>

        {/* User cards */}
        {filtered.length === 0 ? (
          <div style={{
            background: "#fff",
            borderRadius: 10,
            padding: "40px 24px",
            textAlign: "center",
            color: "#64748b",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>👤</div>
            <div style={{ fontWeight: 600 }}>No users found</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((u) => {
              const level  = u.user_level || "User";
              const colors = levelColor(level);
              const initials = (u.name || u.username || u.email || "?")
                .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

              return (
                <div
                  key={u.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.09)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                    color: colors.text,
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                        {u.name || u.username}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}>
                        {level}
                      </span>
                      {u.is_superuser && (
                        <span style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: "#fdf4ff",
                          color: "#7e22ce",
                          border: "1px solid #e9d5ff",
                          fontWeight: 700,
                        }}>
                          Django Superuser
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      {u.email}
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0 }}>
                    {level === "Super Admin" || level === "Admin" ? (
                      <div style={{
                        fontSize: 12,
                        color: "#d97706",
                        background: "#fffbeb",
                        padding: "6px 12px",
                        borderRadius: 7,
                        border: "1px solid #fde68a",
                        fontWeight: 600,
                      }}>
                        Full Access
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/configure-access/${u.id}`)}
                        style={{
                          padding: "8px 18px",
                          background: "#1d4ed8",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 13,
                          boxShadow: "0 2px 6px rgba(29,78,216,0.25)",
                        }}
                      >
                        ⚙ Configure Access
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Note for admin/superadmin */}
        {filtered.some((u) => ["Super Admin", "Admin"].includes(u.user_level)) && (
          <div style={{
            marginTop: 16,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 13,
            color: "#92400e",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span>⚠️</span>
            <span>
              <strong>Admin</strong> and <strong>Super Admin</strong> users automatically have access to all menus — no configuration needed. Only <strong>User</strong>-level accounts require explicit menu assignment.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}