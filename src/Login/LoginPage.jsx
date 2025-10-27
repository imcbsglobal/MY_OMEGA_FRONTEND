import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.scss"; // 👈 Import SCSS

const API_BASE = "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onLoginSuccess(data) {
    if (data.access) localStorage.setItem("access", data.access);
    if (data.refresh) localStorage.setItem("refresh", data.refresh);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

    const level = data.user?.user_level || "";
    const redirectPath =
      level === "Super Admin" || level === "Admin" ? "/user/list" : "/hr/add-cv";

    navigate(redirectPath, { replace: true });
  }

  async function loginWithEmailPassword(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function loginWithPastedToken() {
    setError("");
    setLoading(true);
    try {
      const token = tokenInput.trim();
      if (!token) throw new Error("Paste an access or refresh token first.");

      let res = await fetch(`${API_BASE}/token-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access: token }),
      });

      let data = await res.json();
      if (!res.ok) {
        res = await fetch(`${API_BASE}/token-login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ refresh: token }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Token login failed");
      }
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Token login failed");
    } finally {
      setLoading(false);
    }
  }

  async function loginWithSavedToken() {
    setError("");
    setLoading(true);
    try {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      const body = access ? { access } : refresh ? { refresh } : null;
      if (!body) throw new Error("No token in localStorage.");

      const res = await fetch(`${API_BASE}/token-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Token login failed");
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Token login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign in</h1>

        <form onSubmit={loginWithEmailPassword}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="divider">or use a JWT token</div>

        <textarea
          rows={3}
          placeholder="Paste access or refresh token here"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
        />

        <div className="token-buttons">
          <button onClick={loginWithPastedToken} disabled={loading}>
            {loading ? "Checking..." : "Login with Token"}
          </button>
          <button onClick={loginWithSavedToken} disabled={loading} className="secondary">
            {loading ? "Checking..." : "Use Saved Token"}
          </button>
        </div>

        {error && <div className="error">⚠ {error}</div>}
      </div>
    </div>
  );
}
