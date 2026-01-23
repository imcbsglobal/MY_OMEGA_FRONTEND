// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/Base_Template/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MyMenu from "./pages/MyMenu";

// HR
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
import TotalSummary from "./components/HR/TotalSummary";
import PunchInPunchOut from "./components/HR/PunchInPunchOut";
import LeaveManagement from "./components/HR/LeaveManagement";
import RequestLeave from "./components/HR/RequestLeave";
import LeaveList from "./components/HR/LeaveList";
import EarlyList from "./components/HR/EarlyList";
import LateList from "./components/HR/LateList";
import BreakList from "./components/HR/BreakList";
import UnderConstruction from "./components/HR/UnderConstruction";

// Requests
import LeaveRequest from "./components/HR/requests/LeaveRequest";
import LateRequest from "./components/HR/requests/LateRequest";
import EarlyRequest from "./components/HR/requests/EarlyRequest";

// Master
import JobTitles from "./components/master/JobTitles";
import JobTitleForm from "./components/master/JobTitleForm";
import Department from "./components/master/Department";
import LeaveTypeManagement from "./components/master/LeaveTypeManagement";
import Deduction from "./components/master/Deduction";
import Allowence from "./components/master/Allowence";
import WhatsAppAdmin from "./components/master/WhatsAppAdmin";

// User Management
import UserControl from "./components/UserManagement/UserControl";
import ConfigureAccess from "./components/UserManagement/ConfigureAccess";
import AddUser from "./components/UserManagement/AddUser";

// Payroll
import Payroll from "./components/Payroll/Payroll";
import Payslip from "./components/Payroll/Payslip";

// 🔐 Private Route
function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>

      {/* 🔔 GLOBAL NOTIFICATIONS */}
      <ToastContainer />

      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="cv-management" element={<CVManagement />} />
          <Route path="cv-management/add" element={<CVForm />} />
          <Route path="cv-management/edit/:uuid" element={<CVForm />} />
          <Route path="cv-management/view/:uuid" element={<CVView />} />

          <Route path="interview-management" element={<InterviewManagement />} />
          <Route path="interview-management/add" element={<Interview_Form />} />
          <Route path="interview-management/edit/:id" element={<Interview_Form />} />
          <Route path="interview-management/view/:id" element={<Interview_View />} />

          <Route path="offer-letter" element={<OfferLetter />} />
          <Route path="offer-letter/add" element={<OfferLetter_Form />} />
          <Route path="offer-letter/edit/:id" element={<OfferLetter_Form />} />
          <Route path="offer-letter/view/:id" element={<OfferLetter_View />} />

          <Route path="employee-management" element={<EmployeeManagement />} />
          <Route path="employee-management/add" element={<Employee_Form />} />
          <Route path="employee-management/edit/:id" element={<Employee_Form />} />
          <Route path="employee-management/view/:id" element={<Employee_View />} />

          <Route path="experience-certificate" element={<ExperienceCertificate />} />
          <Route path="experience-certificate/add" element={<ExperienceCertificate_Form />} />
          <Route path="experience-certificate/edit/:id" element={<ExperienceCertificate_Form />} />

          <Route path="salary-certificate" element={<SalaryCertificate />} />
          <Route path="salary-certificate/add" element={<SalaryCertificate_Form />} />
          <Route path="salary-certificate/edit/:id" element={<SalaryCertificate_Form />} />

          <Route path="attendance-management" element={<AttendanceManagement />} />
          <Route path="attendance-summary" element={<AttendanceSummary />} />
          <Route path="total-summary" element={<TotalSummary />} />
          <Route path="punch-in-out" element={<PunchInPunchOut />} />

          <Route path="leave-management" element={<LeaveManagement />} />
          <Route path="leave-management/add" element={<RequestLeave />} />
          <Route path="leave-management/leave-list" element={<LeaveList />} />
          <Route path="leave-management/early-list" element={<EarlyList />} />
          <Route path="leave-management/late-list" element={<LateList />} />

          <Route path="hr/request/leave" element={<LeaveRequest />} />
          <Route path="hr/request/late" element={<LateRequest />} />
          <Route path="hr/request/early" element={<EarlyRequest />} />

          <Route path="master/job-titles" element={<JobTitles />} />
          <Route path="master/job-titles/new" element={<JobTitleForm />} />
          <Route path="master/job-titles/:id/edit" element={<JobTitleForm />} />
          <Route path="master/department" element={<Department />} />
          <Route path="master/leave-types" element={<LeaveTypeManagement />} />
          <Route path="master/deductions" element={<Deduction />} />
          <Route path="master/allowences" element={<Allowence />} />
          <Route path="master/whatsapp-admin" element={<WhatsAppAdmin />} />

          <Route path="payroll" element={<Payroll />} />
          <Route path="payroll/processing" element={<Payroll />} />
          <Route path="payslip" element={<Payslip />} />

          <Route path="add-user" element={<AddUser />} />
          <Route path="user-control" element={<UserControl />} />
          <Route path="configure-access/:id" element={<ConfigureAccess />} />

          <Route path="my-menu" element={<MyMenu />} />

          <Route path="*" element={<UnderConstruction />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
