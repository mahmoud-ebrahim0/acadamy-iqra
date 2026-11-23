import { Link, useOutletContext } from 'react-router-dom';
import { useLang } from '../../i18n/lang';
import { formatSchedule, hasSchedule } from '../../utils/schedule';

const zoomHref = (link) => (/^https?:\/\//.test(link) ? link : `https://${link}`);

/**
 * Student portal: one card per enrolled course – teacher, class time, join button, progress.
 * A course without a teacher yet is shown as "being prepared".
 */
const MyCourses = () => {
  const { t, lang } = useLang();
  const { enrollments } = useOutletContext();

  // Courses with a teacher first.
  const sorted = [...enrollments].sort((a, b) => Number(Boolean(b.instructor)) - Number(Boolean(a.instructor)));

  return (
    <div className="portal-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('portal.nav.courses')}</h1>
          <p className="page-sub">{t('portal.coursesSub')}</p>
        </div>
        <Link to="/dashboard/browse" className="sched-btn sched-btn-ghost" style={{ textDecoration: 'none' }}>🔍 {t('portal.nav.browse')}</Link>
      </header>

      {enrollments.length === 0 ? (
        <div className="portal-empty">
          <span aria-hidden="true">📚</span>
          <h3>{t('portal.noCourses')}</h3>
          <p>{t('student.newText')}</p>
          <Link to="/dashboard/browse" className="sched-btn sched-btn-primary" style={{ textDecoration: 'none' }}>🔍 {t('portal.browseCta')}</Link>
        </div>
      ) : (
        <div className="portal-courses">
          {sorted.map(enr => {
            const pct = Math.min(100, Math.max(0, enr.progressPercentage || 0));
            const lesson = enr.currentAyahOrLesson === 'Beginning' ? t('student.beginning') : enr.currentAyahOrLesson;
            const preparing = !enr.instructor;
            return (
              <article key={enr._id} className={`portal-course ${preparing ? 'preparing' : ''}`}>
                <div className="portal-course-cover">
                  {enr.course?.imageUrl ? <img src={enr.course.imageUrl} alt="" /> : <span aria-hidden="true">{enr.course?.icon || '📖'}</span>}
                </div>
                <div className="portal-course-body">
                  <div className="portal-course-top">
                    <h3>{enr.course?.title || t('student.courseUnavailable')}</h3>
                    {enr.course?.level && <span className="crs-level">{enr.course.level}</span>}
                  </div>

                  {preparing ? (
                    <div className="portal-preparing">
                      <strong>⏳ {t('portal.preparing.title')}</strong>
                      <span>{t('portal.preparing.text')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="portal-course-info">
                        <div><span>{t('portal.teacher')}</span><strong>👤 {enr.instructor.name}</strong></div>
                        <div><span>{t('portal.classTime')}</span><strong>🕒 {hasSchedule(enr) ? formatSchedule(enr, lang) : t('portal.noTime')}</strong></div>
                      </div>

                      <div className="portal-progress">
                        <div className="portal-progress-head">
                          <span>📖 {t('student.currentLesson', { lesson })}</span>
                          <strong>{pct}%</strong>
                        </div>
                        <div className="portal-bar"><div style={{ width: `${pct}%` }} /></div>
                      </div>

                      <div className="portal-course-actions">
                        {enr.zoomLink
                          ? <a href={zoomHref(enr.zoomLink)} target="_blank" rel="noreferrer" className="today-start">{t('portal.join')}</a>
                          : <span className="portal-nolink">🔗 {t('portal.linkSoon')}</span>}
                        <span style={{ flex: 1 }} />
                        <Link to="/dashboard/attendance" state={{ courseId: enr._id }} className="sched-btn sched-btn-ghost">📋 {t('portal.nav.attendance')}</Link>
                        <Link to="/dashboard/reports" state={{ courseId: enr._id }} className="sched-btn sched-btn-ghost">📝 {t('portal.nav.reports')}</Link>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
