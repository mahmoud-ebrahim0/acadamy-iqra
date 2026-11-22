import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

const DashboardOverview = () => {
  const { t } = useAdminLang();
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
  const [updateError, setUpdateError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, enrRes, instRes] = await Promise.all([
        fetchWithAuth('/api/admin/stats'),
        fetchWithAuth('/api/admin/enrollments'),
        fetchWithAuth('/api/admin/instructors')
      ]);
      const [statsData, enrData, instData] = await Promise.all([readJson(statsRes), readJson(enrRes), readJson(instRes)]);

      if (statsRes.ok) setStats(statsData);
      setEnrollments(Array.isArray(enrData) ? enrData : []);
      setInstructors(Array.isArray(instData) ? instData : []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API on mount
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('overview.confirmDelete'))) return;
    try {
      await fetchWithAuth(`/api/admin/enrollments/${id}`, {
        method: 'DELETE'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const openEditModal = (enr) => {
    setUpdateError('');
    setEditingEnr(enr);
    setNewStatus(enr.paymentStatus);
    setNewInstructor(enr.instructor?._id || '');
    setNewSchedule(enr.scheduleTime || '');
    setNewZoomLink(enr.zoomLink || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    try {
      const res = await fetchWithAuth(`/api/admin/enrollments/${editingEnr._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          paymentStatus: newStatus,
          instructor: newInstructor === '' ? null : newInstructor,
          scheduleTime: newSchedule,
          zoomLink: newZoomLink
        })
      });
      if (!res.ok) {
        setUpdateError(t.server((await readJson(res)).message) || t('overview.saveFailed'));
        return;
      }
      setEditingEnr(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update:', err);
      setUpdateError(t('common.networkError'));
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>{t('overview.title')}</h2>
        <button className="btn btn-accent" onClick={fetchDashboardData}>{t('overview.refresh')}</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">{t('overview.totalCourses')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalInstructors}</div>
          <div className="stat-label">{t('overview.totalInstructors')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">{t('overview.totalStudents')}</div>
        </div>
      </div>

      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <h3 style={{ padding: '1.5rem', borderBottom: '1px dashed rgba(0,0,0,0.1)', color: 'var(--primary-color)', textShadow: '0 0 10px rgba(250,204,21,0.3)' }}>{t('overview.tableTitle')}</h3>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('overview.loading')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('overview.col.student')}</th>
                <th>{t('overview.col.course')}</th>
                <th>{t('overview.col.instructor')}</th>
                <th>{t('overview.col.payment')}</th>
                <th>{t('overview.col.receipt')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length > 0 ? enrollments.map(enr => (
                <tr key={enr._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    {enr.student?.name || t('overview.unknownStudent')}
                    <div style={{ fontWeight: 'normal', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <bdi>{enr.student?.email}</bdi>
                      {enr.whatsapp && <> · {t('overview.whatsapp', { value: '' })}<bdi>{enr.whatsapp}</bdi></>}
                      {enr.studentAge && <> · {t('overview.age', { value: enr.studentAge })}</>}
                      {enr.level && <> · {t(`level.${enr.level}`)}</>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-color)' }}>{enr.course?.title || t('overview.unknownCourse')}</td>
                  <td>
                    {enr.instructor ? (
                      <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{enr.instructor.name}</span>
                    ) : (
                      <span style={{ color: '#fbbf24', fontStyle: 'italic' }}>{t('overview.pendingAssignment')}</span>
                    )}
                  </td>
                  <td>
                    <span style={{
                      color: enr.paymentStatus === 'Paid' ? '#4ade80' : '#f87171',
                      textShadow: enr.paymentStatus === 'Paid' ? '0 0 10px rgba(74, 222, 128, 0.5)' : '0 0 10px rgba(248, 113, 113, 0.5)'
                    }}>
                      ● {t(`status.${enr.paymentStatus}`)}
                    </span>
                    {enr.paymentMethod && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t(`method.${enr.paymentMethod}`)}</div>}
                  </td>
                  <td>
                    {enr.receiptUrl ? (
                      <a href={enr.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>{t('overview.viewReceipt')}</a>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{t('common.na')}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(enr)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>{t('common.edit')}</button>
                      <button onClick={() => handleDelete(enr._id)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>{t('common.delete')}</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>{t('overview.empty')}</td></tr>
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
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>{t('overview.modalTitle')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('overview.modalStudent')} <strong>{editingEnr.student?.name}</strong></p>
            <form onSubmit={handleUpdate}>
              {updateError && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{updateError}</p>}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{t('overview.paymentStatus')}</label>
                <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {PAYMENT_STATUSES.map(status => (
                    <option key={status} value={status}>{t(`status.${status}`)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{t('overview.assignInstructor')}</label>
                <select className="form-control" value={newInstructor} onChange={e => setNewInstructor(e.target.value)}>
                  <option value="">{t('overview.unassigned')}</option>
                  {instructors.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name} ({inst.rank})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{t('overview.schedule')}</label>
                <input type="text" className="form-control" value={newSchedule} onChange={e => setNewSchedule(e.target.value)} placeholder={t('overview.schedulePlaceholder')} />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">{t('overview.zoom')}</label>
                <input type="url" dir="ltr" className="form-control" value={newZoomLink} onChange={e => setNewZoomLink(e.target.value)} placeholder="https://zoom.us/j/..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>{t('common.save')}</button>
                <button type="button" onClick={() => setEditingEnr(null)} className="btn btn-outline" style={{ flex: 1 }}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
