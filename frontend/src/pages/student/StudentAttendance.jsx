import { useState } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { useLang } from '../../i18n/lang';
import AttendanceRecord from '../instructor/AttendanceRecord';

/** Student portal: monthly attendance calendar per course (read-only). */
const StudentAttendance = () => {
  const { t } = useLang();
  const { enrollments, attendance } = useOutletContext();
  const location = useLocation();
  // Courses with a teacher first (only they can have attendance).
  const courses = [...enrollments].sort((a, b) => Number(Boolean(b.instructor)) - Number(Boolean(a.instructor)));
  const [courseId, setCourseId] = useState(location.state?.courseId || null);
  const course = courses.find(e => e._id === courseId) || courses[0] || null;

  return (
    <div className="portal-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('portal.nav.attendance')}</h1>
          <p className="page-sub">{t('student.attendance.subtitle')}</p>
        </div>
      </header>

      {!course ? (
        <div className="portal-empty">
          <span aria-hidden="true">📋</span>
          <h3>{t('portal.noCourses')}</h3>
          <Link to="/dashboard/browse" className="sched-btn sched-btn-primary" style={{ textDecoration: 'none' }}>🔍 {t('portal.browseCta')}</Link>
        </div>
      ) : (
        <>
          {courses.length > 1 && (
            <div className="student-att-tabs">
              {courses.map(e => {
                const a = attendance[e._id];
                const rate = a && a.present + a.absent ? Math.round((a.present / (a.present + a.absent)) * 100) : null;
                return (
                  <button key={e._id} type="button" className={e._id === course._id ? 'active' : ''} onClick={() => setCourseId(e._id)}>
                    {e.course?.title || t('student.courseUnavailable')}
                    {rate !== null && <span>{rate}%</span>}
                  </button>
                );
              })}
            </div>
          )}

          {!course.instructor ? (
            <div className="portal-empty">
              <span aria-hidden="true">⏳</span>
              <h3>{t('portal.preparing.title')}</h3>
              <p>{t('portal.attendanceAfterTeacher')}</p>
            </div>
          ) : (
            <AttendanceRecord
              key={course._id}
              enrollment={course}
              readOnly
              endpoint="/api/student/attendance/"
              title={course.course?.title || t('student.courseUnavailable')}
              subtitle={`👤 ${course.instructor.name}`}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StudentAttendance;
