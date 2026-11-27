import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientHome from './pages/client/ClientHome';
import AuthPage from './pages/client/AuthPage';
import Checkout from './pages/client/Checkout';
import CourseDetails from './pages/client/CourseDetails';
import StudentLayout from './pages/student/StudentLayout';
import StudentHome from './pages/student/StudentHome';
import MyCourses from './pages/student/MyCourses';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentReports from './pages/student/StudentReports';
import BrowseCourses from './pages/student/BrowseCourses';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentRedirect from './components/StudentRedirect';
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
import InstructorActivity from './pages/admin/InstructorActivity';
import ManageStudents from './pages/admin/ManageStudents';
import ManageConsultations from './pages/admin/ManageConsultations';
import SiteSettings from './pages/admin/SiteSettings';
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
            <Route path="instructors/:id" element={<InstructorActivity />} />
            <Route path="payouts" element={<ManagePayouts />} />
            <Route path="pages" element={<ManagePages />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="consultations" element={<ManageConsultations />} />
            <Route path="settings" element={<SiteSettings />} />
            {/* Fallback for other admin routes for now */}
            <Route path="*" element={<DashboardOverview />} />
          </Route>
          
          {/* Client Routes */}
          {/* Marketing pages: a logged-in student is sent to their portal instead */}
          <Route path="/home" element={<StudentRedirect><ClientHome /></StudentRedirect>} />
          <Route path="/radio" element={<RadioPage />} />
          <Route path="/live-haramain" element={<LiveHaramainPage />} />
          <Route path="/login" element={<StudentRedirect><AuthPage /></StudentRedirect>} />
          <Route path="/signup" element={<StudentRedirect><AuthPage /></StudentRedirect>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/courses" element={<StudentRedirect><CoursesPage /></StudentRedirect>} />
          <Route path="/instructors" element={<StudentRedirect><InstructorsPage /></StudentRedirect>} />
          <Route path="/about" element={<InfoPage page="about" />} />
          <Route path="/terms" element={<InfoPage page="terms" />} />
          <Route path="/privacy" element={<InfoPage page="privacy" />} />
          <Route path="/refund" element={<InfoPage page="refund" />} />
          <Route path="/course/:courseId" element={<StudentRedirect><CourseDetails /></StudentRedirect>} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          {/* Student portal (own layout) */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentHome />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="reports" element={<StudentReports />} />
            <Route path="browse" element={<BrowseCourses />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* Instructor Routes */}
          <Route path="/instructor" element={<ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/*" element={<ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<StudentRedirect><Navigate to="/home" replace /></StudentRedirect>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
    </LangProvider>
  );
}

export default App;
