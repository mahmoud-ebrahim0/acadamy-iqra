import { useState } from 'react';
import { fetchWithAuth, readJson } from '../utils/api';
import { saveSession } from '../utils/auth';
import { useLang } from '../i18n/lang';
import { lightInputStyle } from '../utils/styles';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };
const MIN_LENGTH = 8;

/** 0–4: length, upper+lower case, digits and symbols each add a point. */
const passwordStrength = (value) => {
  if (!value) return 0;
  let score = value.length >= MIN_LENGTH ? 1 : 0;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
};
const STRENGTH_KEYS = ['weak', 'weak', 'fair', 'good', 'strong'];

/** Password input with a show/hide button. */
const PasswordInput = ({ id, value, onChange, autoComplete, minLength, showLabel, hideLabel }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="pw-input">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        style={lightInputStyle}
        dir="ltr"
      />
      <button type="button" onClick={() => setVisible(v => !v)} aria-label={visible ? hideLabel : showLabel} title={visible ? hideLabel : showLabel}>
        {visible ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        )}
      </button>
    </div>
  );
};

/** Lets any logged-in user change their password. Used by the student profile and the instructor account page. */
const ChangePasswordForm = () => {
  const { t } = useLang();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setStatus({ type: '', message: '' });
  };

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

  const strength = passwordStrength(form.newPassword);
  const strengthKey = STRENGTH_KEYS[strength];
  const confirmState = !form.confirmPassword ? '' : form.confirmPassword === form.newPassword ? 'match' : 'mismatch';
  const inputProps = { showLabel: t('account.show'), hideLabel: t('account.hide') };

  return (
    <form onSubmit={handleSubmit} className="acc-form">
      <div className="acc-field">
        <label htmlFor="pw-current">{t('account.current')}</label>
        <PasswordInput id="pw-current" value={form.currentPassword} onChange={update('currentPassword')} autoComplete="current-password" {...inputProps} />
      </div>

      <div className="acc-row">
        <div className="acc-field">
          <label htmlFor="pw-new">{t('account.new')}</label>
          <PasswordInput id="pw-new" value={form.newPassword} onChange={update('newPassword')} autoComplete="new-password" minLength={MIN_LENGTH} {...inputProps} />
          {form.newPassword ? (
            <div className={`pw-strength s${strength}`}>
              <div className="pw-bars" aria-hidden="true"><i /><i /><i /><i /></div>
              <span>{t(`account.strength.${strengthKey}`)}</span>
            </div>
          ) : (
            <small className="acc-hint">{t('account.hint')}</small>
          )}
        </div>
        <div className="acc-field">
          <label htmlFor="pw-confirm">{t('account.confirm')}</label>
          <PasswordInput id="pw-confirm" value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" minLength={MIN_LENGTH} {...inputProps} />
          {confirmState && (
            <small className={`pw-confirm ${confirmState}`}>{t(confirmState === 'match' ? 'account.match' : 'account.mismatch')}</small>
          )}
        </div>
      </div>

      <div className="acc-footer">
        {status.message && <span className={`acc-status ${status.type}`}>{status.message}</span>}
        <span style={{ flex: 1 }} />
        <button type="submit" disabled={saving} className="sched-btn sched-btn-primary">
          {saving ? t('account.saving') : t('account.save')}
        </button>
      </div>
      <p className="acc-hint" style={{ margin: 0 }}>🔐 {t('account.signoutNote')}</p>
    </form>
  );
};

export default ChangePasswordForm;
