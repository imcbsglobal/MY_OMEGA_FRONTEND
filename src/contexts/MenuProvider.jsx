// src/contexts/MenuProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const MenuContext = createContext();

const API_BASE = "http://127.0.0.1:8000/api";

export function MenuProvider({ children }) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch menus based on user role
  const fetchMenus = async () => {
    const token = localStorage.getItem("access");
    const userLevel = localStorage.getItem("user_level") || "User";
    
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/user-controll/my-menu/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch menus");
      }

      const data = await res.json();
      
      // Store menus in state
      setMenus(data.menu || []);
      
      // Also store in localStorage for quick access
      localStorage.setItem("user_menus", JSON.stringify(data.menu || []));
      
      console.log(`Menus loaded for ${userLevel}:`, data.menu);
      
    } catch (err) {
      console.error("Error fetching menus:", err);
      setError(err.message);
      
      // Fallback to localStorage if available
      const cachedMenus = localStorage.getItem("user_menus");
      if (cachedMenus) {
        setMenus(JSON.parse(cachedMenus));
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh menus when token changes
  useEffect(() => {
    fetchMenus();
  }, []);

  // Check if user has access to a specific menu
  const hasMenuAccess = (menuKey) => {
    const userLevel = localStorage.getItem("user_level") || "User";
    
    // Super Admin and Admin have access to everything
    if (userLevel === "Super Admin" || userLevel === "Admin") {
      return true;
    }

    // Check in menus array
    const checkMenu = (items) => {
      for (const item of items) {
        if (item.key === menuKey) return true;
        if (item.children && item.children.length > 0) {
          if (checkMenu(item.children)) return true;
        }
      }
      return false;
    };

    return checkMenu(menus);
  };

  const value = {
    menus,
    loading,
    error,
    fetchMenus,
    hasMenuAccess
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
}