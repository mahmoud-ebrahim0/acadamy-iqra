import { useState } from 'react';
import { fetchWithAuth, readJson } from '../utils/api';
import { saveSession } from '../utils/auth';
import { useLang } from '../i18n/lang';
import { lightInputStyle } from '../utils/styles';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** Lets any logged-in user change their password. Used by the student and instructor dashboards. */
const ChangePasswordForm = () => {
  const { t } = useLang();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: t('account.mismatch') });
      return;
    }

    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetchWithAuth('/api/account/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await readJson(res);
      if (res.ok && data.success) {
        // Old tokens stop working after a password change, so keep the fresh one.
        saveSession(data.token, data.user);
        setForm(EMPTY);
        setStatus({ type: 'success', message: t('account.success') });
      } else {
        setStatus({ type: 'error', message: t.server(data.message) || t('account.failed') });
      }
    } catch {
      setStatus({ type: 'error', message: t('account.connection') });
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, autoComplete, hint) => (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-color)' }}>{label}</label>
      <input
        type="password"
        required
        minLength={name === 'currentPassword' ? undefined : 8}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={update(name)}
        style={lightInputStyle}
      />
      {hint && <small style={{ color: 'var(--text-muted)' }}>{hint}</small>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '460px' }}>
      {field('currentPassword', t('account.current'), 'current-password')}
      {field('newPassword', t('account.new'), 'new-password', t('account.hint'))}
      {field('confirmPassword', t('account.confirm'), 'new-password')}

      {status.message && (
        <p style={{
          marginBottom: '1rem', padding: '0.8rem 1rem', borderRadius: '0.6rem',
          background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: status.type === 'success' ? '#047857' : '#b91c1c',
        }}>
          {status.message}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn btn-accent" style={{ padding: '0.8rem 2rem', borderRadius: '50px', background: 'var(--primary-color)', color: '#fff', border: 'none' }}>
        {saving ? t('account.saving') : t('account.save')}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
