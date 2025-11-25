import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div>
      <Navbar />
      <main style={{ marginTop: "150px", padding: "20px" }}>

        <Outlet />
      </main>
    </div>
  );
}
