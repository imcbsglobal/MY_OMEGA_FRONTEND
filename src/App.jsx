// src/App.jsx - UPDATED WITH NEW TARGET MANAGEMENT COMPONENTS
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
import OfficeSetup from './components/master/OfficeSetup';
import VehicleMaster from "./components/master/Vehiclemaster";

// User Management
import UserControl from "./components/UserManagement/UserControl";
import ConfigureAccess from "./components/UserManagement/ConfigureAccess";
import AddUser from "./components/UserManagement/AddUser";

// Payroll
import PayrollPage from "./components/Payroll/PayrollPage";
import PayslipPage from "./components/Payroll/PayslipPage";

// Vehicle Management
import FuelManagement from "./components/VehicleManagement/FuelManagement";
import Travel from "./components/VehicleManagement/Travel";
import VehicleChallan from "./components/VehicleManagement/VehicleChallan";

// Delivery Management
import DeliveryList from "./components/DeliveryManagement/DeliveryList";
import DeliveryForm from "./components/DeliveryManagement/DeliveryForm";
import DeliveryDetail from "./components/DeliveryManagement/DeliveryDetail";
import DeliveryStops from "./components/DeliveryManagement/DeliveryStops";
import DeliveryProducts from "./components/DeliveryManagement/DeliveryProducts";

// Target Management - Existing Components
import RouteTargetAssign from "./components/TargetManagement/Routetargetassign";
import RouteTargetList from "./components/TargetManagement/Routetargetlist";
import CallTargetAssign from "./components/TargetManagement/Calltargetassign";
import CallTargetList from "./components/TargetManagement/Calltargetlist";
import RouteManager from "./components/master/RouteManager";
import ProductManager from "./components/master/ProductManager";
import RouteSummary from "./components/TargetManagement/RouteSummary";
import CallSummary from "./components/TargetManagement/CallSummary";
// CallDaily component removed

// Target Management - NEW Components
import EmployeeTargetView from "./components/TargetManagement/Employeetargetview";
import EmployeeTargetReport from "./components/TargetManagement/Employeetargetreport";
import ManagerDashboard from "./components/TargetManagement/Managerdashboard";
import ComparativePerformance from "./components/TargetManagement/ComparativePerformance";
// import EmployeeDetailedReport from "./components/TargetManagement/EmployeeDetailedReport";


// 🔒 Private Route
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

          {/* HR Routes */}
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

          {/* Master Routes */}
          <Route path="master/job-titles" element={<JobTitles />} />
          <Route path="master/job-titles/new" element={<JobTitleForm />} />
          <Route path="master/job-titles/:id/edit" element={<JobTitleForm />} />
          <Route path="master/department" element={<Department />} />
          <Route path="master/leave-types" element={<LeaveTypeManagement />} />
          <Route path="master/deductions" element={<Deduction />} />
          <Route path="master/allowences" element={<Allowence />} />
          <Route path="master/whatsapp-admin" element={<WhatsAppAdmin />} />
          
          {/* Office Setup Routes */}
          <Route path="hr/master/office-setup" element={<OfficeSetup />} />
          <Route path="master/office-setup" element={<OfficeSetup />} />

          {/* Vehicle Master Route */}
          <Route path="master/vehicle-master" element={<VehicleMaster />} />

          {/* Payroll Routes */}
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="payroll/processing" element={<PayrollPage />} />
          <Route path="payslip" element={<PayslipPage />} />

          {/* Vehicle Management Routes */}
          <Route path="vehicle/fuel-management" element={<FuelManagement />} />
          <Route path="vehicle/travel" element={<Travel />} />
          <Route path="vehicle/challan" element={<VehicleChallan />} />

          {/* ============== TARGET MANAGEMENT ROUTES ============== */}
          
          {/* 🆕 Employee Self-Service Routes */}
          <Route path="target/my-targets" element={<EmployeeTargetView />} />
          <Route path="target/update-report" element={<EmployeeTargetReport />} />
          
          {/* 🆕 Manager Dashboard */}
          <Route path="target/dashboard" element={<ManagerDashboard />} />
          <Route path="target/performance/comparative" element={<ComparativePerformance />} />
          {/* <Route path="target/performance/employee/:id/detailed-report" element={<EmployeeDetailedReport />} /> */}
          
          {/* Route Targets - Admin/Manager */}
          <Route path="target/route/assign" element={<RouteTargetAssign />} />
          <Route path="target/route/list" element={<RouteTargetList />} />
          <Route path="target/route/performance" element={<RouteSummary />} />
          
          {/* Call Targets - Admin/Manager */}
          <Route path="target/call/assign" element={<CallTargetAssign />} />
          <Route path="target/call/list" element={<CallTargetList />} />
          {/* CallDaily route removed */}
          <Route path="target/call/performance" element={<CallSummary />} />
          
          {/* Target Master Data */}
          <Route path="target/master/routes" element={<RouteManager />} />
          <Route path="target/master/products" element={<ProductManager />} />
          
          {/* Target Reports - Legacy routes (keeping for backward compatibility) */}
          <Route path="target/reports/dashboard" element={<ManagerDashboard />} />
          <Route path="target/reports/route-summary" element={<RouteSummary />} />
          <Route path="target/reports/call-summary" element={<CallSummary />} />
          

          {/* ============================================================ */}

          {/* User Management Routes */}
          <Route path="add-user" element={<AddUser />} />
          <Route path="user-control" element={<UserControl />} />
          <Route path="configure-access/:id" element={<ConfigureAccess />} />

          {/* Delivery Management */}
          <Route path="delivery-management/deliveries" element={<DeliveryList />} />
          <Route path="delivery-management/deliveries/new" element={<DeliveryForm />} />
          <Route path="delivery-management/deliveries/:id" element={<DeliveryDetail />} />
          <Route path="delivery-management/deliveries/:id/edit" element={<DeliveryForm />} />
          <Route path="delivery-management/deliveries/:id/stops" element={<DeliveryStops />} />
          <Route path="delivery-management/deliveries/:id/products" element={<DeliveryProducts />} />

          <Route path="my-menu" element={<MyMenu />} />

          {/* Catch-all route for 404 - MUST BE LAST */}
          <Route path="*" element={<UnderConstruction />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;          