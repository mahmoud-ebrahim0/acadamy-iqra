import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientHome from './pages/client/ClientHome';
import AuthPage from './pages/client/AuthPage';
import Checkout from './pages/client/Checkout';
import CourseDetails from './pages/client/CourseDetails';
import StudentDashboard from './pages/client/StudentDashboard';
import StudentProfile from './pages/client/StudentProfile';
import RadioPage from './pages/client/RadioPage';
import LiveHaramainPage from './pages/client/LiveHaramainPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ManageCourses from './pages/admin/ManageCourses';
import ManageInstructors from './pages/admin/ManageInstructors';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InfoPage from './pages/client/InfoPage';
import { CoursesPage, InstructorsPage } from './pages/client/CoursesPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/client/PasswordResetPages';
import ManagePayouts from './pages/admin/ManagePayouts';
import ManagePages from './pages/admin/ManagePages';
import ProtectedRoute from './components/ProtectedRoute';
import LangProvider from './i18n/LangProvider';
import ScrollToTop from './components/ScrollToTop';
import './index.css';

function App() {
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
  }, []);

  return (
    <LangProvider>
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <Routes>
          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="instructors" element={<ManageInstructors />} />
            <Route path="payouts" element={<ManagePayouts />} />
            <Route path="pages" element={<ManagePages />} />
            {/* Fallback for other admin routes for now */}
            <Route path="*" element={<DashboardOverview />} />
          </Route>
          
          {/* Client Routes */}
          <Route path="/home" element={<ClientHome />} />
          <Route path="/radio" element={<RadioPage />} />
          <Route path="/live-haramain" element={<LiveHaramainPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/about" element={<InfoPage page="about" />} />
          <Route path="/terms" element={<InfoPage page="terms" />} />
          <Route path="/privacy" element={<InfoPage page="privacy" />} />
          <Route path="/refund" element={<InfoPage page="refund" />} />
          <Route path="/course/:courseId" element={<CourseDetails />} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
          
          {/* Instructor Routes */}
          <Route path="/instructor" element={<ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/*" element={<ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
    </LangProvider>
  );
}

export default App;
