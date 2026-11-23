import { useCallback, useEffect, useState } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useLang } from '../../i18n/lang';
import { lightInputStyle } from '../../utils/styles';
import StarRating from '../../components/StarRating';
import { formatReportDate, ratingTrend, TREND_ICON } from '../../utils/reports';

const MAX_DAYS_BACK = 90; // same limit as the server
const toDateString = (date) => date.toLocaleDateString('en-CA');
const emptyForm = (date) => ({ date, recited: '', homework: '', notes: '', memorization: null, tajweed: null });

/**
 * Instructor "Class Reports" page: pick a student, write the report for a class day
 * (recited, homework, notes, memorization/tajweed stars), and see / edit earlier reports.
 */
const ReportsPage = ({ students, initialEnrollmentId }) => {
  const { t, lang } = useLang();
  const today = toDateString(new Date());
  const minDate = (() => { const d = new Date(); d.setDate(d.getDate() - MAX_DAYS_BACK); return toDateString(d); })();

  const [selectedId, setSelectedId] = useState(initialEnrollmentId || students[0]?._id || null);
  const selected = students.find(s => s._id === selectedId);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm(today));
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  // Fill the form with the report of a day (or an empty one).
  const fillForm = useCallback((date, list) => {
    const existing = list.find(r => r.date === date);
    setForm(existing ? { ...emptyForm(date), ...existing, recited: existing.recited || '', homework: existing.homework || '', notes: existing.notes || '' } : emptyForm(date));
  }, []);

  const load = useCallback(async (enrollmentId) => {
    if (!enrollmentId) return;
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetchWithAuth(`/api/instructor/reports/${enrollmentId}`);
      const data = await readJson(res);
      const list = res.ok ? data.reports || [] : [];
      setReports(list);
      fillForm(toDateString(new Date()), list);
      if (!res.ok) setStatus({ type: 'error', message: t.server(data.message) || t('instructor.rep.loadError') });
    } catch {
      setStatus({ type: 'error', message: t('account.connection') });
    } finally {
      setLoading(false);
    }
  }, [fillForm, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the selected student's reports
    load(selectedId);
  }, [selectedId, load]);

  const update = (field) => (e) => { setForm({ ...form, [field]: e.target.value }); setStatus({ type: '', message: '' }); };
  const setRating = (field) => (value) => { setForm({ ...form, [field]: value }); setStatus({ type: '', message: '' }); };
  const changeDate = (e) => { fillForm(e.target.value, reports); setStatus({ type: '', message: '' }); };
  const isExisting = reports.some(r => r.date === form.date);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const { date, recited, homework, notes, memorization, tajweed } = form;
      const res = await fetchWithAuth(`/api/instructor/reports/${selectedId}/${date}`, {
        method: 'PUT',
        body: JSON.stringify({ recited, homework, notes, memorization, tajweed }),
      });
      const data = await readJson(res);
      if (!res.ok) { setStatus({ type: 'error', message: t.server(data.message) || t('instructor.saveFailed') }); return; }
      setReports(prev => [data, ...prev.filter(r => r.date !== data.date)].sort((a, b) => b.date.localeCompare(a.date)));
      setStatus({ type: 'success', message: t('instructor.rep.saved') });
    } catch {
      setStatus({ type: 'error', message: t('account.connection') });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (date) => {
    if (!window.confirm(t('instructor.rep.deleteConfirm'))) return;
    try {
      const res = await fetchWithAuth(`/api/instructor/reports/${selectedId}/${date}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      const list = reports.filter(r => r.date !== date);
      setReports(list);
      if (form.date === date) fillForm(date, list);
    } catch {
      setStatus({ type: 'error', message: t('instructor.saveFailed') });
    }
  };

  const editReport = (date) => {
    fillForm(date, reports);
    setStatus({ type: '', message: '' });
    document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (students.length === 0) return <p className="today-empty">{t('instructor.noStudents')}</p>;

  const memTrend = ratingTrend(reports, 'memorization');
  const tajTrend = ratingTrend(reports, 'tajweed');
  const canEditDate = form.date >= minDate && form.date <= today;

  const ratingWord = (value) => (value ? t(`instructor.rep.level.${value}`) : t('instructor.rep.notRated'));

  return (
    <div className="rep-page">
      {/* Toolbar: student + class date */}
      <div className="rep-toolbar">
        <div className="rep-avatar" aria-hidden="true">{(selected?.student?.name || '?').trim().charAt(0).toUpperCase()}</div>
        <div className="rep-field grow">
          <label htmlFor="rep-student">{t('instructor.rep.student')}</label>
          <select id="rep-student" value={selectedId || ''} onChange={e => setSelectedId(e.target.value)} style={lightInputStyle}>
            {students.map(s => <option key={s._id} value={s._id}>{s.student?.name} — {s.course?.title}</option>)}
          </select>
        </div>
        <div className="rep-field">
          <label htmlFor="rep-date">{t('instructor.rep.date')}</label>
          <input id="rep-date" type="date" value={form.date} min={minDate} max={today} onChange={changeDate} style={lightInputStyle} />
        </div>
        <span className={`rep-mode ${isExisting ? 'edit' : 'new'}`}>{isExisting ? t('instructor.rep.editTitle') : t('instructor.rep.newTitle')}</span>
      </div>

      {/* Report form */}
      <form id="report-form" className="rep-card rep-form" onSubmit={save}>
        <div className="rep-grid">
          <div>
            <label htmlFor="rep-recited" className="sched-label">📖 {t('instructor.rep.recited')}</label>
            <input id="rep-recited" type="text" maxLength={500} value={form.recited} onChange={update('recited')} placeholder={t('instructor.rep.recitedPh')} style={lightInputStyle} />
          </div>
          <div>
            <label htmlFor="rep-homework" className="sched-label">📌 {t('instructor.rep.homework')}</label>
            <input id="rep-homework" type="text" maxLength={500} value={form.homework} onChange={update('homework')} placeholder={t('instructor.rep.homeworkPh')} style={lightInputStyle} />
          </div>
        </div>

        <div className="rep-grid">
          {['memorization', 'tajweed'].map(key => (
            <div key={key} className="rep-rating-box">
              <span className="sched-label">{key === 'memorization' ? '🧠' : '🎙️'} {t(`instructor.rep.${key}`)}</span>
              <div className="rep-rating-row">
                <StarRating value={form[key]} onChange={setRating(key)} label={t(`instructor.rep.${key}`)} size="1.7rem" />
                <span className={`rep-rating-word ${form[key] ? '' : 'muted'}`}>{ratingWord(form[key])}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="rep-notes" className="sched-label">💬 {t('instructor.rep.notes')}</label>
          <textarea id="rep-notes" rows={3} maxLength={1000} value={form.notes} onChange={update('notes')} placeholder={t('instructor.rep.notesPh')} style={{ ...lightInputStyle, resize: 'vertical' }} />
        </div>

        <div className="rep-form-footer">
          <p className="sched-hint" style={{ margin: 0 }}>👁️ {t('instructor.rep.visible')}</p>
          <span style={{ flex: 1 }} />
          {status.message && <span className={`rep-status ${status.type}`}>{status.message}</span>}
          <button type="submit" disabled={saving || loading || !canEditDate} className="sched-btn sched-btn-primary">
            {saving ? t('account.saving') : isExisting ? t('instructor.rep.update') : t('instructor.rep.save')}
          </button>
        </div>
      </form>

      {/* History */}
      <section className="rep-history">
        <div className="rep-history-head">
          <h3>{t('instructor.rep.history')}</h3>
          <span className="today-count">{t('instructor.rep.count', { count: reports.length })}</span>
        </div>

        {(memTrend.avg !== null || tajTrend.avg !== null) && (
          <div className="rep-trends">
            {[['memorization', memTrend], ['tajweed', tajTrend]].map(([key, trend]) => trend.avg !== null && (
              <div key={key} className="rep-trend">
                <span>{t(`instructor.rep.${key}`)} · {t('instructor.rep.avgLast5')}</span>
                <strong>{trend.avg.toFixed(1)} / 5</strong>
                {trend.direction && <em className={trend.direction}>{TREND_ICON[trend.direction]} {t(`instructor.rep.trend.${trend.direction}`)}</em>}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>{t('instructor.loading')}</p>
        ) : reports.length === 0 ? (
          <p className="rep-empty">{t('instructor.rep.empty', { name: selected?.student?.name || '' })}</p>
        ) : (
          <ul className="rep-list rep-list-grid">
            {reports.map(r => (
              <li key={r.date} className={r.date === form.date ? 'active' : ''}>
                <div className="rep-item-head">
                  <strong>{formatReportDate(r.date, lang)}</strong>
                  <div className="rep-item-actions">
                    <button type="button" onClick={() => editReport(r.date)}>{t('instructor.rep.edit')}</button>
                    {r.date >= minDate && <button type="button" className="danger" onClick={() => remove(r.date)}>{t('instructor.rep.delete')}</button>}
                  </div>
                </div>
                {r.recited && <p><b>{t('instructor.rep.recitedShort')}:</b> {r.recited}</p>}
                {r.homework && <p className="rep-homework"><b>📌 {t('instructor.rep.homeworkShort')}:</b> {r.homework}</p>}
                {(r.memorization || r.tajweed) && (
                  <div className="rep-item-stars">
                    {r.memorization && <span>{t('instructor.rep.memorization')} <StarRating value={r.memorization} size="0.95rem" /></span>}
                    {r.tajweed && <span>{t('instructor.rep.tajweed')} <StarRating value={r.tajweed} size="0.95rem" /></span>}
                  </div>
                )}
                {r.notes && <p className="rep-notes">💬 {r.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ReportsPage;
