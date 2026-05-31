import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <Link to="/home" className="admin-sidebar-logo">
          <span>أكاديمية</span> اقرأ
        </Link>
        <div className="admin-nav">
          <Link to="/admin" className={isActive('/admin')}>📊 نظرة عامة</Link>
          <Link to="/admin/courses" className={isActive('/admin/courses')}>📚 إدارة الدورات</Link>
          <Link to="/admin/instructors" className={isActive('/admin/instructors')}>👨‍🏫 إدارة المعلمين</Link>
          <Link to="/home" style={{ marginTop: 'auto' }}>⬅️ العودة للموقع</Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
