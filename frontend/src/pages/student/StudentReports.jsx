import { useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { useLang } from '../../i18n/lang';
import { formatReportDate, ratingTrend, TREND_ICON } from '../../utils/reports';
import StarRating from '../../components/StarRating';

/** Student portal: the teacher's class reports, filterable by course, with rating trends. */
const StudentReports = () => {
  const { t, lang } = useLang();
  const { enrollments, reports } = useOutletContext();
  const location = useLocation();
  const [courseId, setCourseId] = useState(location.state?.courseId || 'all');

  const shown = courseId === 'all' ? reports : reports.filter(r => r.enrollment === courseId);
  const courseTitle = (id) => enrollments.find(e => e._id === id)?.course?.title || '';
  const trends = [['memorization', ratingTrend(shown, 'memorization')], ['tajweed', ratingTrend(shown, 'tajweed')]];

  return (
    <div className="portal-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('portal.nav.reports')}</h1>
          <p className="page-sub">{t('student.reports.subtitle')}</p>
        </div>
      </header>

      {reports.length === 0 ? (
        <div className="portal-empty">
          <span aria-hidden="true">📝</span>
          <h3>{t('student.reports.empty')}</h3>
          <p>{t('portal.reportsHint')}</p>
        </div>
      ) : (
      <>
      {enrollments.length > 1 && (
        <div className="student-att-tabs">
          <button type="button" className={courseId === 'all' ? 'active' : ''} onClick={() => setCourseId('all')}>{t('portal.allCourses')} <span>{reports.length}</span></button>
          {enrollments.filter(e => reports.some(r => r.enrollment === e._id)).map(e => (
            <button key={e._id} type="button" className={courseId === e._id ? 'active' : ''} onClick={() => setCourseId(e._id)}>
              {e.course?.title || t('student.courseUnavailable')} <span>{reports.filter(r => r.enrollment === e._id).length}</span>
            </button>
          ))}
        </div>
      )}

      {trends.some(([, tr]) => tr.avg !== null) && (
        <div className="rep-trends">
          {trends.map(([key, trend]) => trend.avg !== null && (
            <div key={key} className="rep-trend">
              <span>{t(`instructor.rep.${key}`)} · {t('instructor.rep.avgLast5')}</span>
              <strong>{trend.avg.toFixed(1)} / 5</strong>
              {trend.direction && <em className={trend.direction}>{TREND_ICON[trend.direction]} {t(`instructor.rep.trend.${trend.direction}`)}</em>}
            </div>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rep-empty">{t('portal.noReportsCourse')}</p>
      ) : (
        <ul className="rep-list rep-list-grid">
          {shown.map(r => (
            <li key={`${r.enrollment}-${r.date}`}>
              <div className="rep-item-head">
                <strong>{formatReportDate(r.date, lang)}</strong>
                <span className="rep-course">{courseTitle(r.enrollment)}</span>
              </div>
              {r.recited && <p><b>{t('instructor.rep.recitedShort')}:</b> {r.recited}</p>}
              {r.homework && <p className="rep-homework"><b>📌 {t('instructor.rep.homeworkShort')}:</b> {r.homework}</p>}
              {(r.memorization || r.tajweed) && (
                <div className="rep-item-stars">
                  {r.memorization && <span>{t('instructor.rep.memorization')} <StarRating value={r.memorization} size="0.95rem" label={t('instructor.rep.memorization')} /></span>}
                  {r.tajweed && <span>{t('instructor.rep.tajweed')} <StarRating value={r.tajweed} size="0.95rem" label={t('instructor.rep.tajweed')} /></span>}
                </div>
              )}
              {r.notes && <p className="rep-notes">💬 {r.notes}</p>}
            </li>
          ))}
        </ul>
      )}
      </>
      )}
    </div>
  );
};

export default StudentReports;
