import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { API_URL, readJson } from '../../utils/api';
import { getRole, getToken, getUserName, saveSession } from '../../utils/auth';
import { useCourse, formatPrice } from '../../utils/useCourse';
import { CourseStatusMessage } from './CourseDetails';
import { useLang } from '../../i18n/lang';
import LangToggle from '../../components/LangToggle';
import { useSiteSettings, whatsappDigits } from '../../utils/useSiteSettings';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { course, status } = useCourse();
  const { t } = useLang();
  // Payment accounts come from the admin Settings page (env values are only a fallback).
  const settings = useSiteSettings();
  const paymentAccounts = {
    'Vodafone Cash': settings.vodafoneCash || import.meta.env.VITE_VODAFONE_CASH_NUMBER || '',
    InstaPay: settings.instapay || import.meta.env.VITE_INSTAPAY_ADDRESS || '',
  };

  // A logged-in student enrolls with their existing account (no need to retype details).
  const token = getToken();
  const loggedInStudent = token && getRole() === 'student';
  const loggedInStaff = token && getRole() !== 'student';

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    whatsapp: '',
    email: '',
    password: '',
    level: 'Beginner'
  });

  const [paymentMethod, setPaymentMethod] = useState('Vodafone Cash');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    searchParams.get('payment') === 'cancelled' ? t('checkout.cancelled') : ''
  );

  if (!course) {
    return (
      <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
        <CourseStatusMessage status={status} />
      </div>
    );
  }

  const isFree = !(Number(course.price) > 0);
  const needsScreenshot = !isFree && paymentMethod !== 'Credit Card';
  const loginLink = `/login?redirect=${encodeURIComponent(`/checkout/${course._id}`)}`;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (needsScreenshot && !screenshot) {
      setError(t('checkout.screenshotRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        // Account fields are only sent when enrolling as a guest.
        if (loggedInStudent && ['name', 'email', 'password'].includes(key)) return;
        payload.append(key, formData[key]);
      });
      payload.append('courseId', course._id);
      payload.append('paymentMethod', paymentMethod);
      if (needsScreenshot && screenshot) {
        payload.append('screenshot', screenshot);
      }

      const res = await fetch(`${API_URL}/api/client/checkout`, {
        method: 'POST',
        headers: loggedInStudent ? { Authorization: `Bearer ${token}` } : {},
        body: payload
      });
      const data = await readJson(res);

      if (res.ok && data.success) {
        // Save the session first so the student is logged in when Stripe sends them back.
        saveSession(data.token, data.user);
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        navigate('/dashboard/courses', { replace: true });
      } else {
        setError(t.server(data.message) || t('checkout.failed'));
      }
    } catch {
      setError(t('checkout.connection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-cosmic" style={{ minHeight: '100vh', padding: '4rem 1rem' }}>
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
        <LangToggle className="lang-toggle-floating" />

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Link to="/home" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)', textDecoration: 'none', textShadow: '0 0 15px rgba(250, 204, 21, 0.5)' }}>
            {t('checkout.brand')}
          </Link>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginTop: '1rem' }}>{t('checkout.title')}</h1>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#b91c1c', padding: '1rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: '3rem' }}>
          
          {/* Left Column: Student Information Form */}
          <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(56, 189, 248, 0.2)', backdropFilter: 'blur(15px)' }}>
            <h2 style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '1px solid rgba(56,189,248,0.2)', paddingBottom: '0.5rem' }}>{t('checkout.step1')}</h2>
            
            {loggedInStaff && (
              <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>
                {t('checkout.staffWarning')}
              </p>
            )}

            {loggedInStudent ? (
              <p style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>
                {t('checkout.enrollingAs')} <strong style={{ color: 'var(--primary-color)' }}>{getUserName()}</strong>
              </p>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  {t('checkout.haveAccount')} <Link to={loginLink} style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{t('checkout.loginFirst')}</Link>
                </p>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('checkout.name')}</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" placeholder={t('checkout.namePlaceholder')} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('checkout.age')}</label>
                <input required type="number" name="age" value={formData.age} onChange={handleInputChange} className="form-control" placeholder="25" />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('checkout.whatsapp')}</label>
                <input required type="tel" dir="ltr" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="form-control" placeholder="+20 10X XXX XXXX" />
              </div>
            </div>

            {!loggedInStudent && (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('checkout.email')}</label>
                  <input required type="email" dir="ltr" name="email" value={formData.email} onChange={handleInputChange} className="form-control" placeholder="ahmed@example.com" autoComplete="email" />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('checkout.password')}</label>
                  <input required type="password" name="password" minLength={8} value={formData.password} onChange={handleInputChange} className="form-control" placeholder={t('checkout.passwordPlaceholder')} autoComplete="new-password" />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('checkout.level')}</label>
              <select name="level" value={formData.level} onChange={handleInputChange} className="form-control">
                <option value="Beginner">{t('checkout.levelBeginner')}</option>
                <option value="Memorized Some">{t('checkout.levelSome')}</option>
                <option value="Advanced">{t('checkout.levelAdvanced')}</option>
              </select>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(250, 204, 21, 0.2)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '1px solid rgba(250,204,21,0.2)', paddingBottom: '0.5rem' }}>{t('checkout.step2')}</h2>
            
            {/* Course Summary Card */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{t('checkout.selectedCourse')}</p>
                <h3 style={{ color: 'var(--text-color)', fontSize: '1.2rem' }}>{course.title}</h3>
              </div>
              <div style={{ textAlign: 'end' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{t('checkout.totalPrice')}</p>
                <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>{formatPrice(course.price, t('courses.free'))}</h3>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ color: 'var(--text-color)', marginBottom: '1rem', display: 'block' }}>{t('checkout.selectMethod')}</label>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {['Vodafone Cash', 'InstaPay', 'Credit Card'].map(method => (
                  <button 
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1, padding: '1rem 0.5rem', borderRadius: '1rem', border: '1px solid', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold', fontSize: '0.9rem',
                      background: paymentMethod === method ? 'rgba(122, 27, 41, 0.08)' : '#ffffff',
                      borderColor: paymentMethod === method ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                      color: paymentMethod === method ? 'var(--primary-color)' : '#94a3b8',
                      boxShadow: paymentMethod === method ? '0 0 15px rgba(250,204,21,0.2)' : 'none'
                    }}
                  >
                    {t(`checkout.method.${method}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Payment Details */}
            {needsScreenshot && (
              <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed rgba(56, 189, 248, 0.3)', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-color)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  {t('checkout.transferTo', { price: formatPrice(course.price, t('courses.free')), method: t(`checkout.method.${paymentMethod}`) })}
                </p>
                {paymentAccounts[paymentMethod] ? (
                  <div style={{ background: 'var(--primary-color)', padding: '1rem', borderRadius: '0.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <span dir="ltr" style={{ fontSize: '1.5rem', color: 'white', letterSpacing: '2px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {paymentAccounts[paymentMethod]}
                    </span>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.4)', padding: '1rem', borderRadius: '0.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0 0 0.6rem', color: 'var(--text-color)' }}>{t('checkout.accountOnWhatsapp')}</p>
                    <a href={`https://wa.me/${whatsappDigits(settings)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#128C7E', fontWeight: 700 }}>💬 {t('checkout.askOnWhatsapp')}</a>
                  </div>
                )}
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>{t('checkout.uploadScreenshot')}</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    style={{ 
                      width: '100%', padding: '0.8rem', background: '#ffffff', borderRadius: '0.5rem', color: 'var(--text-muted)',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} 
                  />
                  {screenshot && <p style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{t('checkout.fileSelected', { name: screenshot.name })}</p>}
                </div>
              </div>
            )}

            {!isFree && paymentMethod === 'Credit Card' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-color)', textAlign: 'center' }}>{t('checkout.stripeNote')}</p>
              </div>
            )}

            <button type="submit" disabled={loading || loggedInStaff} className="btn btn-accent" style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', marginTop: 'auto', textShadow: '0 0 10px rgba(56,189,248,0.5)', boxShadow: '0 10px 30px rgba(56, 189, 248, 0.2)' }}>
              {loading ? t('checkout.processing') : t('checkout.confirm')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
