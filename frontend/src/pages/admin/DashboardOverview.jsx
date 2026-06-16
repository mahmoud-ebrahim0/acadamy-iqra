import React, { useEffect, useState } from 'react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({ totalCourses: 0, totalInstructors: 0, totalStudents: 0 });

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div className="admin-header">
        <h2>Academy Overview</h2>
        <button className="btn btn-accent">Download Report</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalInstructors}</div>
          <div className="stat-label">Total Instructors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Enrolled Students</div>
        </div>
      </div>

      <div className="admin-table-container">
        <h3 style={{ padding: '1.5rem', borderBottom: '1px dashed rgba(255,255,255,0.1)', color: 'var(--primary-color)', textShadow: '0 0 10px rgba(250,204,21,0.3)' }}>Student Management</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Enrolled Courses</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Ahmed Mohammed</td>
              <td style={{ color: '#cbd5e1' }}>Reading & Writing Arabic, Juz Amma</td>
              <td><span style={{ color: '#4ade80', textShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }}>● Paid</span></td>
              <td><button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Manage</button></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Sara Ali</td>
              <td style={{ color: '#cbd5e1' }}>Quran Memorization</td>
              <td><span style={{ color: '#f87171', textShadow: '0 0 10px rgba(248, 113, 113, 0.5)' }}>● Pending</span></td>
              <td><button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Manage</button></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Omar Khaled</td>
              <td style={{ color: '#cbd5e1' }}>Islamic Education</td>
              <td><span style={{ color: '#4ade80', textShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }}>● Paid</span></td>
              <td><button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Manage</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOverview;
