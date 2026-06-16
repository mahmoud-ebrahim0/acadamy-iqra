import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientHome from './pages/client/ClientHome';
import AuthPage from './pages/client/AuthPage';
import Checkout from './pages/client/Checkout';
import StudentDashboard from './pages/client/StudentDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ManageCourses from './pages/admin/ManageCourses';
import ManageInstructors from './pages/admin/ManageInstructors';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import './index.css';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="instructors" element={<ManageInstructors />} />
            {/* Fallback for other admin routes for now */}
            <Route path="*" element={<DashboardOverview />} />
          </Route>
          
          {/* Client Routes */}
          <Route path="/home" element={<ClientHome />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/dashboard" element={<UserProtectedRoute><StudentDashboard /></UserProtectedRoute>} />
          
          {/* Instructor Routes */}
          <Route path="/instructor" element={<UserProtectedRoute><InstructorDashboard /></UserProtectedRoute>} />
          <Route path="/instructor/*" element={<UserProtectedRoute><InstructorDashboard /></UserProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
