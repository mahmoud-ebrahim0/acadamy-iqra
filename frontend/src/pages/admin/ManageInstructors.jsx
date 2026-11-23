import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';
import { WEEK_ORDER, dayName, formatSchedule } from '../../utils/schedule';
import { instructorImage } from '../../utils/instructorProfile';

const EMPTY_FORM = { _id: null, name: '', gender: 'male', rank: '', salary: '', email: '', password: '', hasLogin: false };

// Attendance rate (%) from present/absent counts, or null when nothing is recorded.
const rateOf = (present, absent) => (present + absent ? Math.round((present / (present + absent)) * 100) : null);
const rateColor = (rate) => (rate === null ? '#64748b' : rate >= 80 ? '#059669' : rate >= 50 ? '#d97706' : '#dc2626');

// Quote a CSV cell and neutralise spreadsheet formulas (=, +, -, @).
const csvCell = (value) => {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

/** Admin: instructors as cards with their real numbers; add / edit (incl. login) in one dialog. */
const ManageInstructors = () => {
  const { t, lang } = useAdminLang();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState(null); // null = dialog closed
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

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

  const flash = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleDownloadReport = () => {
    const headers = ['id', 'name', 'email', 'rank', 'schedule', 'attendance', 'salary'].map(k => csvCell(t(`instructors.csv.${k}`)));
    const rows = instructors.map(inst => {
      const s = inst.attendanceStats || {};
      const rate = rateOf(s.present || 0, s.absent || 0);
      const schedule = (inst.students || []).map(c => `${c.student}: ${formatSchedule({ scheduleDays: c.days, scheduleClock: c.clock, scheduleTime: c.text }, lang) || '-'}`).join(' | ');
      return [inst._id, csvCell(inst.name), csvCell(inst.email), csvCell(inst.rank), csvCell(schedule), rate === null ? '' : `${rate}%`, csvCell(inst.salary)];
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    // The BOM makes Excel open Arabic text correctly.
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', t('instructors.csv.file'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openAdd = () => { setFormError(''); setForm({ ...EMPTY_FORM }); };
  const openEdit = (inst) => {
    setFormError('');
    setForm({ ...EMPTY_FORM, _id: inst._id, name: inst.name, gender: inst.gender || 'male', rank: inst.rank, salary: inst.salary, email: inst.email || '', hasLogin: Boolean(inst.email) });
  };
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const { _id, name, gender, rank, salary, email, password } = form;
    const body = { name, gender, rank, salary };
    if (!_id || email.trim()) body.email = email;
    if (!_id || password) body.password = password;
    try {
      const res = await fetchWithAuth(_id ? `/api/admin/instructors/${_id}` : '/api/admin/instructors', {
        method: _id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      const data = await readJson(res);
      if (!res.ok) { setFormError(t.server(data.message) || t(_id ? 'instructors.updateFailed' : 'instructors.addFailed')); return; }
      flash('success', t(_id ? 'instructors.updated' : 'instructors.added', { name }));
      setForm(null);
      fetchInstructors();
    } catch {
      setFormError(t('common.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (inst) => {
    const count = inst.students?.length || 0;
    const question = count ? t('instructors.confirmDeleteStudents', { name: inst.name, count }) : t('instructors.confirmDeleteNamed', { name: inst.name });
    if (!window.confirm(question)) return;
    try {
      const res = await fetchWithAuth(`/api/admin/instructors/${inst._id}`, { method: 'DELETE' });
      if (!res.ok) { flash('error', t.server((await readJson(res)).message) || t('instructors.deleteFailed')); return; }
      flash('success', t('instructors.deleted', { name: inst.name }));
      fetchInstructors();
    } catch {
      flash('error', t('common.networkError'));
    }
  };

  const totals = instructors.reduce((acc, i) => {
    const s = i.attendanceStats || {};
    return {
      students: acc.students + (i.students?.length || 0),
      weekly: acc.weekly + (i.weeklyClasses || 0),
      present: acc.present + (s.present || 0),
      absent: acc.absent + (s.absent || 0),
      noLogin: acc.noLogin + (i.email ? 0 : 1),
    };
  }, { students: 0, weekly: 0, present: 0, absent: 0, noLogin: 0 });
  const overallRate = rateOf(totals.present, totals.absent);

  return (
    <div className="ov-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('instructors.title')}</h1>
          <p className="page-sub">{t('instructors.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="sched-btn sched-btn-ghost" onClick={handleDownloadReport} disabled={!instructors.length}>⬇️ {t('instructors.export')}</button>
          <button type="button" className="sched-btn sched-btn-primary" onClick={openAdd}>➕ {t('instructors.addShort')}</button>
        </div>
      </header>

      <div className="crs-summary">
        <span>🎓 {t('instructors.sum.total', { count: instructors.length })}</span>
        <span>👥 {t('instructors.sum.students', { count: totals.students })}</span>
        <span>🕒 {t('instructors.sum.weekly', { count: totals.weekly })}</span>
        <span>📋 {t('instructors.sum.attendance', { rate: overallRate === null ? '—' : `${overallRate}%` })}</span>
        {totals.noLogin > 0 && <span className="warn">⚠️ {t('instructors.sum.noLogin', { count: totals.noLogin })}</span>}
      </div>

      {message.text && <div className={`crs-flash ${message.type}`}>{message.text}</div>}

      {loading ? (
        <p className="ov-empty">{t('instructors.loading')}</p>
      ) : instructors.length === 0 ? (
        <div className="crs-empty">
          <p>{t('instructors.empty')}</p>
          <button type="button" className="sched-btn sched-btn-primary" onClick={openAdd}>➕ {t('instructors.addShort')}</button>
        </div>
      ) : (
        <div className="crs-grid">
          {instructors.map(inst => {
            const stats = inst.attendanceStats || { present: 0, absent: 0 };
            const rate = rateOf(stats.present, stats.absent);
            const classes = inst.students || [];
            const days = WEEK_ORDER.filter(d => classes.some(c => c.days.includes(d)));
            return (
              <article key={inst._id} className="ins-card">
                <div className="ins-head">
                  <img src={instructorImage(inst)} alt="" className={inst.photoUrl ? '' : 'default'} />
                  <div style={{ minWidth: 0 }}>
                    <h3>{inst.name}</h3>
                    <span className="crs-level">{inst.rank || t('common.na')}</span>
                    <div className={`ins-login ${inst.email ? '' : 'none'}`}>
                      {inst.email ? <>✉️ <bdi>{inst.email}</bdi></> : <>⚠️ {t('instructors.noLogin')}</>}
                    </div>
                  </div>
                </div>

                <div className="crs-stats">
                  <div><strong>{classes.length}</strong><span>{t('instructors.stat.students')}</span></div>
                  <div><strong>{inst.weeklyClasses || 0}</strong><span>{t('instructors.stat.weekly')}</span></div>
                  <div><strong style={{ color: rateColor(rate) }}>{rate === null ? '—' : `${rate}%`}</strong><span>{t('instructors.stat.attendance')}</span></div>
                </div>

                <div className="ins-meta">
                  <div>
                    <span>{t('instructors.days')}</span>
                    {days.length
                      ? <div className="ins-days">{days.map(d => <span key={d} className="inst-day">{dayName(d, lang)}</span>)}</div>
                      : <em>{t('instructors.noDays')}</em>}
                  </div>
                  <div>
                    <span>{t('instructors.col.salary')}</span>
                    <strong><bdi>{inst.salary || t('common.tbd')}</bdi></strong>
                  </div>
                </div>

                <div className="crs-actions">
                  <Link to={`/admin/instructors/${inst._id}`} className="sched-btn sched-btn-primary ins-follow">📊 {t('instructors.follow')}</Link>
                  <button type="button" className="sched-btn sched-btn-ghost" onClick={() => openEdit(inst)}>✏️ {t('common.edit')}</button>
                  <span style={{ flex: 1 }} />
                  <button type="button" className="ov-icon-btn danger" onClick={() => handleDelete(inst)} title={t('common.delete')} aria-label={t('common.delete')}>🗑</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / edit dialog */}
      {form && (
        <div className="sched-overlay" onClick={e => { if (e.target === e.currentTarget) setForm(null); }}>
          <form className="sched-modal" style={{ maxWidth: '680px' }} onSubmit={handleSave} role="dialog" aria-modal="true" aria-labelledby="ins-form-title">
            <div className="sched-header">
              <div className="sched-header-icon" aria-hidden="true">🎓</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 id="ins-form-title">{form._id ? t('instructors.editTitle') : t('instructors.addTitle')}</h2>
                <p>{form._id ? form.name : t('instructors.addHint')}</p>
              </div>
              <button type="button" className="sched-close" onClick={() => setForm(null)} aria-label={t('common.cancel')}>✕</button>
            </div>

            <div className="sched-body">
              <h4 className="ins-form-section">👤 {t('instructors.section.profile')}</h4>
              <div className="acc-form">
                <div className="acc-row">
                  <div className="acc-field">
                    <label htmlFor="ins-name">{t('instructors.fullName')}</label>
                    <input id="ins-name" required maxLength={100} className="form-control" value={form.name} onChange={update('name')} placeholder={t('instructors.namePlaceholder')} />
                  </div>
                  <div className="acc-field">
                    <label htmlFor="ins-gender">{t('instructors.gender')}</label>
                    <select id="ins-gender" className="form-control" value={form.gender} onChange={update('gender')}>
                      <option value="male">{t('instructors.gender.male')}</option>
                      <option value="female">{t('instructors.gender.female')}</option>
                    </select>
                  </div>
                </div>
                <div className="acc-row">
                  <div className="acc-field">
                    <label htmlFor="ins-rank">{t('instructors.rank')}</label>
                    <input id="ins-rank" required maxLength={100} className="form-control" value={form.rank} onChange={update('rank')} placeholder={t('instructors.rankPlaceholder')} />
                  </div>
                  <div className="acc-field">
                    <label htmlFor="ins-salary">{t('instructors.salary')}</label>
                    <input id="ins-salary" required maxLength={50} className="form-control" value={form.salary} onChange={update('salary')} placeholder={t('instructors.salaryPlaceholder')} />
                  </div>
                </div>
              </div>

              <h4 className="ins-form-section">🔐 {t('instructors.section.login')}</h4>
              <p className="acc-hint" style={{ marginTop: '-0.4rem', marginBottom: '0.8rem' }}>
                {!form._id ? t('instructors.loginHintNew') : form.hasLogin ? t('instructors.loginHintEdit') : t('instructors.loginHintCreate')}
              </p>
              <div className="acc-row">
                <div className="acc-field">
                  <label htmlFor="ins-email">{t('instructors.email')}</label>
                  <input id="ins-email" type="email" dir="ltr" autoComplete="off" required={!form._id} className="form-control" value={form.email} onChange={update('email')} placeholder="teacher@example.com" />
                </div>
                <div className="acc-field">
                  <label htmlFor="ins-password">{form._id && form.hasLogin ? t('instructors.newPassword') : t('instructors.password')}</label>
                  <input id="ins-password" type="password" autoComplete="new-password" minLength={8} required={!form._id} className="form-control" value={form.password} onChange={update('password')} placeholder={form._id && form.hasLogin ? t('instructors.keepPassword') : t('instructors.passwordPlaceholder')} />
                </div>
              </div>

              {formError && <p className="sched-error">{formError}</p>}
            </div>

            <div className="sched-footer">
              <span style={{ flex: 1 }} />
              <button type="button" onClick={() => setForm(null)} className="sched-btn sched-btn-ghost">{t('common.cancel')}</button>
              <button type="submit" disabled={saving} className="sched-btn sched-btn-primary">
                {saving ? t('instructors.saving') : form._id ? t('common.save') : t('instructors.confirmAdd')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageInstructors;
