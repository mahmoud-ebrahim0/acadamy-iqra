import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL, readJson } from '../../utils/api';
import { dashboardPathFor, saveSession } from '../../utils/auth';
import { useLang } from '../../i18n/lang';
import { lightInputStyle } from '../../utils/styles';
import LangToggle from '../../components/LangToggle';

const Shell = ({ title, subtitle, children }) => {
  const { t } = useLang();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', position: 'relative' }}>
      <LangToggle className="lang-toggle-floating" />
      <div style={{ background: 'var(--card-bg)', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', width: '100%', maxWidth: '450px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/home" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
            {t('auth.brand')}
          </Link>
          <h2 style={{ color: 'var(--primary-color)', fontSize: '1.6rem', marginTop: '0.8rem', fontFamily: 'var(--font-heading)' }}>{title}</h2>
          {subtitle && <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};

const Message = ({ type, children }) => (
  <div style={{
    padding: '1rem', borderRadius: '0.8rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.7,
    background: type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    color: type === 'success' ? '#047857' : '#b91c1c',
  }}>
    {children}
  </div>
);

const submitStyle = { width: '100%', fontSize: '1.1rem', padding: '0.8rem', borderRadius: '50px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' };
const labelStyle = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-color)' };

/** Step 1: ask for the email and send the reset link. */
export const ForgotPasswordPage = () => {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/client/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await readJson(res);
      if (res.ok) setSent(true);
      else setError(t.server(data.message) || t('auth.connection'));
    } catch {
      setError(t('auth.connection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell title={t('forgot.title')} subtitle={sent ? null : t('forgot.subtitle')}>
      {sent ? (
        <Message type="success">{t('forgot.sent')}</Message>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <Message type="error">{error}</Message>}
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={labelStyle}>{t('forgot.email')}</label>
            <input type="email" dir="ltr" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={lightInputStyle} placeholder="student@example.com" />
          </div>
          <button type="submit" className="btn btn-accent" disabled={loading} style={submitStyle}>
            {loading ? t('forgot.sending') : t('forgot.submit')}
          </button>
        </form>
      )}
      <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{t('forgot.backLogin')}</Link>
    </Shell>
  );
};

/** Step 2: the link from the email opens this page to choose a new password. */
export const ResetPasswordPage = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const linkLooksValid = /^[a-f0-9]{64}$/.test(token);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('reset.mismatch'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/client/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await readJson(res);
      if (res.ok && data.success) {
        saveSession(data.token, data.user);
        navigate(dashboardPathFor(data.user?.role), { replace: true });
      } else {
        setError(t.server(data.message) || t('reset.failed'));
      }
    } catch {
      setError(t('auth.connection'));
    } finally {
      setLoading(false);
    }
  };

  if (!linkLooksValid) {
    return (
      <Shell title={t('reset.title')}>
        <Message type="error">{t('reset.invalidLink')}</Message>
        <Link to="/forgot-password" className="btn btn-accent" style={{ ...submitStyle, display: 'block', textAlign: 'center', textDecoration: 'none' }}>{t('reset.requestNew')}</Link>
      </Shell>
    );
  }

  return (
    <Shell title={t('reset.title')}>
      <form onSubmit={handleSubmit}>
        {error && <Message type="error">{error}</Message>}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={labelStyle}>{t('reset.new')}</label>
          <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} style={lightInputStyle} />
          <small style={{ color: 'var(--text-muted)' }}>{t('auth.passwordHint')}</small>
        </div>
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={labelStyle}>{t('reset.confirm')}</label>
          <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} style={lightInputStyle} />
        </div>
        <button type="submit" className="btn btn-accent" disabled={loading} style={submitStyle}>
          {loading ? t('reset.saving') : t('reset.submit')}
        </button>
      </form>
    </Shell>
  );
};
