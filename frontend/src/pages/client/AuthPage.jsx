import { useState } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { API_URL, readJson } from '../../utils/api';
import { dashboardPathFor, safeRedirect, saveSession } from '../../utils/auth';
import { useLang } from '../../i18n/lang';
import LangToggle from '../../components/LangToggle';

const AuthPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('expired') ? t('auth.expired') : '');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // One login endpoint for everyone – the server tells us the role.
      const endpoint = isLogin ? `${API_URL}/api/client/login` : `${API_URL}/api/client/register`;
      const payload = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await readJson(res);

      if (res.ok && data.success) {
        saveSession(data.token, data.user);
        const home = dashboardPathFor(data.user?.role);
        // Students coming from a course page go back there; staff always land on their dashboard.
        const redirect = data.user?.role === 'student' ? safeRedirect(searchParams.get('redirect')) : null;
        navigate(redirect || home, { replace: true });
      } else {
        setError(t.server(data.message) || t('auth.failed'));
      }
    } catch {
      setError(t('auth.connection'));
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)' }}>

      <LangToggle className="lang-toggle-floating" />
      <div style={{ position: 'relative', zIndex: 10, background: 'var(--card-bg)', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/home" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            {t('auth.brand')}
          </Link>
          <h2 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', fontFamily: 'var(--font-heading)' }}>
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#b91c1c', padding: '1rem', borderRadius: '0.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('auth.fullName')}</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder={t('auth.namePlaceholder')} style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('auth.email')}</label>
            <input type="email" dir="ltr" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@example.com" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ color: 'var(--text-color)' }}>{t('auth.password')}</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required minLength={isLogin ? undefined : 8} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder="••••••••" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
            {!isLogin && <small style={{ color: 'var(--text-muted)' }}>{t('auth.passwordHint')}</small>}
            {isLogin && (
              <Link to="/forgot-password" style={{ display: 'inline-block', marginTop: '0.6rem', color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                {t('auth.forgot')}
              </Link>
            )}
          </div>
          
          <button type="submit" className="btn btn-accent" disabled={loading} style={{ width: '100%', fontSize: '1.2rem', padding: '0.8rem', borderRadius: '50px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}>
            {loading ? t('auth.processing') : (isLogin ? t('auth.loginButton') : t('auth.signupButton'))}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
            <button onClick={toggleAuthMode} type="button" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', marginInlineStart: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}>
              {isLogin ? t('auth.signUp') : t('auth.login')}
            </button>
          </p>
          <Link to="/home" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginTop: '1.5rem', fontSize: '0.9rem' }}>{t('auth.backHome')}</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
