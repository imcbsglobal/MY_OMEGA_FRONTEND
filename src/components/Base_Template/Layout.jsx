import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";

export default function Layout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : isCollapsed ? 70 : 280;

  return (
    <div style={{ display: "flex" }}>
      <Navbar onCollapseChange={setIsCollapsed} />

      <main
      style={{
        marginLeft: isMobile ? "0" : `${sidebarWidth}px`,
        flex: 1,
        minHeight: "100vh",
        width: isMobile ? "100vw" : `calc(100% - ${sidebarWidth}px)`,
        padding: isMobile ? "16px" : "20px",
        backgroundColor: "#f8fafc",
        overflowX: "hidden",           // ✅ KEY FIX
        transition: "margin-left 0.3s ease, width 0.3s ease",
      }}
    >

        <Outlet />
      </main>
    </div>
  );
}