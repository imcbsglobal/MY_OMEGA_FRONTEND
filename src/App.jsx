// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Base_Template/Layout";
import Dashboard from "./pages/Dashboard";

import CVManagement from "./components/HR/CVManagement";
import CVForm from "./components/HR/CVForm";
import CVView from "./components/HR/CVView";
import InterviewManagement from "./components/HR/InterviewManagement";
import Interview_Form from "./components/HR/Interview_Form";
import Interview_View from "./components/HR/Interview_View";
import OfferLetter from "./components/HR/OfferLetter";
import OfferLetter_Form from "./components/HR/OfferLetter_Form";
import OfferLetter_View from "./components/HR/OfferLetter_View";
import EmployeeManagement from "./components/HR/EmployeeManagement";
import Employee_Form from "./components/HR/Employee_Form";
import Employee_View from "./components/HR/Employee_View";
import ExperienceCertificate from "./components/HR/ExperienceCertificate";
import ExperienceCertificate_Form from "./components/HR/ExperienceCertificate_Form";
import SalaryCertificate from "./components/HR/SalaryCertificate";
import SalaryCertificate_Form from "./components/HR/SalaryCertificate_Form";
import AttendanceManagement from "./components/HR/AttendanceManagement";
import AttendanceSummary from "./components/HR/AttendanceSummary";

import TotalSummary from './components/HR/TotalSummary';
import PunchInPunchOut from "./components/HR/PunchInPunchOut";
import LeaveManagement from "./components/HR/LeaveManagement";
import RequestLeave from "./components/HR/RequestLeave";

// Request pages
import LeaveRequest from "./components/HR/requests/LeaveRequest";
import LateRequest from "./components/HR/requests/LateRequest";
import EarlyRequest from "./components/HR/requests/EarlyRequest";

import JobTitles from "./components/master/JobTitles";
import JobTitleForm from "./components/master/JobTitleForm";
import Department from "./components/master/Department";
import LeaveTypeManagement from "./components/master/LeaveTypeManagement.jsx";


import UserControl from "./components/UserManagement/UserControl";
import ConfigureAccess from "./components/UserManagement/ConfigureAccess";
import AddUser from "./components/UserManagement/AddUser";
import MyMenu from "./pages/MyMenu";
import Login from "./pages/Login";

import LeaveList from './components/HR/LeaveList';
import EarlyList from './components/HR/EarlyList';
import LateList from './components/HR/LateList';
import UnderConstruction from './components/HR/UnderConstruction';

// ✅ NEW — Break List
import BreakList from "./components/HR/BreakList";

function PrivateRoute({ children }) {
  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true" &&
    !!localStorage.getItem("accessToken");

  if (!isAuthenticated) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* CV Management */}
          <Route path="cv-management" element={<CVManagement />} />
          <Route path="cv-management/add" element={<CVForm />} />
          <Route path="cv-management/edit/:uuid" element={<CVForm />} />
          <Route path="cv-management/view/:uuid" element={<CVView />} />

          {/* Interview */}
          <Route path="interview-management" element={<InterviewManagement />} />
          <Route path="interview-management/add" element={<Interview_Form />} />
          <Route path="interview-management/edit/:id" element={<Interview_Form />} />
          <Route path="interview-management/view/:id" element={<Interview_View />} />

          {/* Offer Letter */}
          <Route path="offer-letter" element={<OfferLetter />} />
          <Route path="offer-letter/add" element={<OfferLetter_Form />} />
          <Route path="offer-letter/edit/:id" element={<OfferLetter_Form />} />
          <Route path="offer-letter/view/:id" element={<OfferLetter_View />} />

          {/* Employee */}
          <Route path="employee-management" element={<EmployeeManagement />} />
          <Route path="employee-management/add" element={<Employee_Form />} />
          <Route path="employee-management/edit/:id" element={<Employee_Form />} />
          <Route path="employee-management/view/:id" element={<Employee_View />} />

             <Route path="hr/experience-certificate" element={<ExperienceCertificate />} />
          <Route path="hr/experience-certificate/add" element={<ExperienceCertificate_Form />} />
          <Route path="hr/experience-certificate/edit/:id" element={<ExperienceCertificate_Form />} />
          {/* <Route path="hr/experience-certificate/view/:id" element={<ExperienceCertificate_View />} /> */}

       
          {/* Salary Certificate */}
          <Route path="hr/salary-certificate" element={<SalaryCertificate />} />
        <Route path="hr/salary-certificate/add" element={<SalaryCertificate_Form />} />
        <Route path="hr/salary-certificate/edit/:id" element={<SalaryCertificate_Form />} />


          {/* Attendance */}
         <Route path="attendance-management" element={<AttendanceManagement />} />
          <Route path="attendance-summary" element={<AttendanceSummary />} />
          <Route path="total-summary" element={<TotalSummary />} />
          

          {/* Punch In / Out */}
          <Route path="punch-in-out" element={<PunchInPunchOut />} />

          {/* Leave Management */}
          <Route path="leave-management" element={<LeaveManagement />} />
          <Route path="leave-management/add" element={<RequestLeave />} />

          {/* Request submenu */}
          <Route path="hr/request/leave" element={<LeaveRequest />} />
          <Route path="hr/request/late" element={<LateRequest />} />
          <Route path="hr/request/early" element={<EarlyRequest />} />

          {/* Master */}
          <Route path="master/job-titles" element={<JobTitles />} />
          <Route path="master/job-titles/new" element={<JobTitleForm />} />
          <Route path="master/job-titles/:id/edit" element={<JobTitleForm />} />
          <Route path="master/department" element={<Department />} />
          <Route path="/master/leave-types" element={<LeaveTypeManagement />} />


          {/* User Management */}
          <Route path="add-user" element={<AddUser />} />
          <Route path="user-control" element={<UserControl />} />
          <Route path="configure-access/:id" element={<ConfigureAccess />} />

          {/* My Menu */}
          <Route path="my-menu" element={<MyMenu />} />

          {/* Leave Lists */}
          <Route path="/leave-management/leave-list" element={<LeaveList />} />
          <Route path="/leave-management/early-list" element={<EarlyList />} />
          <Route path="/leave-management/late-list" element={<LateList />} />

          {/* ✅ NEW — Break List Route */}
          <Route path="/leave-management/break-list" element={<BreakList />} />

          <Route path="*" element={<UnderConstruction />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;