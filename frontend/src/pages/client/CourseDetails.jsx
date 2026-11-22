import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCourse, formatPrice } from '../../utils/useCourse';
import { useLang } from '../../i18n/lang';

export const CourseStatusMessage = ({ status }) => {
  const { t } = useLang();
  return (
  <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
    {status === 'loading' ? (
      <h2 style={{ color: 'var(--primary-color)' }}>{t('course.loading')}</h2>
    ) : (
      <>
        <h2 style={{ color: 'var(--primary-color)' }}>
          {status === 'not-found' ? t('course.notFound') : t('course.error')}
        </h2>
        <Link to="/home" className="btn btn-accent">{t('course.browse')}</Link>
      </>
    )}
  </div>
  );
};

const CourseDetails = () => {
  const navigate = useNavigate();
  const { course, status } = useCourse();
  const { t } = useLang();

  if (!course) {
    return (
      <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
        <Navbar />
        <CourseStatusMessage status={status} />
        <Footer />
      </div>
    );
  }

  const handleEnroll = () => {
    navigate(`/checkout/${course._id}`, { state: { course } });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Hero Section for Course */}
      <div style={{ 
        backgroundColor: 'var(--primary-color)', 
        color: 'white', 
        padding: '6rem 2rem 4rem', 
        textAlign: 'center',
        borderBottom: '5px solid var(--accent-color)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            fontSize: '5rem', 
            marginBottom: '1rem', 
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            borderRadius: '50%',
            border: '2px solid var(--accent-color)'
          }}>
            {course.icon || '📚'}
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{course.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '1.2rem', opacity: 0.9 }}>
            <span><i style={{ color: 'var(--accent-color)' }}>{t('details.level')}</i> {course.level}</span>
            <span>|</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
              {formatPrice(course.price, t('courses.free'))}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ flex: 1, padding: '4rem 2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        
        {/* Left Column: Description */}
        <div style={{ flex: '1 1 600px' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-secondary)', paddingBottom: '0.5rem' }}>
            {t('details.overview')}
          </h2>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-color)', marginBottom: '2rem' }}>
            {course.description || t('details.defaultDescription')}
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-secondary)', paddingBottom: '0.5rem' }}>
            {t('details.learn')}
          </h2>
          <ul style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)', paddingInlineStart: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>{t('details.l1')}</li>
            <li style={{ marginBottom: '0.5rem' }}>{t('details.l2')}</li>
            <li style={{ marginBottom: '0.5rem' }}>{t('details.l3')}</li>
            <li style={{ marginBottom: '0.5rem' }}>{t('details.l4')}</li>
          </ul>
        </div>

        {/* Right Column: Sticky Enrollment Card */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <div style={{ 
            backgroundColor: 'var(--card-bg)', 
            padding: '2.5rem', 
            borderRadius: '15px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'sticky',
            top: '100px'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-color)' }}>
              {t('details.ready')}
            </h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
              {t('details.secure')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {formatPrice(course.price, t('courses.free'))}
              </span>
            </div>
            <button 
              onClick={handleEnroll} 
              className="btn btn-accent" 
              style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}
            >
              {t('details.enroll')}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <i style={{ color: '#25d366' }}>✓</i> {t('details.guarantee')}
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;
