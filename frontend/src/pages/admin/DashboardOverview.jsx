import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';
import { formatSchedule, hasSchedule } from '../../utils/schedule';

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];
const FILTERS = ['all', 'pending', 'unassigned', 'noSchedule', 'paid'];
const EMPTY_STATS = {
  totalCourses: 0, totalInstructors: 0, totalStudents: 0, newStudentsThisMonth: 0,
  enrollments: { total: 0, active: 0 }, revenueThisMonth: 0, revenueTotal: 0,
  attendanceThisMonth: { present: 0, absent: 0, rate: null },
  needsAttention: { pendingPayments: 0, unassigned: 0, noSchedule: 0, pendingPayouts: 0, pendingPayoutsAmount: 0 },
};

const money = (value) => `$${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

// Which filter an enrollment belongs to (used by the filter pills and the "needs attention" cards).
const matchesFilter = (enr, filter) => {
  switch (filter) {
    case 'pending': return enr.paymentStatus === 'Pending';
    case 'unassigned': return !enr.instructor && enr.paymentStatus !== 'Failed';
    case 'noSchedule': return Boolean(enr.instructor) && !hasSchedule(enr);
    case 'paid': return enr.paymentStatus === 'Paid';
    default: return true;
  }
};

const DashboardOverview = () => {
  const { t, lang } = useAdminLang();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [enrollments, setEnrollments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Edit dialog
  const [editingEnr, setEditingEnr] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newSchedule, setNewSchedule] = useState('');
  const [newZoomLink, setNewZoomLink] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statsRes, enrRes, instRes] = await Promise.all([
        fetchWithAuth('/api/admin/stats'),
        fetchWithAuth('/api/admin/enrollments'),
        fetchWithAuth('/api/admin/instructors')
      ]);
      const [statsData, enrData, instData] = await Promise.all([readJson(statsRes), readJson(enrRes), readJson(instRes)]);

      if (statsRes.ok) setStats({ ...EMPTY_STATS, ...statsData });
      setEnrollments(Array.isArray(enrData) ? enrData : []);
      setInstructors(Array.isArray(instData) ? instData : []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API on mount
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDelete = async (enr) => {
    if (!window.confirm(t('overview.confirmDeleteNamed', { name: enr.student?.name || '' }))) return;
    try {
      await fetchWithAuth(`/api/admin/enrollments/${enr._id}`, { method: 'DELETE' });
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
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  // --- table filtering ---
  const query = search.trim().toLowerCase();
  const visible = enrollments.filter(enr => matchesFilter(enr, filter) && (!query || [
    enr.student?.name, enr.student?.email, enr.course?.title, enr.instructor?.name, enr.whatsapp,
  ].some(v => String(v || '').toLowerCase().includes(query))));
  const countFor = (f) => enrollments.filter(enr => matchesFilter(enr, f)).length;

  const na = stats.needsAttention;
  const attention = [
    { key: 'pending', icon: '💳', count: na.pendingPayments, filter: 'pending' },
    { key: 'unassigned', icon: '👤', count: na.unassigned, filter: 'unassigned' },
    { key: 'noSchedule', icon: '🕒', count: na.noSchedule, filter: 'noSchedule' },
    { key: 'payouts', icon: '💸', count: na.pendingPayouts, link: '/admin/payouts', extra: na.pendingPayouts ? money(na.pendingPayoutsAmount) : '' },
  ];
  const showFilter = (f) => {
    setFilter(f);
    document.getElementById('enrollments-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const todayLabel = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const rate = stats.attendanceThisMonth.rate;

  return (
    <div className="ov-page">
      {/* Header */}
      <header className="welcome-hero">
        <div>
          <h1>{t('overview.title')}</h1>
          <p className="page-sub">📅 {todayLabel}</p>
        </div>
        <button type="button" className="sched-btn sched-btn-ghost ov-refresh" onClick={fetchDashboardData} disabled={refreshing}>
          <span className={refreshing ? 'spin' : ''} aria-hidden="true">⟳</span> {t('overview.refresh')}
        </button>
      </header>

      {/* Key numbers */}
      <div className="ov-kpis">
        <div className="ov-kpi" style={{ '--kpi': 'var(--primary-color)' }}>
          <span className="ov-kpi-label">👥 {t('overview.kpi.students')}</span>
          <strong>{stats.totalStudents}</strong>
          <small>{t('overview.kpi.newThisMonth', { count: stats.newStudentsThisMonth })}</small>
        </div>
        <div className="ov-kpi" style={{ '--kpi': '#059669' }}>
          <span className="ov-kpi-label">✅ {t('overview.kpi.active')}</span>
          <strong>{stats.enrollments.active}</strong>
          <small>{t('overview.kpi.ofTotal', { total: stats.enrollments.total })}</small>
        </div>
        <div className="ov-kpi" style={{ '--kpi': '#b45309' }}>
          <span className="ov-kpi-label">💰 {t('overview.kpi.revenue')}</span>
          <strong>{money(stats.revenueThisMonth)}</strong>
          <small>{t('overview.kpi.revenueTotal', { total: money(stats.revenueTotal) })}</small>
        </div>
        <div className="ov-kpi" style={{ '--kpi': rate === null ? '#64748b' : rate >= 80 ? '#059669' : rate >= 50 ? '#d97706' : '#dc2626' }}>
          <span className="ov-kpi-label">📋 {t('overview.kpi.attendance')}</span>
          <strong>{rate === null ? '—' : `${rate}%`}</strong>
          <small>{t('overview.kpi.attendanceCounts', { present: stats.attendanceThisMonth.present, absent: stats.attendanceThisMonth.absent })}</small>
        </div>
        <Link to="/admin/instructors" className="ov-kpi link" style={{ '--kpi': 'var(--accent-color)' }}>
          <span className="ov-kpi-label">🎓 {t('overview.totalInstructors')}</span>
          <strong>{stats.totalInstructors}</strong>
          <small>{t('overview.kpi.manage')}</small>
        </Link>
        <Link to="/admin/courses" className="ov-kpi link" style={{ '--kpi': '#7c3aed' }}>
          <span className="ov-kpi-label">📚 {t('overview.totalCourses')}</span>
          <strong>{stats.totalCourses}</strong>
          <small>{t('overview.kpi.manage')}</small>
        </Link>
      </div>

      {/* Needs attention */}
      <section>
        <h3 className="ov-section-title">{t('overview.attention.title')}</h3>
        <div className="ov-attention">
          {attention.map(item => {
            const done = item.count === 0;
            const content = (
              <>
                <span className="ov-att-icon" aria-hidden="true">{done ? '✓' : item.icon}</span>
                <div>
                  <strong>{item.count}</strong>
                  <span>{t(`overview.attention.${item.key}`)}</span>
                  {item.extra && <em>{item.extra}</em>}
                </div>
              </>
            );
            return item.link ? (
              <Link key={item.key} to={item.link} className={`ov-att ${done ? 'done' : ''}`}>{content}</Link>
            ) : (
              <button key={item.key} type="button" className={`ov-att ${done ? 'done' : ''} ${filter === item.filter ? 'active' : ''}`} onClick={() => showFilter(item.filter)} disabled={done}>{content}</button>
            );
          })}
        </div>
      </section>

      {/* Enrollments */}
      <section id="enrollments-table" className="ov-table-card">
        <div className="ov-table-head">
          <h3>{t('overview.tableTitle')}</h3>
          <input type="search" className="form-control ov-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('overview.search')} aria-label={t('overview.search')} />
        </div>
        <div className="ov-filters" role="tablist">
          {FILTERS.map(f => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {t(`overview.filter.${f}`)} <span>{countFor(f)}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="ov-empty">{t('overview.loading')}</p>
        ) : (
          <div className="ov-table-scroll">
            <table className="ov-table">
              <thead>
                <tr>
                  <th>{t('overview.col.student')}</th>
                  <th>{t('overview.col.course')}</th>
                  <th>{t('overview.col.instructor')}</th>
                  <th>{t('overview.col.schedule')}</th>
                  <th>{t('overview.col.payment')}</th>
                  <th style={{ textAlign: 'center' }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(enr => {
                  const schedule = hasSchedule(enr) ? formatSchedule(enr, lang) : '';
                  return (
                    <tr key={enr._id}>
                      <td>
                        <div className="ov-student">
                          <span className="ov-avatar" aria-hidden="true">{(enr.student?.name || '?').trim().charAt(0).toUpperCase()}</span>
                          <div style={{ minWidth: 0 }}>
                            <strong>{enr.student?.name || t('overview.unknownStudent')}</strong>
                            <div className="ov-sub"><bdi>{enr.student?.email}</bdi></div>
                            <div className="ov-chips">
                              {enr.studentAge && <span>{t('overview.age', { value: enr.studentAge })}</span>}
                              {enr.level && <span>{t(`level.${enr.level}`)}</span>}
                              {enr.whatsapp && <a href={`https://wa.me/${String(enr.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="wa">💬 <bdi>{enr.whatsapp}</bdi></a>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="ov-course">{enr.course?.title || t('overview.unknownCourse')}</td>
                      <td>
                        {enr.instructor
                          ? <Link to={`/admin/instructors/${enr.instructor._id}`} className="ov-instructor">{enr.instructor.name}</Link>
                          : <span className="ov-pill warn">{t('overview.pendingAssignment')}</span>}
                      </td>
                      <td>{schedule ? <span className="ov-schedule">{schedule}</span> : <span className="ov-muted">—</span>}</td>
                      <td>
                        <span className={`ov-pill status-${enr.paymentStatus}`}>{t(`status.${enr.paymentStatus}`)}</span>
                        <div className="ov-sub">
                          {enr.paymentMethod && t(`method.${enr.paymentMethod}`)}
                          {enr.receiptUrl && <> · <a href={enr.receiptUrl} target="_blank" rel="noopener noreferrer">🧾 {t('overview.viewReceipt')}</a></>}
                        </div>
                      </td>
                      <td>
                        <div className="ov-actions">
                          <button type="button" onClick={() => openEditModal(enr)} className="ov-icon-btn" title={t('common.edit')} aria-label={t('common.edit')}>✏️</button>
                          <button type="button" onClick={() => handleDelete(enr)} className="ov-icon-btn danger" title={t('common.delete')} aria-label={t('common.delete')}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr><td colSpan="6" className="ov-empty">{enrollments.length === 0 ? t('overview.empty') : t('overview.noMatch')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && enrollments.length > 0 && (
          <p className="ov-count">{t('overview.showing', { shown: visible.length, total: enrollments.length })}</p>
        )}
      </section>

      {/* Edit dialog */}
      {editingEnr && (
        <div className="sched-overlay" onClick={e => { if (e.target === e.currentTarget) setEditingEnr(null); }}>
          <form className="sched-modal" style={{ maxWidth: '640px' }} onSubmit={handleUpdate} role="dialog" aria-modal="true" aria-labelledby="ov-edit-title">
            <div className="sched-header">
              <div className="sched-header-icon" aria-hidden="true">🎓</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 id="ov-edit-title">{t('overview.modalTitle')}</h2>
                <p>{editingEnr.student?.name} · {editingEnr.course?.title}</p>
              </div>
              <button type="button" className="sched-close" onClick={() => setEditingEnr(null)} aria-label={t('common.cancel')}>✕</button>
            </div>

            <div className="sched-body">
              <div className="acc-row">
                <div className="acc-field">
                  <label htmlFor="ov-status">{t('overview.paymentStatus')}</label>
                  <select id="ov-status" className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {PAYMENT_STATUSES.map(status => <option key={status} value={status}>{t(`status.${status}`)}</option>)}
                  </select>
                </div>
                <div className="acc-field">
                  <label htmlFor="ov-instructor">{t('overview.assignInstructor')}</label>
                  <select id="ov-instructor" className="form-control" value={newInstructor} onChange={e => setNewInstructor(e.target.value)}>
                    <option value="">{t('overview.unassigned')}</option>
                    {instructors.map(inst => <option key={inst._id} value={inst._id}>{inst.name} ({inst.rank})</option>)}
                  </select>
                </div>
              </div>

              <div className="acc-field" style={{ marginTop: '1rem' }}>
                <label htmlFor="ov-schedule">{t('overview.schedule')}</label>
                <input id="ov-schedule" type="text" className="form-control" value={newSchedule} onChange={e => setNewSchedule(e.target.value)} placeholder={formatSchedule(editingEnr, lang) || t('overview.schedulePlaceholder')} />
                {editingEnr?.scheduleDays?.length > 0 && (
                  <small className="acc-hint">{t('overview.scheduleByInstructor', { schedule: formatSchedule(editingEnr, lang) })}</small>
                )}
              </div>

              <div className="acc-field" style={{ marginTop: '1rem' }}>
                <label htmlFor="ov-zoom">{t('overview.zoom')}</label>
                <input id="ov-zoom" type="url" dir="ltr" className="form-control" value={newZoomLink} onChange={e => setNewZoomLink(e.target.value)} placeholder="https://zoom.us/j/..." />
              </div>

              {editingEnr.receiptUrl && (
                <a href={editingEnr.receiptUrl} target="_blank" rel="noopener noreferrer" className="ov-receipt-link">🧾 {t('overview.viewReceipt')}</a>
              )}

              {updateError && <p className="sched-error">{updateError}</p>}
            </div>

            <div className="sched-footer">
              <span style={{ flex: 1 }} />
              <button type="button" onClick={() => setEditingEnr(null)} className="sched-btn sched-btn-ghost">{t('common.cancel')}</button>
              <button type="submit" disabled={saving} className="sched-btn sched-btn-primary">{saving ? t('overview.saving') : t('common.save')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
