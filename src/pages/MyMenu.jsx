// src/pages/MyMenu.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/client";

// ✅ Full fallback menu list (matches Omega Navbar)
const defaultMenuList = [
  {
    title: "Dashboard",
    path: "/",
  },
  {
    title: "HR Management",
    children: [
      { title: "CV Management", path: "/cv-management" },
      { title: "Interview Management", path: "/interview-management" },
      { title: "Offer Letter", path: "/offer-letter" },
      { title: "Employee Management", path: "/employee-management" },
      { title: "Attendance Management", path: "/attendance-management" },
      { title: "Punch In / Punch Out", path: "/punch-in-out" },
      { title: "Leave Management", path: "/leave-management" },
      { title: "Experience Certificate", path: "/experience-certificate" },
      { title: "Salary Certificate", path: "/salary-certificate" },
    ],
  },
  {
    title: "Marketing",
    children: [
      { title: "Campaigns", path: "/marketing-campaigns" },
      { title: "Promotions", path: "/marketing-promotions" },
      { title: "Leads", path: "/marketing-leads" },
    ],
  },
  {
    title: "Vehicle Management",
    children: [
      { title: "Company Vehicle", path: "/company-vehicle" },
      { title: "Non Company Vehicle", path: "/non-company-vehicle" },
      { title: "Vehicle Logs", path: "/vehicle-logs" },
    ],
  },
  {
    title: "Target Management",
    children: [
      { title: "Target Setup", path: "/target-setup" },
      { title: "Target Review", path: "/target-review" },
      { title: "Sales Performance", path: "/sales-performance" },
    ],
  },
  {
    title: "Warehouse Management",
    children: [
      { title: "Warehouse List", path: "/warehouse-list" },
      { title: "Stock Transfer", path: "/stock-transfer" },
      { title: "Inventory", path: "/inventory" },
    ],
  },
  {
    title: "Delivery Management",
    children: [
      { title: "Delivery Status", path: "/delivery-status" },
      { title: "Pending Deliveries", path: "/pending-deliveries" },
      { title: "Completed Deliveries", path: "/completed-deliveries" },
    ],
  },
  {
    title: "User Management",
    children: [
      { title: "Add User", path: "/add-user" },
      { title: "User Control", path: "/user-control" },
      { title: "Configure Access", path: "/configure-access" },
    ],
  },
  {
    title: "Master",
    children: [
      { title: "Master Data", path: "/master-data" },
      { title: "Settings", path: "/settings" },
      { title: "Audit Logs", path: "/audit-logs" },
    ],
  },
];

export default function MyMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // ✅ Fetch user menu from backend → fallback to default
  // useEffect(() => {
  //   const fetchMenu = async () => {
  //     try {
  //       const response = await api.get("user-controll/my-menu/");
  //       if (response.data && response.data.length > 0) {
  //         setMenu(response.data);
  //       } else {
  //         console.warn("⚠️ Using fallback menu list");
  //         setMenu(defaultMenuList);
  //       }
  //     } catch (error) {
  //       console.error("❌ Failed to load My Menu:", error);
  //       setMenu(defaultMenuList);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchMenu();
  // }, []);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading menus...</p>;

  return (
    <div
      style={{
        padding: "25px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "25px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#1e3a8a",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          🧭 My Menu
        </h2>

        {menu.map((section, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              marginBottom: "14px",
              overflow: "hidden",
              backgroundColor: "#f9fafb",
            }}
          >
            {/* Section header */}
            <div
              style={{
                background: "#2563eb",
                color: "white",
                padding: "10px 14px",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              {section.title}
            </div>

            {/* Submenu items */}
            {section.children && section.children.length > 0 && (
              <ul style={{ listStyle: "none", padding: "10px 20px" }}>
                {section.children.map((child, idx) => {
                  const isActive = location.pathname === child.path;
                  return (
                    <li key={idx} style={{ marginBottom: "4px" }}>
                      <Link
                        to={child.path}
                        style={{
                          display: "block",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          color: isActive ? "#2563eb" : "#1f2937",
                          backgroundColor: isActive ? "#e0e7ff" : "transparent",
                          fontSize: "14px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {child.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
