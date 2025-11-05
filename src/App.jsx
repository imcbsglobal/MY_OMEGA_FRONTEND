// src/App.jsx
import React, { Suspense, lazy } from "react";
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

/* HR imports (lazy if heavy) */
const AddCV = lazy(() => import("./components/HR/AddCV"));
const InterviewManagement = lazy(() => import("./components/HR/InterviewManagement"));
const OfferLetter = lazy(() => import("./components/HR/OfferLetter"));
const AddOfferLetter = lazy(() => import("./components/HR/AddOfferLetter"));
const EmployeeManagement = lazy(() => import("./components/HR/EmployeeManagement"));
const AddEmployee = lazy(() => import("./components/HR/AddEmployee"));
const Attendance = lazy(() => import("./components/HR/Attendance"));
const AttendanceSummary = lazy(() => import("./components/HR/AttendanceSummary"));
const PunchinPunchout = lazy(() => import("./components/HR/PunchinPunchout"));
const ExperienceCertificate = lazy(() => import("./components/HR/ExperienceCertificate"));
const SalaryCertificate = lazy(() => import("./components/HR/SalaryCertificate"));
const LeaveManagement = lazy(() => import("./components/HR/LeaveManagement"));

/* === User Control (Super Admin) === */
// Use explicit .jsx if your file uses that extension and your environment is picky about it
// Make sure the file exists at src/User_control/user_control_panel.jsx and has a default export.
const UserControlPanel = lazy(() => import("./User_control/user_control_panel.jsx"));
import SuperAdminRoute from "./User_control/SuperAdminRoute";

/* Global styles */
import "./App.css";

/* Small ErrorBoundary to catch render-time errors (helps debug 500s) */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // You can log to an external service here
    // console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong while rendering this part of the app.</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#900" }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <p>Please check the browser console and server logs for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppWrapper() {
  const location = useLocation();
  const hideSidebarPaths = ["/", "/login"];
  const showSidebar = !hideSidebarPaths.includes(location.pathname);

  return (
    <div className="app">
      {showSidebar && <SideBar />}
      <div className={showSidebar ? "app-content-with-sidebar" : "app-content"}>
        {/* Wrap lazy routes in Suspense so we show a fallback during load */}
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
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
          </Suspense>
        </ErrorBoundary>
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
