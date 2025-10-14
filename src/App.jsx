import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Login/LoginPage";
import CVManagement from "./components/HR/CVManagement";
import AddCV from "./components/HR/AddCV";
import InterviewManagement from "./components/HR/InterviewManagement";
import OfferLetter from "./components/HR/OfferLetter";
import AddOfferLetter from "./components/HR/AddOfferLetter";
import EmployeeManagement from "./components/HR/EmployeeManagement";
import AddEmployee from "./components/HR/AddEmployee";
import Attendance from "./components/HR/Attendance";
import AttendanceSummary from "./components/HR/AttendanceSummary";
import PunchinPunchout from "./components/HR/PunchinPunchout";
import ExperienceCertificate from "./components/HR/ExperienceCertificate";
import SalaryCertificate from "./components/HR/SalaryCertificate";
import SideBar from "./components/BaseTemplate/SideBar";
import LeaveManagement from "./components/HR/LeaveManagement";
import UserList from "./components/User/UserList";

import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app">
        {/* ✅ Show sidebar only when authenticated */}
        {isAuthenticated && <SideBar onLogout={handleLogout} />}

        <div className={isAuthenticated ? "app-content-with-sidebar" : "app-content-full"}>
          <Routes>
            {/* ✅ Home Page = CVManagement */}
            <Route
              path="/"
              element={
                isAuthenticated ? <CVManagement /> : <Navigate to="/login" replace />
              }
            />

            {/* ✅ Login Route */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />

            {/* ✅ HR Management Routes */}
            <Route path="/hr/cv-management" element={isAuthenticated ? <CVManagement /> : <Navigate to="/login" replace />} />
            <Route path="/hr/add-cv" element={isAuthenticated ? <AddCV /> : <Navigate to="/login" replace />} />
            <Route path="/hr/interview-management" element={isAuthenticated ? <InterviewManagement /> : <Navigate to="/login" replace />} />
            <Route path="/hr/offer-letter" element={isAuthenticated ? <OfferLetter /> : <Navigate to="/login" replace />} />
            <Route path="/hr/add-offer-letter" element={isAuthenticated ? <AddOfferLetter /> : <Navigate to="/login" replace />} />
            <Route path="/hr/employee-management" element={isAuthenticated ? <EmployeeManagement /> : <Navigate to="/login" replace />} />
            <Route path="/hr/add-employee" element={isAuthenticated ? <AddEmployee /> : <Navigate to="/login" replace />} />
            <Route path="/hr/attendance" element={isAuthenticated ? <Attendance /> : <Navigate to="/login" replace />} />
            <Route path="/hr/punchinpunchout" element={isAuthenticated ? <PunchinPunchout /> : <Navigate to="/login" replace />} />
            <Route path="/hr/attendance/summary/:employeeId" element={isAuthenticated ? <AttendanceSummary /> : <Navigate to="/login" replace />} />
            <Route path="/hr/leave-management" element={isAuthenticated ? <LeaveManagement /> : <Navigate to="/login" replace />} />
            <Route path="/hr/ExperienceCertificate" element={isAuthenticated ? <ExperienceCertificate /> : <Navigate to="/login" replace />} />
            <Route path="/hr/SalaryCertificate" element={isAuthenticated ? <SalaryCertificate /> : <Navigate to="/login" replace />} />

            {/* ✅ User Management */}
            <Route path="/user/list" element={isAuthenticated ? <UserList /> : <Navigate to="/login" replace />} />

            {/* ✅ Redirect any unknown route to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
