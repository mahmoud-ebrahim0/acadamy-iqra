import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { useLang } from '../../i18n/lang';
import { getUserName } from '../../utils/auth';
import { formatClock, formatSchedule, hasSchedule, nextClassDate } from '../../utils/schedule';
import { formatReportDate, ratingTrend, TREND_ICON } from '../../utils/reports';
import StarRating from '../../components/StarRating';

const zoomHref = (link) => (/^https?:\/\//.test(link) ? link : `https://${link}`);

/** Student portal home: greeting, key numbers, next classes, latest report. */
const StudentHome = () => {
  const { t, lang } = useLang();
  const { enrollments, reports, attendance } = useOutletContext();
  const [searchParams] = useSearchParams();
  const paymentSucceeded = searchParams.get('payment') === 'success';

  const nameWords = (getUserName() || t('student.defaultName')).trim().split(/\s+/);
  const firstName = nameWords[0];
  const todayLabel = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  // Attendance across all courses
  const totals = Object.values(attendance).reduce((acc, a) => ({ present: acc.present + a.present, absent: acc.absent + a.absent }), { present: 0, absent: 0 });
  const rate = totals.present + totals.absent ? Math.round((totals.present / (totals.present + totals.absent)) * 100) : null;
  const memTrend = ratingTrend(reports, 'memorization');
  const avgProgress = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + (e.progressPercentage || 0), 0) / enrollments.length) : 0;

  // Upcoming classes, soonest first
  const upcoming = enrollments
    .map(e => ({ enr: e, next: nextClassDate(e) }))
    .filter(x => x.next || (x.enr.scheduleTime && hasSchedule(x.enr)))
    .sort((a, b) => (a.next && b.next ? a.next - b.next : a.next ? -1 : 1));

  const whenLabel = (date) => {
    if (!date) return '';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const day = new Date(date); day.setHours(0, 0, 0, 0);
    const diff = Math.round((day - today) / 86400000);
    const clock = formatClock(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`, lang);
    if (diff === 0) return t('portal.today', { time: clock });
    if (diff === 1) return t('portal.tomorrow', { time: clock });
    return `${date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long' })} – ${clock}`;
  };

  const latest = reports[0];
  const courseTitle = (id) => enrollments.find(e => e._id === id)?.course?.title || '';

  return (
    <div className="portal-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('portal.welcome', { name: firstName })}</h1>
          <p className="page-sub">{t('portal.welcomeSub')}</p>
        </div>
        <div className="welcome-meta"><span>📅 {todayLabel}</span></div>
      </header>

      {paymentSucceeded && <div className="crs-flash success">{t('student.paymentSuccess')}</div>}

      {enrollments.length === 0 ? (
        <div className="crs-empty">
          <h2 style={{ margin: 0, color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>{t('student.welcomeNew', { name: firstName })}</h2>
          <p style={{ margin: 0, maxWidth: '520px', textAlign: 'center' }}>{t('student.newText')}</p>
          <Link to="/dashboard/browse" className="sched-btn sched-btn-primary" style={{ textDecoration: 'none' }}>🔍 {t('portal.browseCta')}</Link>
        </div>
      ) : (
        <>
          {/* Key numbers */}
          <div className="ov-kpis">
            <div className="ov-kpi" style={{ '--kpi': 'var(--primary-color)' }}>
              <span className="ov-kpi-label">📚 {t('portal.kpi.courses')}</span>
              <strong>{enrollments.length}</strong>
              <small>{t('portal.kpi.progress', { pct: avgProgress })}</small>
            </div>
            <div className="ov-kpi" style={{ '--kpi': rate === null ? '#64748b' : rate >= 80 ? '#059669' : rate >= 50 ? '#d97706' : '#dc2626' }}>
              <span className="ov-kpi-label">📋 {t('portal.kpi.attendance')}</span>
              <strong>{rate === null ? '—' : `${rate}%`}</strong>
              <small>{t('portal.kpi.attendanceCounts', { present: totals.present, absent: totals.absent })}</small>
            </div>
            <div className="ov-kpi" style={{ '--kpi': '#b45309' }}>
              <span className="ov-kpi-label">⭐ {t('portal.kpi.rating')}</span>
              <strong>{memTrend.avg === null ? '—' : `${memTrend.avg.toFixed(1)}/5`}</strong>
              <small>{memTrend.direction ? `${TREND_ICON[memTrend.direction]} ${t(`instructor.rep.trend.${memTrend.direction}`)}` : t('portal.kpi.reports', { count: reports.length })}</small>
            </div>
          </div>

          <div className="portal-grid">
            {/* Upcoming classes */}
            <section className="portal-card">
              <div className="portal-card-head">
                <h3>🗓️ {t('portal.upcoming')}</h3>
                <Link to="/dashboard/courses">{t('portal.viewAll')}</Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="rep-empty">{t('student.noClasses')}</p>
              ) : (
                <ul className="portal-list">
                  {upcoming.slice(0, 4).map(({ enr, next }) => (
                    <li key={enr._id}>
                      <div style={{ minWidth: 0 }}>
                        <strong>{enr.course?.title || t('student.courseUnavailable')}</strong>
                        <span>👤 {enr.instructor?.name || t('student.pendingInstructor')}</span>
                        <em>🕒 {next ? whenLabel(next) : formatSchedule(enr, lang)}</em>
                      </div>
                      {enr.zoomLink
                        ? <a href={zoomHref(enr.zoomLink)} target="_blank" rel="noreferrer" className="today-start">{t('portal.join')}</a>
                        : <span className="ov-pill">{t('student.noLink')}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Latest report */}
            <section className="portal-card">
              <div className="portal-card-head">
                <h3>📝 {t('portal.latestReport')}</h3>
                <Link to="/dashboard/reports">{t('portal.viewAll')}</Link>
              </div>
              {!latest ? (
                <p className="rep-empty">{t('student.reports.empty')}</p>
              ) : (
                <div className="portal-report">
                  <div className="rep-item-head">
                    <strong>{formatReportDate(latest.date, lang)}</strong>
                    <span className="rep-course">{courseTitle(latest.enrollment)}</span>
                  </div>
                  {latest.recited && <p><b>{t('instructor.rep.recitedShort')}:</b> {latest.recited}</p>}
                  {latest.homework && <p className="rep-homework"><b>📌 {t('instructor.rep.homeworkShort')}:</b> {latest.homework}</p>}
                  {(latest.memorization || latest.tajweed) && (
                    <div className="rep-item-stars">
                      {latest.memorization && <span>{t('instructor.rep.memorization')} <StarRating value={latest.memorization} size="0.95rem" /></span>}
                      {latest.tajweed && <span>{t('instructor.rep.tajweed')} <StarRating value={latest.tajweed} size="0.95rem" /></span>}
                    </div>
                  )}
                  {latest.notes && <p className="rep-notes">💬 {latest.notes}</p>}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentHome;
