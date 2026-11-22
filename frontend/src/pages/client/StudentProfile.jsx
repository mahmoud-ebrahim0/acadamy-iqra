import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ChangePasswordForm from '../../components/ChangePasswordForm';
import { fetchWithAuth, readJson } from '../../utils/api';
import { updateSessionName } from '../../utils/auth';
import { useLang } from '../../i18n/lang';
import { cardStyle, lightInputStyle } from '../../utils/styles';

const labelStyle = { display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-color)' };
const fieldStyle = { marginBottom: '1.2rem' };

/** Student profile: personal details (name, email, phone) and password. */
const StudentProfile = () => {
  const { t, lang } = useLang();
  const [profile, setProfile] = useState(null); // last saved data from the server
  const [form, setForm] = useState({ name: '', email: '', phone: '', currentPassword: '' });
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWithAuth('/api/account/me')
      .then(async res => {
        const data = await readJson(res);
        if (!res.ok) { setLoadError(data.message || 'profile.loadError'); return; }
        setProfile(data);
        setForm({ name: data.name, email: data.email, phone: data.phone || '', currentPassword: '' });
      })
      .catch(() => setLoadError('profile.loadError'));
  }, []);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setStatus({ type: '', message: '' });
  };

  const emailChanged = profile && form.email.trim().toLowerCase() !== profile.email;
  const isDirty = profile && (form.name !== profile.name || form.phone !== (profile.phone || '') || emailChanged);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetchWithAuth('/api/account/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          currentPassword: emailChanged ? form.currentPassword : undefined,
        }),
      });
      const data = await readJson(res);
      if (res.ok) {
        setProfile(data);
        setForm({ name: data.name, email: data.email, phone: data.phone || '', currentPassword: '' });
        updateSessionName(data.name);
        setStatus({ type: 'success', message: t('profile.saved') });
      } else {
        setStatus({ type: 'error', message: t.server(data.message) || t('profile.saveFailed') });
      }
    } catch {
      setStatus({ type: 'error', message: t('account.connection') });
    } finally {
      setSaving(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
      <Navbar />
      <div className="section" style={{ minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2.2rem', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>{t('profile.title')}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('profile.subtitle')}</p>

          {loadError ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#b91c1c' }}>{loadError.startsWith('profile.') ? t(loadError) : t.server(loadError)}</div>
          ) : !profile ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary-color)' }}>{t('student.loading')}</div>
          ) : (
            <>
              {/* Personal details */}
              <div style={{ ...cardStyle, marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.8rem', flexWrap: 'wrap' }}>
                  <div aria-hidden="true" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700 }}>
                    {profile.name.trim().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ color: 'var(--text-color)', fontSize: '1.4rem', margin: 0 }}>{profile.name}</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('profile.memberSince', { date: memberSince })}</p>
                  </div>
                </div>

                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.2rem', fontSize: '1.3rem' }}>{t('profile.details')}</h3>
                <form onSubmit={handleSubmit}>
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="profile-name">{t('profile.name')}</label>
                    <input id="profile-name" type="text" required minLength={2} maxLength={100} value={form.name} onChange={update('name')} style={lightInputStyle} autoComplete="name" />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="profile-email">{t('profile.email')}</label>
                    <input id="profile-email" type="email" required maxLength={254} value={form.email} onChange={update('email')} style={lightInputStyle} autoComplete="email" dir="ltr" />
                  </div>
                  {emailChanged && (
                    <div style={fieldStyle}>
                      <label style={labelStyle} htmlFor="profile-current-password">{t('profile.passwordForEmail')}</label>
                      <input id="profile-current-password" type="password" required value={form.currentPassword} onChange={update('currentPassword')} style={lightInputStyle} autoComplete="current-password" />
                    </div>
                  )}
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="profile-phone">{t('profile.phone')}</label>
                    <input id="profile-phone" type="tel" maxLength={30} value={form.phone} onChange={update('phone')} style={lightInputStyle} autoComplete="tel" dir="ltr" placeholder="+20 10 0000 0000" />
                    <small style={{ color: 'var(--text-muted)' }}>{t('profile.phoneHint')}</small>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn" disabled={saving || !isDirty} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '999px', opacity: saving || !isDirty ? 0.6 : 1 }}>
                      {saving ? t('account.saving') : t('profile.save')}
                    </button>
                    {status.message && (
                      <span style={{ color: status.type === 'success' ? '#047857' : '#b91c1c', fontWeight: 600 }}>{status.message}</span>
                    )}
                  </div>
                </form>
              </div>

              {/* Password */}
              <div style={cardStyle}>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.4rem', fontSize: '1.3rem' }}>{t('account.title')}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('account.subtitle')}</p>
                <ChangePasswordForm />
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentProfile;
