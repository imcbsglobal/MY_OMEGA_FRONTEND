import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CVManagement from "./components/HR/CVManagement";
import AddCV from './components/HR/AddCV';
import InterviewManagement from "./components/HR/InterviewManagement";
import OfferLetter from "./components/HR/OfferLetter";
import AddOfferLetter from "./components/HR/AddOfferLetter";
import EmployeeManagement from './components/HR/EmployeeManagement';
import AddEmployee from './components/HR/AddEmployee';
import Attendance from './components/HR/Attendance';
import AttendanceSummary from './components/HR/AttendanceSummary';
import PunchinPunchout from './components/HR/PunchinPunchout';
import ExperienceCertificate from './components/HR/ExperienceCertificate';
import SalaryCertificate from './components/HR/SalaryCertificate';
import SideBar from './components/BaseTemplate/SideBar';
import LeaveManagement from "./components/HR/LeaveManagement";
import UserList from "./components/User/UserList";

import './App.css';

function App() {
  const handleLogout = () => {
    // Optional: Add any logout logic here if needed
    console.log("Logout clicked");
  };

  return (
    <Router>
      <div className="app">
        {/* Always show sidebar */}
        <SideBar onLogout={handleLogout} />

        <div className="app-content-with-sidebar">
          <Routes>
            {/* HR Routes */}
            <Route path="/hr/cv-management" element={<CVManagement />} />
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
            <Route path="/hr/ExperienceCertificate" element={<ExperienceCertificate />} />
            <Route path="/hr/SalaryCertificate" element={<SalaryCertificate />} />

            {/* USER MANAGEMENT ROUTES */}
            <Route path="/user/list" element={<UserList />} />

            {/* Default Route - Redirect to CV Management */}
            <Route path="/" element={<Navigate to="/hr/cv-management" replace />} />
            <Route path="*" element={<Navigate to="/hr/cv-management" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;