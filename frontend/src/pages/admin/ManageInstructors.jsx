import React, { useState, useEffect } from 'react';

const ManageInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form State
  const [newInstructor, setNewInstructor] = useState({ name: '', rank: '', schedule: '', attendance: 100, salary: '' });
  const [editingInstructor, setEditingInstructor] = useState(null);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://acadamy-iqra-production.up.railway.app/api/admin/instructors');
      const data = await res.json();
      setInstructors(data);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleDownloadReport = () => {
    const headers = ['ID', 'Name', 'Rank', 'Schedule', 'Attendance (%)', 'Salary'];
    const rows = instructors.map(inst => [
      inst._id, `"${inst.name}"`, `"${inst.rank}"`, `"${inst.schedule}"`, inst.attendance || 100, `"${inst.salary}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Instructors_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('https://acadamy-iqra-production.up.railway.app/api/admin/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstructor)
      });
      setIsModalOpen(false);
      setNewInstructor({ name: '', rank: '', schedule: '', attendance: 100, salary: '' });
      fetchInstructors();
    } catch (err) {
      console.error('Failed to add instructor:', err);
    }
  };

  const openEditModal = (inst) => {
    setEditingInstructor(inst);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`https://acadamy-iqra-production.up.railway.app/api/admin/instructors/${editingInstructor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingInstructor)
      });
      setIsEditModalOpen(false);
      setEditingInstructor(null);
      fetchInstructors();
    } catch (err) {
      console.error('Failed to update instructor:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) return;
    try {
      await fetch(`https://acadamy-iqra-production.up.railway.app/api/admin/instructors/${id}`, {
        method: 'DELETE'
      });
      fetchInstructors();
    } catch (err) {
      console.error('Failed to delete instructor:', err);
    }
  };

  return (
    <div className="manage-instructors-page" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>
          Manage Instructors
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-outline" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>
            + Add Instructor
          </button>
          <button onClick={handleDownloadReport} className="btn btn-accent">
            📥 Download Report
          </button>
        </div>
      </div>

      <div className="table-container" style={{ background: 'var(--card-bg)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading instructors...</p>
        ) : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(250, 204, 21, 0.3)' }}>
                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Rank</th>
                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Schedule</th>
                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Attendance</th>
                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Salary</th>
                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((inst) => (
                <tr key={inst._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '1.5rem 1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{inst.name}</td>
                  <td style={{ padding: '1.5rem 1rem' }}>
                    <span style={{ background: 'rgba(3, 105, 161, 0.2)', color: 'var(--accent-color)', padding: '0.4rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {inst.rank || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>{inst.schedule || 'TBD'}</td>
                  <td style={{ padding: '1.5rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '100px', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${inst.attendance || 100}%`, height: '100%', background: (inst.attendance || 100) >= 95 ? 'var(--primary-color)' : 'var(--accent-color)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{inst.attendance || 100}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{inst.salary || 'TBD'}</td>
                  <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => openEditModal(inst)} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', marginRight: '1rem', fontWeight: 'bold' }}>Edit</button>
                    <button onClick={() => handleDelete(inst._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {instructors.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No instructors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Instructor Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(250, 204, 21, 0.2)', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>Add Instructor</h2>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">Full Name</label><input required type="text" className="form-control" value={newInstructor.name} onChange={e => setNewInstructor({...newInstructor, name: e.target.value})} placeholder="e.g. Sheikh Ahmed" /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">Rank / Specialty</label><input required type="text" className="form-control" value={newInstructor.rank} onChange={e => setNewInstructor({...newInstructor, rank: e.target.value})} placeholder="e.g. Senior Qari" /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">Schedule</label><input required type="text" className="form-control" value={newInstructor.schedule} onChange={e => setNewInstructor({...newInstructor, schedule: e.target.value})} placeholder="e.g. Mon, Wed, Fri" /></div>
              <div style={{ marginBottom: '2rem' }}><label className="form-label">Initial Salary</label><input required type="text" className="form-control" value={newInstructor.salary} onChange={e => setNewInstructor({...newInstructor, salary: e.target.value})} placeholder="e.g. $1,000" /></div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '1rem' }}>Confirm Addition</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Instructor Modal */}
      {isEditModalOpen && editingInstructor && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(250, 204, 21, 0.2)', position: 'relative' }}>
            <button onClick={() => setIsEditModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>Edit Instructor</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">Full Name</label><input required type="text" className="form-control" value={editingInstructor.name} onChange={e => setEditingInstructor({...editingInstructor, name: e.target.value})} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">Rank / Specialty</label><input required type="text" className="form-control" value={editingInstructor.rank} onChange={e => setEditingInstructor({...editingInstructor, rank: e.target.value})} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">Schedule</label><input required type="text" className="form-control" value={editingInstructor.schedule} onChange={e => setEditingInstructor({...editingInstructor, schedule: e.target.value})} /></div>
              <div style={{ marginBottom: '2rem' }}><label className="form-label">Salary</label><input required type="text" className="form-control" value={editingInstructor.salary} onChange={e => setEditingInstructor({...editingInstructor, salary: e.target.value})} /></div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '1rem' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageInstructors;
