import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';
import { formatSchedule, hasSchedule } from '../../utils/schedule';

const FILTERS = ['all', 'active', 'pending', 'noCourse', 'suspended'];

const matchesFilter = (s, filter) => {
  if (filter === 'active') return s.stats.paid > 0;
  if (filter === 'pending') return s.stats.pending > 0;
  if (filter === 'noCourse') return s.stats.courses === 0;
  if (filter === 'suspended') return !s.active;
  return true;
};

const formatDate = (value, lang) => (value ? new Date(value).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/** Admin: every student account – search, view courses, edit details, suspend or reset the password. */
const ManageStudents = () => {
  const { t, lang } = useAdminLang();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null); // full student (with enrollments) shown in the dialog
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [flash, setFlash] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/admin/students');
      const data = await readJson(res);
      if (!res.ok) { setLoadError(t.server(data.message) || t('students.loadError')); return; }
      setLoadError('');
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setLoadError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API on mount
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(s => matchesFilter(s, filter) && (!q
      || s.name.toLowerCase().includes(q)
      || s.email.toLowerCase().includes(q)
      || (s.phone || '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))));
  }, [students, search, filter]);

  const totals = useMemo(() => ({
    all: students.length,
    paying: students.filter(s => s.stats.paid > 0).length,
    pending: students.filter(s => s.stats.pending > 0).length,
    suspended: students.filter(s => !s.active).length,
  }), [students]);

  const openStudent = async (student) => {
    setFormError('');
    setDetail({ ...student, enrollments: null });
    setForm({ name: student.name, email: student.email, phone: student.phone || '', password: '', active: student.active });
    try {
      const res = await fetchWithAuth(`/api/admin/students/${student._id}`);
      const data = await readJson(res);
      if (res.ok) setDetail(data);
    } catch {
      // keep the basic details
    }
  };

  const close = () => { setDetail(null); setForm(null); };
  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const save = async (e, override) => {
    e?.preventDefault();
    setSaving(true);
    setFormError('');
    const body = override || { name: form.name, email: form.email, phone: form.phone, active: form.active, ...(form.password ? { password: form.password } : {}) };
    try {
      const res = await fetchWithAuth(`/api/admin/students/${detail._id}`, { method: 'PUT', body: JSON.stringify(body) });
      const data = await readJson(res);
      if (!res.ok) { setFormError(t.server(data.message) || t('students.saveError')); return; }
      setStudents(list => list.map(s => (s._id === data._id ? { ...s, ...data } : s)));
      if (override) {
        setDetail(d => ({ ...d, ...data }));
        setForm(f => ({ ...f, active: data.active }));
        setFlash(data.active ? t('students.reactivated', { name: data.name }) : t('students.suspendedMsg', { name: data.name }));
      } else {
        setFlash(t('students.saved', { name: data.name }));
        close();
      }
      setTimeout(() => setFlash(''), 3500);
    } catch {
      setFormError(t('common.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = () => {
    const next = !form.active;
    if (!next && !window.confirm(t('students.confirmSuspend', { name: detail.name }))) return;
    save(null, { active: next });
  };

  const exportCsv = () => {
    const rows = [[t('students.col.name'), t('students.col.email'), t('students.col.phone'), t('students.col.courses'), t('students.col.joined'), t('students.col.status')]];
    students.forEach(s => rows.push([s.name, s.email, s.phone || '', s.stats.courses, formatDate(s.createdAt, lang), s.active ? t('students.status.active') : t('students.status.suspended')]));
    const csv = '﻿' + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'students.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  const countFor = (f) => students.filter(s => matchesFilter(s, f)).length;

  return (
    <div className="ov-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('students.title')}</h1>
          <p className="page-sub">{t('students.subtitle')}</p>
        </div>
        <div className="welcome-actions">
          <button type="button" className="sched-btn sched-btn-ghost" onClick={exportCsv} disabled={!students.length}>⬇️ {t('students.export')}</button>
        </div>
      </header>

      <div className="crs-summary">
        <span>👥 {t('students.sum.all', { count: totals.all })}</span>
        <span>✅ {t('students.sum.paying', { count: totals.paying })}</span>
        {totals.pending > 0 && <span className="warn">⏳ {t('students.sum.pending', { count: totals.pending })}</span>}
        {totals.suspended > 0 && <span>⛔ {t('students.sum.suspended', { count: totals.suspended })}</span>}
      </div>

      {flash && <div className="crs-flash success">{flash}</div>}

      <section className="ov-table-card">
        <div className="ov-table-head">
          <h3>{t('students.tableTitle')}</h3>
          <input type="search" className="form-control ov-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('students.search')} aria-label={t('students.search')} />
        </div>
        <div className="ov-filters" role="tablist">
          {FILTERS.map(f => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {t(`students.filter.${f}`)} <span>{countFor(f)}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="ov-empty">{t('students.loading')}</p>
        ) : loadError ? (
          <div className="ov-empty">
            <p className="acc-error" style={{ marginBottom: '0.8rem' }}>{loadError}</p>
            <button type="button" className="sched-btn sched-btn-ghost" onClick={() => { setLoading(true); load(); }}>{t('common.retry')}</button>
          </div>
        ) : (
          <div className="ov-table-scroll">
            <table className="ov-table">
              <thead>
                <tr>
                  <th>{t('students.col.student')}</th>
                  <th>{t('students.col.phone')}</th>
                  <th>{t('students.col.courses')}</th>
                  <th>{t('students.col.joined')}</th>
                  <th>{t('students.col.status')}</th>
                  <th style={{ textAlign: 'center' }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(s => (
                  <tr key={s._id} className={s.active ? '' : 'row-muted'}>
                    <td>
                      <div className="ov-student">
                        <span className="ov-avatar" aria-hidden="true">{(s.name || '?').trim().charAt(0).toUpperCase()}</span>
                        <div style={{ minWidth: 0 }}>
                          <strong>{s.name}</strong>
                          <div className="ov-sub"><bdi>{s.email}</bdi></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {s.phone
                        ? <a href={`https://wa.me/${s.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="ov-wa">💬 <bdi>{s.phone}</bdi></a>
                        : <span className="ov-muted">—</span>}
                    </td>
                    <td>
                      {s.stats.courses === 0
                        ? <span className="ov-muted">{t('students.noCourses')}</span>
                        : <div className="stu-course-pills">
                            {s.stats.paid > 0 && <span className="ov-pill status-Paid">{t('students.paidCount', { count: s.stats.paid })}</span>}
                            {s.stats.pending > 0 && <span className="ov-pill status-Pending">{t('students.pendingCount', { count: s.stats.pending })}</span>}
                          </div>}
                    </td>
                    <td className="ov-muted">{formatDate(s.createdAt, lang)}</td>
                    <td>
                      <span className={`ov-pill ${s.active ? 'status-Paid' : 'status-Failed'}`}>{s.active ? t('students.status.active') : t('students.status.suspended')}</span>
                    </td>
                    <td>
                      <div className="ov-actions">
                        <button type="button" className="ov-icon-btn" onClick={() => openStudent(s)} title={t('students.view')} aria-label={t('students.view')}>👁</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan="6" className="ov-empty">{students.length === 0 ? t('students.empty') : t('students.noMatch')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !loadError && students.length > 0 && (
          <p className="ov-count">{t('students.showing', { shown: visible.length, total: students.length })}</p>
        )}
      </section>

      {detail && form && (
        <div className="sched-overlay" onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <form className="sched-modal" style={{ maxWidth: '720px' }} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="stu-title">
            <div className="sched-header">
              <div className="sched-header-icon" aria-hidden="true">🎓</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 id="stu-title">{detail.name}</h3>
                <p>{t('students.joinedOn', { date: formatDate(detail.createdAt, lang) })}</p>
              </div>
              <button type="button" className="sched-close" onClick={close} aria-label={t('common.cancel')}>✕</button>
            </div>

            <div className="sched-body">
              {!form.active && <div className="stu-suspended-note">⛔ {t('students.suspendedNote')}</div>}

              <h4 className="ins-form-section">📚 {t('students.section.courses')}</h4>
              {detail.enrollments === null ? (
                <p className="ov-muted">{t('students.loading')}</p>
              ) : detail.enrollments.length === 0 ? (
                <p className="ov-muted">{t('students.noCourses')}</p>
              ) : (
                <ul className="stu-enrollments">
                  {detail.enrollments.map(e => (
                    <li key={e._id}>
                      <div>
                        <strong>{e.course?.title || t('overview.unknownCourse')}</strong>
                        <small>
                          {e.instructor
                            ? <Link to={`/admin/instructors/${e.instructor._id}`} onClick={close}>👨‍🏫 {e.instructor.name}</Link>
                            : t('overview.pendingAssignment')}
                          {hasSchedule(e) && <> · 📅 {formatSchedule(e, lang)}</>}
                        </small>
                      </div>
                      <span className={`ov-pill status-${e.paymentStatus}`}>{t(`status.${e.paymentStatus}`)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {detail.attendance && detail.enrollments?.length > 0 && (
                <p className="stu-att">✅ {t('students.present', { count: detail.attendance.present })} · ❌ {t('students.absent', { count: detail.attendance.absent })}</p>
              )}

              <h4 className="ins-form-section">👤 {t('students.section.details')}</h4>
              <div className="acc-form">
                <div className="acc-row">
                  <div className="acc-field">
                    <label htmlFor="stu-name">{t('students.col.name')}</label>
                    <input id="stu-name" required maxLength={100} className="form-control" value={form.name} onChange={update('name')} />
                  </div>
                  <div className="acc-field">
                    <label htmlFor="stu-phone">{t('students.col.phone')}</label>
                    <input id="stu-phone" dir="ltr" maxLength={30} className="form-control" value={form.phone} onChange={update('phone')} placeholder="+20 1xx xxx xxxx" />
                  </div>
                </div>
                <div className="acc-row">
                  <div className="acc-field">
                    <label htmlFor="stu-email">{t('students.col.email')}</label>
                    <input id="stu-email" type="email" dir="ltr" required className="form-control" value={form.email} onChange={update('email')} />
                  </div>
                  <div className="acc-field">
                    <label htmlFor="stu-password">{t('students.newPassword')}</label>
                    <input id="stu-password" type="password" autoComplete="new-password" minLength={8} className="form-control" value={form.password} onChange={update('password')} placeholder={t('students.keepPassword')} />
                  </div>
                </div>
              </div>
              {formError && <p className="sched-error">{formError}</p>}
            </div>

            <div className="sched-footer">
              <button type="button" onClick={toggleActive} disabled={saving} className={`sched-btn ${form.active ? 'sched-btn-danger' : 'sched-btn-ghost'}`} style={{ marginInlineEnd: 'auto' }}>
                {form.active ? `⛔ ${t('students.suspend')}` : `✅ ${t('students.reactivate')}`}
              </button>
              <button type="button" onClick={close} className="sched-btn sched-btn-ghost">{t('common.cancel')}</button>
              <button type="submit" disabled={saving} className="sched-btn sched-btn-primary">{saving ? t('common.saving') : t('common.save')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
