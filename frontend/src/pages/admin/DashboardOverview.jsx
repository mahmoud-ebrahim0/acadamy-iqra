import React, { useEffect, useState } from 'react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({ totalCourses: 12, totalInstructors: 8, totalStudents: 1450 });
  const [enrollments, setEnrollments] = useState([
    { _id: '1', student: { name: 'Ahmed Ali' }, course: { title: 'Quran Memorization (Hifz)' }, paymentStatus: 'Paid' },
    { _id: '2', student: { name: 'Sarah Hassan' }, course: { title: 'Advanced Tajweed' }, paymentStatus: 'Paid' },
    { _id: '3', student: { name: 'Omar Youssef' }, course: { title: 'Islamic Studies' }, paymentStatus: 'Pending' },
    { _id: '4', student: { name: 'Fatima Noor' }, course: { title: 'Arabic for Non-Natives' }, paymentStatus: 'Paid' }
  ]);

  useEffect(() => {
    // Static data is already loaded in state.
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
              <th>Enrolled Course</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length > 0 ? enrollments.map(enr => (
              <tr key={enr._id}>
                <td style={{ fontWeight: 'bold' }}>{enr.student?.name}</td>
                <td style={{ color: '#cbd5e1' }}>{enr.course?.title}</td>
                <td>
                  <span style={{ 
                    color: enr.paymentStatus === 'Paid' ? '#4ade80' : '#f87171', 
                    textShadow: enr.paymentStatus === 'Paid' ? '0 0 10px rgba(74, 222, 128, 0.5)' : '0 0 10px rgba(248, 113, 113, 0.5)' 
                  }}>
                    ● {enr.paymentStatus}
                  </span>
                </td>
                <td><button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Manage</button></td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No active enrollments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOverview;
