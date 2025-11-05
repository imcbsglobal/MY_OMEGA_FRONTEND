// src/components/LoginPage.jsx - FIXED
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.scss";

const API_BASE = "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    
    try {
      console.log('🔐 Attempting login with:', email);
      
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Accept: "application/json" 
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      console.log('📥 Login response:', data);
      
      if (!res.ok) {
        throw new Error(data?.detail || "Login failed");
      }
      
      await onLoginSuccess(data);
      
    } catch (err) {
      console.error("❌ Login error:", err);
      setErrorMsg(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onLoginSuccess(data) {
    try {
      // Save tokens
      if (data.access) {
        localStorage.setItem("access", data.access);
        console.log('✅ Access token saved');
      }
      if (data.refresh) {
        localStorage.setItem("refresh", data.refresh);
        console.log('✅ Refresh token saved');
      }
      
      // Save user data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log('✅ User data saved:', data.user);
      }
      
      // Save user level and admin status
      const userLevel = data.user_level || data.user?.user_level || "User";
      const isAdmin = data.is_admin || userLevel === "Super Admin" || userLevel === "Admin";
      
      localStorage.setItem("user_level", userLevel);
      localStorage.setItem("is_admin", JSON.stringify(isAdmin));
      
      console.log('📊 User Level:', userLevel);
      console.log('🔑 Is Admin:', isAdmin);
      
      // Save menu tree
      const menuTree = data.allowed_menus || [];
      localStorage.setItem("allowed_menus", JSON.stringify(menuTree));
      
      console.log('📁 Menus saved:', menuTree.length, 'items');
      console.log('Menu structure:', menuTree);
      
      // Save control panel access
      const canAccessControl = data.can_access_control_panel || false;
      localStorage.setItem("can_access_control_panel", JSON.stringify(canAccessControl));
      
      console.log('🎛️ Can access control panel:', canAccessControl);
      
      // Show success message
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('User:', data.user?.name);
      console.log('Email:', data.user?.email);
      console.log('Level:', userLevel);
      console.log('Menus:', menuTree.length);
      console.log('---\n');
      
      // Redirect based on user level
      let redirectPath = "/hr/PunchinPunchout"; // Default for regular users
      
      if (userLevel === "Super Admin" || userLevel === "Admin") {
        redirectPath = "/user/list";
      }
      
      console.log('🚀 Redirecting to:', redirectPath);
      
      // Small delay to ensure storage is saved
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
      
    } catch (error) {
      console.error('❌ Error saving login data:', error);
      setErrorMsg("Login successful but failed to save data. Please try again.");
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={onSubmit} className="login-form">
        <h2>🔐 Login</h2>
        
        {errorMsg && (
          <div className="error" style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #fcc',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}
        
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="username"
            required
            disabled={loading}
          />
        </label>
        
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </label>
        
        <button type="submit" disabled={loading}>
          {loading ? "🔄 Logging in..." : "Login"}
        </button>
        
        {loading && (
          <div style={{
            textAlign: 'center',
            marginTop: '10px',
            color: '#666',
            fontSize: '14px'
          }}>
            Please wait...
          </div>
        )}
      </form>
    </div>
  );
}