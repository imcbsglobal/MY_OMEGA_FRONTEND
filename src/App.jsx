import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./Login/LoginPage";
import CVManagement from "./components/HR/CVManagement";
import AddCV from './components/HR/AddCV';
import InterviewManagement from "./components/HR/InterviewManagement";
import OfferLetter from "./components/HR/OfferLetter";
import AddOfferLetter from "./components/HR/AddOfferLetter";
import EmployeeManagement from './components/HR/EmployeeManagement';
import AddEmployee from './components/HR/AddEmployee'; // ✅ New import
import Attendance from './components/HR/Attendance';
import ExperienceCertificate from './components/HR/ExperienceCertificate';
import SalaryCertificate from './components/HR/SalaryCertificate';
import SideBar from './components/BaseTemplate/SideBar';

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on app load
  useState(() => {
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
        {/* Show sidebar only when authenticated */}
        {isAuthenticated && <SideBar onLogout={handleLogout} />}
        
        <div className={isAuthenticated ? "app-content-with-sidebar" : "app-content-full"}>
          <Routes>
            {/* Login Route */}
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <LoginPage onLogin={handleLogin} />
                ) : (
                  <Navigate to="/hr/cv-management" replace />
                )
              } 
            />

            {/* Protected HR Routes */}
            <Route 
              path="/hr/cv-management" 
              element={
                isAuthenticated ? <CVManagement /> : <Navigate to="/login" replace />
              } 
            />

            {/* Add CV Route */}
            <Route 
              path="/hr/add-cv" 
              element={
                isAuthenticated ? <AddCV /> : <Navigate to="/login" replace />
              } 
            />

            {/* Add Employee Route */}
            <Route 
              path="/hr/add-employee" 
              element={
                isAuthenticated ? <AddEmployee /> : <Navigate to="/login" replace />
              } 
            />

            {/* Add Offer Letter Route */}
            <Route 
              path="/hr/add-offer-letter" 
              element={
                isAuthenticated ? <AddOfferLetter /> : <Navigate to="/login" replace />
              } 
            />

            <Route 
              path="/hr/interview-management" 
              element={
                isAuthenticated ? <InterviewManagement /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/hr/offer-letter" 
              element={
                isAuthenticated ? <OfferLetter /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/hr/employee-management" 
              element={
                isAuthenticated ? <EmployeeManagement /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/hr/attendance" 
              element={
                isAuthenticated ? <Attendance /> : <Navigate to="/login" replace />
              } 
            />
             <Route 
              path="/hr/ExperienceCertificate" 
              element={
                isAuthenticated ? <ExperienceCertificate /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/hr/SalaryCertificate" 
              element={
                isAuthenticated ? <SalaryCertificate /> : <Navigate to="/login" replace />
              } 
            />

            {/* Default Route */}
            <Route 
              path="/" 
              element={
                <Navigate to={isAuthenticated ? "/hr/cv-management" : "/login"} replace />
              } 
            />

            {/* Catch all unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;