import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';

const EMPTY_INSTRUCTOR = { name: '', email: '', password: '', gender: 'male', rank: '', schedule: '', attendance: 100, salary: '' };

// Quote a CSV cell and neutralise spreadsheet formulas (=, +, -, @).
const csvCell = (value) => {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const modalStyle = { background: 'var(--card-bg)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(250, 204, 21, 0.2)', position: 'relative' };
const closeStyle = { position: 'absolute', top: '1.5rem', insetInlineEnd: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' };
const thStyle = { padding: '1.5rem 1rem', color: 'var(--text-muted)' };

const ManageInstructors = () => {
  const { t } = useAdminLang();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State
  const [newInstructor, setNewInstructor] = useState(EMPTY_INSTRUCTOR);
  const [editingInstructor, setEditingInstructor] = useState(null);

  const fetchInstructors = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/admin/instructors');
      const data = await readJson(res);
      setInstructors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API on mount
    fetchInstructors();
  }, [fetchInstructors]);

  const handleDownloadReport = () => {
    const headers = ['id', 'name', 'email', 'rank', 'schedule', 'attendance', 'salary'].map(k => csvCell(t(`instructors.csv.${k}`)));
    const rows = instructors.map(inst => [
      inst._id, csvCell(inst.name), csvCell(inst.email), csvCell(inst.rank), csvCell(inst.schedule), inst.attendance ?? 100, csvCell(inst.salary)
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    // The BOM makes Excel open Arabic text correctly.
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', t('instructors.csv.file'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetchWithAuth('/api/admin/instructors', {
        method: 'POST',
        body: JSON.stringify(newInstructor)
      });
      const data = await readJson(res);
      if (!res.ok) {
        setFormError(t.server(data.message) || t('instructors.addFailed'));
        return;
      }
      setIsModalOpen(false);
      setNewInstructor(EMPTY_INSTRUCTOR);
      fetchInstructors();
    } catch (err) {
      console.error('Failed to add instructor:', err);
      setFormError(t('common.networkError'));
    }
  };

  const openEditModal = (inst) => {
    setFormError('');
    setEditingInstructor(inst);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const { name, rank, schedule, salary, attendance, gender } = editingInstructor;
      const res = await fetchWithAuth(`/api/admin/instructors/${editingInstructor._id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, rank, schedule, salary, attendance, gender: gender || 'male' })
      });
      const data = await readJson(res);
      if (!res.ok) {
        setFormError(t.server(data.message) || t('instructors.updateFailed'));
        return;
      }
      setIsEditModalOpen(false);
      setEditingInstructor(null);
      fetchInstructors();
    } catch (err) {
      console.error('Failed to update instructor:', err);
      setFormError(t('common.networkError'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('instructors.confirmDelete'))) return;
    try {
      const res = await fetchWithAuth(`/api/admin/instructors/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) alert(t.server((await readJson(res)).message) || t('instructors.deleteFailed'));
      fetchInstructors();
    } catch (err) {
      console.error('Failed to delete instructor:', err);
    }
  };

  return (
    <div className="manage-instructors-page" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>
          {t('instructors.title')}
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setFormError(''); setIsModalOpen(true); }} className="btn btn-outline" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>
            {t('instructors.add')}
          </button>
          <button onClick={handleDownloadReport} className="btn btn-accent">
            {t('instructors.report')}
          </button>
        </div>
      </div>

      <div className="table-container" style={{ background: 'var(--card-bg)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('instructors.loading')}</p>
        ) : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(250, 204, 21, 0.3)' }}>
                <th style={thStyle}>{t('instructors.col.name')}</th>
                <th style={thStyle}>{t('instructors.col.rank')}</th>
                <th style={thStyle}>{t('instructors.col.schedule')}</th>
                <th style={thStyle}>{t('instructors.col.attendance')}</th>
                <th style={thStyle}>{t('instructors.col.salary')}</th>
                <th style={{ ...thStyle, textAlign: 'end' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((inst) => (
                <tr key={inst._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '1.5rem 1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                    {inst.name}
                    <div style={{ fontWeight: 'normal', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {inst.email ? <bdi>{inst.email}</bdi> : t('instructors.noLogin')}
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 1rem' }}>
                    <span style={{ background: 'rgba(3, 105, 161, 0.2)', color: 'var(--accent-color)', padding: '0.4rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {inst.rank || t('common.na')}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>{inst.schedule || t('common.tbd')}</td>
                  <td style={{ padding: '1.5rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '100px', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${inst.attendance ?? 100}%`, height: '100%', background: (inst.attendance ?? 100) >= 95 ? 'var(--primary-color)' : 'var(--accent-color)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{inst.attendance ?? 100}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}><bdi>{inst.salary || t('common.tbd')}</bdi></td>
                  <td style={{ padding: '1.5rem 1rem', textAlign: 'end', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openEditModal(inst)} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', marginInlineEnd: '1rem', fontWeight: 'bold', fontFamily: 'inherit' }}>{t('common.edit')}</button>
                    <button onClick={() => handleDelete(inst._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}>{t('common.delete')}</button>
                  </td>
                </tr>
              ))}
              {instructors.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>{t('instructors.empty')}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Instructor Modal */}
      {isModalOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setIsModalOpen(false)} style={closeStyle}>✕</button>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>{t('instructors.addTitle')}</h2>
            <form onSubmit={handleAddSubmit}>
              {formError && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{formError}</p>}
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.fullName')}</label><input required type="text" className="form-control" value={newInstructor.name} onChange={e => setNewInstructor({...newInstructor, name: e.target.value})} placeholder={t('instructors.namePlaceholder')} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.gender')}</label><select className="form-control" value={newInstructor.gender} onChange={e => setNewInstructor({...newInstructor, gender: e.target.value})}><option value="male">{t('instructors.gender.male')}</option><option value="female">{t('instructors.gender.female')}</option></select></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.email')}</label><input required type="email" dir="ltr" autoComplete="off" className="form-control" value={newInstructor.email} onChange={e => setNewInstructor({...newInstructor, email: e.target.value})} placeholder="teacher@example.com" /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.password')}</label><input required type="password" minLength={8} autoComplete="new-password" className="form-control" value={newInstructor.password} onChange={e => setNewInstructor({...newInstructor, password: e.target.value})} placeholder={t('instructors.passwordPlaceholder')} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.rank')}</label><input required type="text" className="form-control" value={newInstructor.rank} onChange={e => setNewInstructor({...newInstructor, rank: e.target.value})} placeholder={t('instructors.rankPlaceholder')} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.schedule')}</label><input required type="text" className="form-control" value={newInstructor.schedule} onChange={e => setNewInstructor({...newInstructor, schedule: e.target.value})} placeholder={t('instructors.schedulePlaceholder')} /></div>
              <div style={{ marginBottom: '2rem' }}><label className="form-label">{t('instructors.initialSalary')}</label><input required type="text" className="form-control" value={newInstructor.salary} onChange={e => setNewInstructor({...newInstructor, salary: e.target.value})} placeholder={t('instructors.salaryPlaceholder')} /></div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '1rem' }}>{t('instructors.confirmAdd')}</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Instructor Modal */}
      {isEditModalOpen && editingInstructor && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setIsEditModalOpen(false)} style={closeStyle}>✕</button>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>{t('instructors.editTitle')}</h2>
            <form onSubmit={handleEditSubmit}>
              {formError && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{formError}</p>}
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.fullName')}</label><input required type="text" className="form-control" value={editingInstructor.name} onChange={e => setEditingInstructor({...editingInstructor, name: e.target.value})} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.gender')}</label><select className="form-control" value={editingInstructor.gender || 'male'} onChange={e => setEditingInstructor({...editingInstructor, gender: e.target.value})}><option value="male">{t('instructors.gender.male')}</option><option value="female">{t('instructors.gender.female')}</option></select></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.rank')}</label><input required type="text" className="form-control" value={editingInstructor.rank} onChange={e => setEditingInstructor({...editingInstructor, rank: e.target.value})} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label className="form-label">{t('instructors.schedule')}</label><input required type="text" className="form-control" value={editingInstructor.schedule} onChange={e => setEditingInstructor({...editingInstructor, schedule: e.target.value})} /></div>
              <div style={{ marginBottom: '2rem' }}><label className="form-label">{t('instructors.salary')}</label><input required type="text" className="form-control" value={editingInstructor.salary} onChange={e => setEditingInstructor({...editingInstructor, salary: e.target.value})} /></div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '1rem' }}>{t('common.save')}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageInstructors;
