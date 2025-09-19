import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SideBar from "./components/BaseTemplate/SideBar";

// HR Components
import CVManagement from "./components/HR/CVManagement";
import InterviewManagement from "./components/HR/InterviewManagement";
import OfferLetter from "./components/HR/OfferLetter";
import EmployeeManagement from "./components/HR/EmployeeManagement";
import Attendance from "./components/HR/Attendance";

function App() {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <SideBar />

        {/* Page Content */}
        <div style={{ marginLeft: "80px", padding: "20px", flex: 1 }}>
          <Routes>
            <Route path="/hr/cv-management" element={<CVManagement />} />
            <Route path="/hr/interview-management" element={<InterviewManagement />} />
            <Route path="/hr/offer-letter" element={<OfferLetter />} />
            <Route path="/hr/employee-management" element={<EmployeeManagement />} />
            <Route path="/hr/attendance" element={<Attendance />} />
            <Route path="/hr/salary-certificate" element={<h2>Salary Certificate Page</h2>} />
            <Route path="/hr/experience-certificate" element={<h2>Experience Certificate Page</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
