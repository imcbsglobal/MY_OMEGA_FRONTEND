// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import LoginPage from "./Login/LoginPage"; // src/Login/LoginPage.jsx
import UserList from "./components/User/UserList";
import AddUser from "./components/User/AddUser";
import SideBar from "./components/BaseTemplate/SideBar";

/* HR imports */
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
import LeaveManagement from "./components/HR/LeaveManagement";

import "./App.css";

/* === User Control (Super Admin) === */
import SuperAdminRoute from "./User_control/SuperAdminRoute";
import UserControlPanel from "./User_control/user_control_panel";

function AppWrapper() {
  const location = useLocation();
  const hideSidebarPaths = ["/", "/login"];
  const showSidebar = !hideSidebarPaths.includes(location.pathname);

  return (
    <div className="app">
      {showSidebar && <SideBar />}
      <div className={showSidebar ? "app-content-with-sidebar" : "app-content"}>
        <Routes>
          {/* Auth / public */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* User management */}
          <Route path="/user/list" element={<UserList />} />
          <Route path="/user/add" element={<AddUser />} />

          {/* HR routes */}
          <Route path="/hr/add-cv" element={<AddCV />} />
          <Route path="/hr/interview-management" element={<InterviewManagement />} />
          <Route path="/hr/offer-letter" element={<OfferLetter />} />
          <Route path="/hr/add-offer-letter" element={<AddOfferLetter />} />
          <Route path="/hr/employee-management" element={<EmployeeManagement />} />
          <Route path="/hr/add-employee" element={<AddEmployee />} />
          <Route path="/hr/attendance" element={<Attendance />} />
          <Route path="/hr/punchinpunchout" element={<PunchinPunchout />} />
          <Route path="/hr/attendance/summary/:employeeId" element={<AttendanceSummary />} />
          <Route path="/hr/leave-management" element={<LeaveManagement />} />
          <Route path="/hr/experience-certificate" element={<ExperienceCertificate />} />
          <Route path="/hr/salary-certificate" element={<SalaryCertificate />} />

          {/* === Super Admin only routes === */}
          <Route element={<SuperAdminRoute />}>
            <Route path="/admin/user-control" element={<UserControlPanel />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
