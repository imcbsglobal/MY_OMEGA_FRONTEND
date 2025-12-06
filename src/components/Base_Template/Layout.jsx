import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";

export default function Layout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Navbar />

      <main
        style={{
          marginLeft: isMobile ? "0px" : "280px",
          flex: 1,
          minHeight: "100vh",
          padding: "20px",
          backgroundColor: "#f8fafc",
          transition: "margin 0.3s ease",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}