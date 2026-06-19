import React, { useState, useEffect } from 'react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({ totalCourses: 0, totalInstructors: 0, totalStudents: 0 });
  const [enrollments, setEnrollments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editingEnr, setEditingEnr] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newSchedule, setNewSchedule] = useState('');
  const [newZoomLink, setNewZoomLink] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, enrRes, instRes] = await Promise.all([
        fetch('https://acadamy-iqra-production.up.railway.app/api/admin/stats'),
        fetch('https://acadamy-iqra-production.up.railway.app/api/admin/enrollments'),
        fetch('https://acadamy-iqra-production.up.railway.app/api/admin/instructors')
      ]);
      const statsData = await statsRes.json();
      const enrData = await enrRes.json();
      const instData = await instRes.json();
      
      setStats(statsData);
      setEnrollments(enrData);
      setInstructors(instData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this enrollment?')) return;
    try {
      await fetch(`https://acadamy-iqra-production.up.railway.app/api/admin/enrollments/${id}`, {
        method: 'DELETE'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const openEditModal = (enr) => {
    setEditingEnr(enr);
    setNewStatus(enr.paymentStatus);
    setNewInstructor(enr.instructor?._id || '');
    setNewSchedule(enr.scheduleTime || '');
    setNewZoomLink(enr.zoomLink || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`https://acadamy-iqra-production.up.railway.app/api/admin/enrollments/${editingEnr._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentStatus: newStatus,
          instructor: newInstructor === '' ? null : newInstructor,
          scheduleTime: newSchedule,
          zoomLink: newZoomLink
        })
      });
      setEditingEnr(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Academy Overview</h2>
        <button className="btn btn-accent" onClick={fetchDashboardData}>Refresh Data</button>
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
        <h3 style={{ padding: '1.5rem', borderBottom: '1px dashed rgba(0,0,0,0.1)', color: 'var(--primary-color)', textShadow: '0 0 10px rgba(250,204,21,0.3)' }}>Student Assignments & Management</h3>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Enrolled Course</th>
                <th>Assigned Instructor</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length > 0 ? enrollments.map(enr => (
                <tr key={enr._id}>
                  <td style={{ fontWeight: 'bold' }}>{enr.student?.name || 'Unknown Student'}</td>
                  <td style={{ color: '#cbd5e1' }}>{enr.course?.title || 'Unknown Course'}</td>
                  <td>
                    {enr.instructor ? (
                      <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{enr.instructor.name}</span>
                    ) : (
                      <span style={{ color: '#fbbf24', fontStyle: 'italic' }}>Pending Assignment</span>
                    )}
                  </td>
                  <td>
                    <span style={{ 
                      color: enr.paymentStatus === 'Paid' ? '#4ade80' : '#f87171', 
                      textShadow: enr.paymentStatus === 'Paid' ? '0 0 10px rgba(74, 222, 128, 0.5)' : '0 0 10px rgba(248, 113, 113, 0.5)' 
                    }}>
                      ● {enr.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(enr)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>Edit</button>
                      <button onClick={() => handleDelete(enr._id)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No active enrollments found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editingEnr && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }}>
          <div style={{
            background: 'var(--card-bg)', padding: '3rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', border: '1px solid rgba(250, 204, 21, 0.2)'
          }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Manage Student</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Student: <strong>{editingEnr.student?.name}</strong></p>
            <form onSubmit={handleUpdate}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Payment Status</label>
                <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ background: '#0B1930' }}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Assign Instructor</label>
                <select className="form-control" value={newInstructor} onChange={e => setNewInstructor(e.target.value)} style={{ background: '#0B1930' }}>
                  <option value="">-- Unassigned (Pending) --</option>
                  {instructors.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name} ({inst.rank})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Schedule Time</label>
                <input type="text" className="form-control" value={newSchedule} onChange={e => setNewSchedule(e.target.value)} placeholder="e.g. Mon, Wed 5:00 PM" style={{ background: '#0B1930' }} />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Zoom Link</label>
                <input type="url" className="form-control" value={newZoomLink} onChange={e => setNewZoomLink(e.target.value)} placeholder="https://zoom.us/j/..." style={{ background: '#0B1930' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditingEnr(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
