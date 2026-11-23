import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { API_URL } from '../../utils/api';
import { useLang } from '../../i18n/lang';

/** Student portal: the academy's courses – ones the student can join first, then the ones they're in. */
const BrowseCourses = () => {
  const { t } = useLang();
  const { enrollments } = useOutletContext();
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/client/courses`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]));
  }, []);

  const enrolledIds = new Set(enrollments.map(e => e.course?._id).filter(Boolean));
  const price = (p) => (Number(p) > 0 ? `$${p}` : t('courses.free'));
  const available = (courses || []).filter(c => !enrolledIds.has(c._id));
  const joined = (courses || []).filter(c => enrolledIds.has(c._id));

  const card = (course, enrolled) => (
    <article key={course._id} className={`crs-card browse-card ${enrolled ? 'joined' : ''}`}>
      <div className="crs-cover">
        {course.imageUrl ? <img src={course.imageUrl} alt="" /> : <span aria-hidden="true">{course.icon || '📖'}</span>}
        {enrolled && <span className="crs-status on">{t('portal.enrolled')}</span>}
      </div>
      <div className="crs-body">
        <h3>{course.title}</h3>
        <span className="crs-level">👤 {course.level}</span>
        <p className="crs-desc" style={{ WebkitLineClamp: 3 }}>{course.description}</p>
      </div>
      <div className="browse-footer">
        <div className="browse-price">
          <span>{t('portal.price')}</span>
          <strong>{price(course.price)}</strong>
        </div>
        {enrolled ? (
          <Link to="/dashboard/courses" className="sched-btn sched-btn-ghost">{t('portal.goToCourse')}</Link>
        ) : (
          <Link to={`/checkout/${course._id}`} state={{ course }} className="sched-btn sched-btn-primary">{t('portal.enroll')}</Link>
        )}
      </div>
    </article>
  );

  return (
    <div className="portal-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('portal.nav.browse')}</h1>
          <p className="page-sub">{t('portal.browseSub')}</p>
        </div>
        {courses && courses.length > 0 && (
          <div className="welcome-meta">
            <span>📚 {t('portal.availableCount', { count: available.length })}</span>
            <span>✓ {t('portal.joinedCount', { count: joined.length })}</span>
          </div>
        )}
      </header>

      {courses === null ? (
        <p style={{ color: 'var(--text-muted)' }}>{t('student.loading')}</p>
      ) : courses.length === 0 ? (
        <div className="portal-empty">
          <span aria-hidden="true">📚</span>
          <h3>{t('portal.noCoursesAvailable')}</h3>
        </div>
      ) : (
        <>
          {available.length > 0 ? (
            <section>
              <h3 className="ov-section-title">{t('portal.availableTitle')}</h3>
              <div className="crs-grid">{available.map(c => card(c, false))}</div>
            </section>
          ) : (
            <div className="portal-empty">
              <span aria-hidden="true">🎉</span>
              <h3>{t('portal.allJoined')}</h3>
            </div>
          )}
          {joined.length > 0 && (
            <section>
              <h3 className="ov-section-title">{t('portal.joinedTitle')}</h3>
              <div className="crs-grid">{joined.map(c => card(c, true))}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseCourses;
