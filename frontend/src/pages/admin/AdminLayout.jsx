import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/home');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <Link to="/home" className="admin-sidebar-logo">
          <span>Tarteel</span> Academy
        </Link>
        <div className="admin-nav">
          <Link to="/admin" className={isActive('/admin')}>📊 Overview</Link>
          <Link to="/admin/courses" className={isActive('/admin/courses')}>📚 Manage Courses</Link>
          <Link to="/admin/instructors" className={isActive('/admin/instructors')}>👨‍🏫 Manage Instructors</Link>

          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', textAlign: 'left', fontWeight: '600', padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '1rem' }}>🚪 Logout</button>
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
