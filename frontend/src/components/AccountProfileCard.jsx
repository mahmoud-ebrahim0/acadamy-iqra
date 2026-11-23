import { useEffect, useState } from 'react';
import { fetchWithAuth, readJson } from '../utils/api';
import { updateSessionName } from '../utils/auth';
import { useLang } from '../i18n/lang';
import { lightInputStyle } from '../utils/styles';

/**
 * Personal details card (name, email, phone) for any logged-in user.
 * Changing the email asks for the current password. Used by the student profile and the instructor account page.
 */
const AccountProfileCard = () => {
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

  if (loadError) {
    return <div className="acc-card"><p className="acc-error">{loadError.startsWith('profile.') ? t(loadError) : t.server(loadError)}</p></div>;
  }
  if (!profile) {
    return <div className="acc-card"><p style={{ color: 'var(--text-muted)' }}>{t('student.loading')}</p></div>;
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long' });

  return (
    <section className="acc-card">
      {/* Identity */}
      <div className="acc-identity">
        <div className="acc-avatar" aria-hidden="true">{profile.name.trim().charAt(0).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <h3>{profile.name}</h3>
          <div className="acc-meta">
            <span className="acc-role">{t(`profile.role.${profile.role}`)}</span>
            <span>{t('profile.joined', { date: memberSince })}</span>
          </div>
        </div>
      </div>

      <div className="acc-section-title">
        <span aria-hidden="true">👤</span>
        <div>
          <h4>{t('profile.details')}</h4>
          <p>{t('profile.detailsHint')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="acc-form">
        <div className="acc-field">
          <label htmlFor="acc-name">{t('profile.name')}</label>
          <input id="acc-name" type="text" required minLength={2} maxLength={100} value={form.name} onChange={update('name')} style={lightInputStyle} autoComplete="name" />
        </div>
        <div className="acc-row">
          <div className="acc-field">
            <label htmlFor="acc-email">{t('profile.email')}</label>
            <input id="acc-email" type="email" required maxLength={254} value={form.email} onChange={update('email')} style={lightInputStyle} autoComplete="email" dir="ltr" />
          </div>
          <div className="acc-field">
            <label htmlFor="acc-phone">{t('profile.phone')}</label>
            <input id="acc-phone" type="tel" maxLength={30} value={form.phone} onChange={update('phone')} style={lightInputStyle} autoComplete="tel" dir="ltr" placeholder="+20 10 0000 0000" />
          </div>
        </div>
        {emailChanged && (
          <div className="acc-field acc-highlight">
            <label htmlFor="acc-current-password">{t('profile.passwordForEmail')}</label>
            <input id="acc-current-password" type="password" required value={form.currentPassword} onChange={update('currentPassword')} style={lightInputStyle} autoComplete="current-password" />
          </div>
        )}

        <div className="acc-footer">
          {status.message && <span className={`acc-status ${status.type}`}>{status.message}</span>}
          <span style={{ flex: 1 }} />
          <button type="submit" className="sched-btn sched-btn-primary" disabled={saving || !isDirty}>
            {saving ? t('account.saving') : t('profile.save')}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AccountProfileCard;
