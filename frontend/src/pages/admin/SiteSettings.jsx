import { useEffect, useState } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';
import { refreshSiteSettings } from '../../utils/useSiteSettings';

// Field groups shown on the page: [field, input type, placeholder].
const GROUPS = [
  { key: 'contact', icon: '📞', fields: [['whatsapp', 'tel', '+20 1xx xxx xxxx'], ['phone', 'tel', '+20 1xx xxx xxxx'], ['email', 'email', 'info@example.com']] },
  { key: 'payment', icon: '💳', fields: [['vodafoneCash', 'tel', '01xxxxxxxxx'], ['instapay', 'text', 'name@instapay']] },
  { key: 'social', icon: '🌐', fields: [['facebook', 'url', 'https://facebook.com/…'], ['instagram', 'url', 'https://instagram.com/…'], ['youtube', 'url', 'https://youtube.com/@…'], ['tiktok', 'url', 'https://tiktok.com/@…']] },
];

/** Admin: contact numbers, payment accounts and social links shown on the website. */
const SiteSettings = () => {
  const { t } = useAdminLang();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchWithAuth('/api/admin/settings')
      .then(async res => {
        const data = await readJson(res);
        if (!res.ok) throw new Error(data.message);
        setForm(data);
        setSaved(data);
      })
      .catch(() => setMessage({ type: 'error', text: t('settings.loadError') }));
  }, [t]);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const dirty = form && saved && Object.keys(form).some(k => (form[k] || '') !== (saved[k] || ''));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetchWithAuth('/api/admin/settings', { method: 'PUT', body: JSON.stringify(form) });
      const data = await readJson(res);
      if (!res.ok) { setMessage({ type: 'error', text: t.server(data.message) || t('settings.saveError') }); return; }
      setForm(data);
      setSaved(data);
      refreshSiteSettings(data);
      setMessage({ type: 'success', text: t('settings.saved') });
      setTimeout(() => setMessage(m => (m.type === 'success' ? { type: '', text: '' } : m)), 3500);
    } catch {
      setMessage({ type: 'error', text: t('common.networkError') });
    } finally {
      setSaving(false);
    }
  };

  const missingPayment = saved && (!saved.vodafoneCash || !saved.instapay);

  return (
    <div className="ov-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('settings.title')}</h1>
          <p className="page-sub">{t('settings.subtitle')}</p>
        </div>
      </header>

      {missingPayment && <div className="set-warning">⚠️ {t('settings.missingPayment')}</div>}
      {message.text && <div className={`crs-flash ${message.type}`}>{message.text}</div>}

      {!form ? (
        !message.text && <p className="ov-empty">{t('settings.loading')}</p>
      ) : (
        <form onSubmit={save} className="set-form">
          {GROUPS.map(group => (
            <section key={group.key} className="set-card">
              <header>
                <span aria-hidden="true">{group.icon}</span>
                <div>
                  <h3>{t(`settings.group.${group.key}`)}</h3>
                  <p>{t(`settings.group.${group.key}Hint`)}</p>
                </div>
              </header>
              <div className="set-fields">
                {group.fields.map(([field, type, placeholder]) => (
                  <div key={field} className="acc-field">
                    <label htmlFor={`set-${field}`}>{t(`settings.field.${field}`)}</label>
                    <input
                      id={`set-${field}`}
                      type={type}
                      dir="ltr"
                      className="form-control"
                      value={form[field] || ''}
                      onChange={update(field)}
                      placeholder={placeholder}
                      maxLength={type === 'url' ? 300 : 120}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="set-save">
            <span>{dirty ? t('settings.unsaved') : ''}</span>
            <button type="submit" className="sched-btn sched-btn-primary" disabled={saving || !dirty}>
              {saving ? t('common.saving') : `💾 ${t('settings.save')}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SiteSettings;
