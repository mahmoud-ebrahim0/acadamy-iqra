import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';
import { formatSchedule } from '../../utils/schedule';
import { formatReportDate } from '../../utils/reports';
import StarRating from '../../components/StarRating';
import AttendanceRecord from '../instructor/AttendanceRecord';

const DAY_MS = 24 * 60 * 60 * 1000;
const rateOf = (present, absent) => (present + absent ? Math.round((present / (present + absent)) * 100) : null);
const rateClass = (rate) => (rate === null ? '' : rate >= 80 ? 'good' : rate >= 50 ? 'ok' : 'low');
const daysSince = (date) => (date ? Math.floor((Date.now() - new Date(`${date}T00:00:00`).getTime()) / DAY_MS) : null);

/**
 * Admin: follow one instructor's work (read-only) – students and schedules, recorded attendance
 * and class reports, with a warning when the instructor hasn't recorded anything for a while.
 */
const InstructorActivity = () => {
  const { id } = useParams();
  const { t, lang } = useAdminLang();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [studentReports, setStudentReports] = useState({ id: null, list: [], loading: false });

  useEffect(() => {
    fetchWithAuth(`/api/admin/instructors/${id}/activity`)
      .then(async res => {
        const body = await readJson(res);
        if (!res.ok) { setError(t.server(body.message) || t('activity.loadError')); return; }
        setData(body);
        setSelectedId(body.students[0]?._id || null);
      })
      .catch(() => setError(t('common.networkError')));
  }, [id, t]);

  const loadReports = useCallback(async (enrollmentId) => {
    if (!enrollmentId) return;
    setStudentReports({ id: enrollmentId, list: [], loading: true });
    try {
      const res = await fetchWithAuth(`/api/instructor/reports/${enrollmentId}`);
      const body = await readJson(res);
      setStudentReports({ id: enrollmentId, list: res.ok ? body.reports || [] : [], loading: false });
    } catch {
      setStudentReports({ id: enrollmentId, list: [], loading: false });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the selected student's reports
    loadReports(selectedId);
  }, [selectedId, loadReports]);

  if (error) return <div className="activity-page"><p className="acc-error">{error}</p></div>;
  if (!data) return <div className="activity-page"><p style={{ color: 'var(--text-muted)' }}>{t('activity.loading')}</p></div>;

  const { instructor, students, recentReports, summary } = data;
  const selected = students.find(s => s._id === selectedId);
  const rate = rateOf(summary.present, summary.absent);
  const lastActivity = [summary.lastAttendanceDate, summary.lastReportDate].filter(Boolean).sort().pop() || null;
  const idleDays = daysSince(lastActivity);
  const idle = students.length > 0 && (idleDays === null || idleDays > 7);
  const date = (d) => (d ? formatReportDate(d, lang) : '—');

  return (
    <div className="activity-page">
      <Link to="/admin/instructors" className="activity-back">{lang === 'ar' ? '→' : '←'} {t('activity.back')}</Link>

      {/* Header */}
      <header className="activity-head">
        <div className="acc-avatar" aria-hidden="true">{instructor.name.trim().charAt(0).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <h1>{instructor.name}</h1>
          <div className="activity-meta">
            {instructor.rank && <span className="inst-day">{instructor.rank}</span>}
            {instructor.email && <bdi>{instructor.email}</bdi>}
          </div>
        </div>
      </header>

      {idle && (
        <div className="activity-alert">
          ⚠️ {idleDays === null ? t('activity.neverRecorded') : t('activity.idle', { days: idleDays })}
        </div>
      )}

      {/* Key numbers */}
      <div className="activity-kpis">
        <div className="activity-kpi"><span>{t('activity.kpi.students')}</span><strong>{summary.students}</strong></div>
        <div className="activity-kpi"><span>{t('activity.kpi.weekly')}</span><strong>{summary.weeklyClasses}</strong></div>
        <div className="activity-kpi"><span>{t('activity.kpi.rate')}</span><strong className={`rate ${rateClass(rate)}`}>{rate === null ? '—' : `${rate}%`}</strong></div>
        <div className="activity-kpi"><span>{t('activity.kpi.attendance30')}</span><strong>{summary.attendanceLast30}</strong></div>
        <div className="activity-kpi"><span>{t('activity.kpi.reports30')}</span><strong>{summary.reportsLast30}</strong></div>
        <div className="activity-kpi"><span>{t('activity.kpi.last')}</span><strong className="small">{date(lastActivity)}</strong></div>
      </div>

      {/* Students */}
      <section className="att-table-card">
        <h3 className="activity-section-title">{t('activity.students')}</h3>
        {students.length === 0 ? (
          <p className="rep-empty">{t('activity.noStudents')}</p>
        ) : (
          <>
            <div className="att-table-scroll">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>{t('activity.col.student')}</th>
                    <th>{t('activity.col.schedule')}</th>
                    <th>{t('activity.col.progress')}</th>
                    <th>{t('activity.col.rate')}</th>
                    <th>{t('activity.col.lastAttendance')}</th>
                    <th>{t('activity.col.reports')}</th>
                    <th>{t('activity.col.lastReport')}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const r = rateOf(s.attendance.present, s.attendance.absent);
                    const schedule = formatSchedule(s, lang);
                    return (
                      <tr key={s._id} className={s._id === selectedId ? 'selected' : ''} onClick={() => setSelectedId(s._id)} tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(s._id); } }} aria-selected={s._id === selectedId}>
                        <td>
                          <div className="att-student">{s.student?.name}</div>
                          <div className="att-course">{s.course?.title}</div>
                        </td>
                        <td className={schedule ? '' : 'muted'}>{schedule || t('activity.noTime')}</td>
                        <td><strong>{s.progressPercentage ?? 0}%</strong></td>
                        <td><span className={`att-rate ${rateClass(r)}`}>{r === null ? '—' : `${r}%`}</span></td>
                        <td className="muted">{date(s.attendance.lastDate)}</td>
                        <td><strong>{s.reports.count}</strong></td>
                        <td className="muted">{date(s.reports.lastDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="att-table-hint">{t('activity.pick')}</p>
          </>
        )}
      </section>

      {/* Selected student: attendance calendar + reports (read-only) */}
      {selected && (
        <div className="activity-detail">
          <AttendanceRecord key={selected._id} enrollment={selected} readOnly />
          <section className="rep-history">
            <div className="rep-history-head">
              <h3>{t('activity.studentReports', { name: selected.student?.name || '' })}</h3>
              <span className="today-count">{studentReports.list.length}</span>
            </div>
            {studentReports.loading ? (
              <p style={{ color: 'var(--text-muted)' }}>{t('activity.loading')}</p>
            ) : studentReports.list.length === 0 ? (
              <p className="rep-empty">{t('activity.noReports')}</p>
            ) : (
              <ul className="rep-list">
                {studentReports.list.map(r => <ReportItem key={r.date} report={r} t={t} lang={lang} />)}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* Latest reports across all students */}
      <section className="rep-history">
        <div className="rep-history-head">
          <h3>{t('activity.recent')}</h3>
        </div>
        {recentReports.length === 0 ? (
          <p className="rep-empty">{t('activity.noReports')}</p>
        ) : (
          <ul className="rep-list rep-list-grid">
            {recentReports.map(r => <ReportItem key={`${r.enrollment}-${r.date}`} report={r} t={t} lang={lang} showStudent />)}
          </ul>
        )}
      </section>
    </div>
  );
};

/** One class report (read-only). */
const ReportItem = ({ report: r, t, lang, showStudent = false }) => (
  <li>
    <div className="rep-item-head">
      <strong>{formatReportDate(r.date, lang)}</strong>
      {showStudent && <span className="rep-course">{r.studentName}</span>}
    </div>
    {r.recited && <p><b>{t('activity.recited')}:</b> {r.recited}</p>}
    {r.homework && <p className="rep-homework"><b>📌 {t('activity.homework')}:</b> {r.homework}</p>}
    {(r.memorization || r.tajweed) && (
      <div className="rep-item-stars">
        {r.memorization && <span>{t('activity.memorization')} <StarRating value={r.memorization} size="0.95rem" /></span>}
        {r.tajweed && <span>{t('activity.tajweed')} <StarRating value={r.tajweed} size="0.95rem" /></span>}
      </div>
    )}
    {r.notes && <p className="rep-notes">💬 {r.notes}</p>}
  </li>
);

export default InstructorActivity;
