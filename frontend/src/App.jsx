import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientHome from './pages/client/ClientHome';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ManageCourses from './pages/admin/ManageCourses';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="courses" element={<ManageCourses />} />
            {/* Fallback for other admin routes for now */}
            <Route path="*" element={<DashboardOverview />} />
          </Route>
          
          {/* Client Routes */}
          <Route path="/home" element={<ClientHome />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
