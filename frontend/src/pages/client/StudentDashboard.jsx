import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchWithAuth, readJson } from '../../utils/api';
import { getUserName } from '../../utils/auth';
import { useLang } from '../../i18n/lang';

const StudentDashboard = () => {
  const formatZoomLink = (link) => {
    if (!link) return '#';
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return `https://${link}`;
    }
    return link;
  };

  const { t } = useLang();
  const userName = getUserName() || t('student.defaultName');
  const firstName = userName.split(' ')[0];
  const [searchParams] = useSearchParams();
  const paymentSucceeded = searchParams.get('payment') === 'success';

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    // The server returns only the logged-in student's enrollments (identified by the token).
    fetchWithAuth('/api/student/dashboard')
      .then(async res => {
        const data = await readJson(res);
        if (res.ok) setEnrollments(data.enrollments || []);
        // Store what went wrong; it is translated when shown (so it follows language changes).
        else setLoadError(data.message || 'student.loadError');
      })
      .catch(() => setLoadError('student.connection'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="section" style={{ minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>
        {/* Cosmic Background Elements */}
        <div className="cosmic-swirl swirl-1" style={{ top: '20%', left: '10%' }}></div>
        <div className="cosmic-swirl swirl-2" style={{ bottom: '10%', right: '10%' }}></div>
        <div className="asteroid" style={{ top: '30%', left: '80%', animationDelay: '1s' }}></div>
        <div className="asteroid" style={{ top: '70%', left: '20%', width: '12px', height: '12px', animationDelay: '6s' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>

          {paymentSucceeded && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#059669', padding: '1rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
              {t('student.paymentSuccess')}
            </div>
          )}

          {enrollments.some(e => e.paymentStatus === 'Pending') && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#b45309', padding: '1rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
              {t('student.pendingNotice')}
            </div>
          )}

          {loading ? (
             <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary-color)' }}>{t('student.loading')}</div>
          ) : loadError ? (
             <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>{loadError.startsWith('student.') ? t(loadError) : t.server(loadError)}</div>
          ) : enrollments.length === 0 ? (
            /* New Student Welcome Card */
            <div className="course-card" style={{ padding: '4rem 2rem', marginTop: '2rem', marginBottom: '3rem', textAlign: 'center', border: '1px solid rgba(250, 204, 21, 0.4)', boxShadow: '0 0 40px rgba(250, 204, 21, 0.1), inset 0 0 20px rgba(250, 204, 21, 0.1)' }}>
              <h1 style={{ color: 'var(--primary-color)', fontSize: '2.8rem', marginBottom: '1.5rem', textShadow: '0 0 15px rgba(250, 204, 21, 0.5)', fontFamily: 'var(--font-heading)' }}>
                {t('student.welcomeNew', { name: firstName })}
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                {t('student.newText')}
              </p>
              <Link to="/home" className="btn btn-accent" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px', display: 'inline-block' }}>
                {t('student.browse')}
              </Link>
            </div>
          ) : (
            <>
              {/* Welcome Card for Active Students */}
              <div className="course-card" style={{ padding: '3rem', marginBottom: '3rem', textAlign: 'center', border: '1px solid rgba(250, 204, 21, 0.4)', boxShadow: '0 0 40px rgba(250, 204, 21, 0.1), inset 0 0 20px rgba(250, 204, 21, 0.1)' }}>
                <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '1rem', textShadow: '0 0 15px rgba(250, 204, 21, 0.5)' }}>
                  {t('student.welcomeBack', { name: firstName })}
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{t('student.readyText')}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: '2rem' }}>
                
                {/* Schedule Section */}
                <div className="course-card" style={{ padding: '2rem' }}>
                  <h2 style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', textShadow: '0 0 10px rgba(56, 189, 248, 0.4)' }}>{t('student.upcoming')}</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {enrollments.filter(e => e.scheduleTime).length > 0 ? enrollments.filter(e => e.scheduleTime).map(enr => (
                      <div key={enr._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', borderInlineStart: '4px solid var(--accent-color)' }}>
                        <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>{enr.course?.title || t('student.courseUnavailable')}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                          👤 {enr.instructor?.name || t('student.pendingInstructor')} &nbsp;|&nbsp; 🕒 {enr.scheduleTime}
                        </p>
                        {enr.zoomLink ? (
                          <a href={formatZoomLink(enr.zoomLink)} target="_blank" rel="noreferrer" className="btn btn-accent" style={{ width: '100%', padding: '0.6rem', textAlign: 'center', display: 'block' }}>{t('student.joinZoom')}</a>
                        ) : (
                          <button className="btn btn-outline" style={{ width: '100%', padding: '0.6rem', cursor: 'not-allowed', color: 'var(--text-muted)' }}>{t('student.noLink')}</button>
                        )}
                      </div>
                    )) : (
                      <p style={{ color: 'var(--text-muted)' }}>{t('student.noClasses')}</p>
                    )}
                  </div>
                </div>

                {/* Progress Section */}
                <div className="course-card" style={{ padding: '2rem' }}>
                  <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>{t('student.progress')}</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {enrollments.map(enr => (
                      <div key={enr._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>
                            {enr.course?.title || t('student.courseUnavailable')}
                            {enr.paymentStatus !== 'Paid' && (
                              <span style={{ marginInlineStart: '0.5rem', fontSize: '0.8rem', color: enr.paymentStatus === 'Failed' ? '#ef4444' : '#f59e0b' }}>
                                ({enr.paymentStatus === 'Failed' ? t('student.paymentFailed') : t('student.awaitingPayment')})
                              </span>
                            )}
                          </span>
                          <span style={{ color: 'var(--primary-color)' }}>{enr.progressPercentage}%</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('student.currentLesson', { lesson: enr.currentAyahOrLesson === 'Beginning' ? t('student.beginning') : enr.currentAyahOrLesson })}</div>
                        {/* Progress Bar Container */}
                        <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '5px', overflow: 'hidden', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)' }}>
                          {/* Golden Progress Fill */}
                          <div style={{ 
                            width: `${enr.progressPercentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #b45309, #facc15)', 
                            boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
                            borderRadius: '5px',
                            transition: 'width 1s ease-in-out'
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <Link to="/home" className="btn btn-outline" style={{ width: '100%' }}>{t('student.browseMore')}</Link>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentDashboard;
