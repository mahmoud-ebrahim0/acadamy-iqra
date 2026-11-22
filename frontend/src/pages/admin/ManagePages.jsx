import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';
import { pagesContent } from '../../i18n/pagesContent';
import { homeContent, HOME_SECTIONS } from '../../i18n/homeContent';
import { lightInputStyle } from '../../utils/styles';

const FOOTER_PAGES = ['about', 'terms', 'privacy', 'refund'];
const LANGS = ['ar', 'en'];

// Copy of the built-in text for a page, used until the admin saves their own.
const defaultContent = (slug) => {
  const source = HOME_SECTIONS.includes(slug) ? homeContent : pagesContent;
  return { en: structuredClone(source.en[slug]), ar: structuredClone(source.ar[slug]) };
};

const labelStyle = { display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-color)' };
const pill = (active) => ({
  padding: '0.55rem 1.2rem', borderRadius: '999px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
  border: '1px solid var(--primary-color)',
  background: active ? 'var(--primary-color)' : 'transparent',
  color: active ? '#fff' : 'var(--primary-color)',
});
const iconButton = { background: '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '0.5rem', padding: '0.35rem 0.7rem', cursor: 'pointer', fontFamily: 'inherit' };

/**
 * Admin editor for the website content in Arabic and English:
 * the footer pages (About, Terms, Privacy, Refund) and the home page sections (FAQ, Stars of Tarteel, Testimonials).
 */
const ManagePages = () => {
  const { t, lang: uiLang } = useAdminLang();
  const [slug, setSlug] = useState('about');
  const [editLang, setEditLang] = useState('ar');
  const [content, setContent] = useState(null); // { en, ar }
  const [saved, setSaved] = useState(null);     // JSON of the last saved/loaded content (to detect changes)
  const [meta, setMeta] = useState({ isDefault: false, updatedAt: null });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const loadPage = useCallback(async (pageSlug) => {
    setContent(null);
    setStatus({ type: '', message: '' });
    let next;
    let info = { isDefault: true, updatedAt: null };
    try {
      const res = await fetchWithAuth(`/api/admin/pages/${pageSlug}`);
      if (res.ok) {
        const data = await readJson(res);
        next = { en: data.en, ar: data.ar };
        info = { isDefault: false, updatedAt: data.updatedAt };
      }
    } catch (err) {
      console.error('Failed to load page:', err);
    }
    next = next || defaultContent(pageSlug);
    setContent(next);
    setSaved(JSON.stringify(next));
    setMeta(info);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API when the page changes
    loadPage(slug);
  }, [slug, loadPage]);

  const isDirty = content && saved !== JSON.stringify(content);

  const switchPage = (next) => {
    if (next === slug) return;
    if (isDirty && !window.confirm(t('pages.leaveConfirm'))) return;
    setSlug(next);
  };

  // --- editing helpers ---
  // Text is edited per language. For Stars of Tarteel the list of students (order, photos, add/remove)
  // is shared by both languages, so those changes are applied to Arabic and English together.
  const current = content?.[editLang];
  const hasPhotos = slug === 'stars';
  const setLangContent = (updater, bothLanguages = false) => {
    setContent(prev => {
      const next = { ...prev };
      for (const l of bothLanguages ? LANGS : [editLang]) next[l] = updater(prev[l]);
      return next;
    });
    setStatus({ type: '', message: '' });
  };
  const setField = (field, value) => setLangContent(c => ({ ...c, [field]: value }));
  const setSection = (index, field, value) =>
    setLangContent(c => ({ ...c, sections: c.sections.map((s, i) => (i === index ? { ...s, [field]: value } : s)) }));
  const addSection = () => setLangContent(c => ({ ...c, sections: [...c.sections, { heading: '', text: '' }] }), hasPhotos);
  const removeSection = (index) => {
    if (!window.confirm(t('pages.confirmRemove'))) return;
    setLangContent(c => ({ ...c, sections: c.sections.filter((_, i) => i !== index) }), hasPhotos);
  };
  const moveSection = (index, delta) => setLangContent(c => {
    const sections = [...c.sections];
    const target = index + delta;
    if (target < 0 || target >= sections.length) return c;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    return { ...c, sections };
  }, hasPhotos);
  const setImage = (index, image) => setLangContent(c => ({
    ...c,
    sections: c.sections.map((s, i) => {
      if (i !== index) return s;
      const next = { ...s };
      if (image) next.image = image;
      else delete next.image;
      return next;
    }),
  }), true);

  const uploadImage = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    setStatus({ type: '', message: '' });
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetchWithAuth('/api/admin/uploads/image', { method: 'POST', body: formData });
      const data = await readJson(res);
      if (res.ok) setImage(index, data.url);
      else setStatus({ type: 'error', message: t.server(data.message) || t('pages.photoFailed') });
    } catch {
      setStatus({ type: 'error', message: t('common.networkError') });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetchWithAuth(`/api/admin/pages/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(content),
      });
      const data = await readJson(res);
      if (res.ok) {
        const next = { en: data.en, ar: data.ar };
        setContent(next);
        setSaved(JSON.stringify(next));
        setMeta({ isDefault: false, updatedAt: data.updatedAt });
        setStatus({ type: 'success', message: t('pages.saved') });
      } else {
        setStatus({ type: 'error', message: t.server(data.message) || t('pages.saveFailed') });
      }
    } catch {
      setStatus({ type: 'error', message: t('common.networkError') });
    } finally {
      setSaving(false);
    }
  };

  const textDir = editLang === 'ar' ? 'rtl' : 'ltr';
  // Home sections use their own labels (e.g. Question / Answer instead of Section Heading / Section Text).
  const isHome = HOME_SECTIONS.includes(slug);
  const label = (key) => t(isHome ? `pages.home.${slug}.${key}` : `pages.${key}`);

  return (
    <div>
      <div className="admin-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>{t('pages.title')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{t('pages.subtitle')}</p>
        </div>
        <a href={isHome ? '/home' : `/${slug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 700, textDecoration: 'none' }}>
          {isHome ? t('pages.viewHome') : t('pages.view')}
        </a>
      </div>

      {/* Which page / home section */}
      {[['pages.group.footer', FOOTER_PAGES], ['pages.group.home', HOME_SECTIONS]].map(([groupKey, slugs]) => (
        <div key={groupKey} style={{ marginBottom: '1.2rem' }}>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t(groupKey)}</div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {slugs.map(p => (
              <button key={p} type="button" onClick={() => switchPage(p)} style={pill(slug === p)}>{t(`pages.page.${p}`)}</button>
            ))}
          </div>
        </div>
      ))}

      {!content ? (
        <p style={{ color: 'var(--text-muted)' }}>{t('pages.loading')}</p>
      ) : (
        <div style={{ background: 'var(--card-bg)', borderRadius: '1.25rem', padding: '2rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          {/* Status of this page */}
          <p style={{ marginBottom: '1.5rem', color: meta.isDefault ? '#b45309' : 'var(--text-muted)', fontSize: '0.95rem' }}>
            {meta.isDefault
              ? t(isHome ? 'pages.defaultHome' : 'pages.default')
              : t('pages.lastSaved', { date: new Date(meta.updatedAt).toLocaleString(uiLang === 'ar' ? 'ar-EG' : 'en-GB') })}
          </p>

          {/* Which language */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.8rem', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '1rem' }}>
            {LANGS.map(l => (
              <button key={l} type="button" onClick={() => setEditLang(l)} style={pill(editLang === l)}>{t(`pages.lang.${l}`)}</button>
            ))}
          </div>

          {hasPhotos && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '-0.8rem', marginBottom: '1.2rem' }}>{t('pages.photoShared')}</p>}
          <div dir={textDir}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={labelStyle}>{t(isHome ? 'pages.home.title' : 'pages.pageTitle')}</label>
              <input type="text" maxLength={150} value={current.title} onChange={e => setField('title', e.target.value)} style={lightInputStyle} />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>{t(isHome ? 'pages.home.intro' : 'pages.intro')}</label>
              <textarea rows={3} maxLength={1000} value={current.intro} onChange={e => setField('intro', e.target.value)} style={{ ...lightInputStyle, resize: 'vertical' }} />
            </div>

            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>{label('sections')}</h3>
            {current.sections.length === 0 && (
              <p style={{ color: '#b45309', marginBottom: '1rem' }}>{t(isHome ? 'pages.home.emptyHidden' : 'pages.emptySections')}</p>
            )}
            {current.sections.map((section, index) => (
              <div key={index} style={{ border: '1px solid rgba(0,0,0,0.1)', borderInlineStart: '4px solid var(--accent-color)', borderRadius: '0.8rem', padding: '1.2rem', marginBottom: '1rem', background: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '0.5rem' }}>
                  <strong style={{ color: 'var(--text-muted)' }}>#{index + 1}</strong>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button type="button" title={t('pages.moveUp')} aria-label={t('pages.moveUp')} disabled={index === 0} onClick={() => moveSection(index, -1)} style={iconButton}>↑</button>
                    <button type="button" title={t('pages.moveDown')} aria-label={t('pages.moveDown')} disabled={index === current.sections.length - 1} onClick={() => moveSection(index, 1)} style={iconButton}>↓</button>
                    <button type="button" title={t('pages.removeSection')} aria-label={t('pages.removeSection')} onClick={() => removeSection(index)} style={{ ...iconButton, color: '#dc2626', borderColor: 'rgba(220,38,38,0.4)' }}>🗑</button>
                  </div>
                </div>
                {hasPhotos && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <img
                      src={section.image || (index % 2 === 0 ? '/sheikh.png' : '/niqab.png')}
                      alt=""
                      style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-color)', opacity: section.image ? 1 : 0.5 }}
                    />
                    <label className="btn btn-outline" style={{ cursor: uploadingIndex === index ? 'wait' : 'pointer', padding: '0.5rem 1.1rem', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                      {uploadingIndex === index ? t('pages.photoUploading') : section.image ? t('pages.photoChange') : t('pages.photoUpload')}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        disabled={uploadingIndex !== null}
                        onChange={e => { uploadImage(index, e.target.files[0]); e.target.value = ''; }}
                      />
                    </label>
                    {section.image && (
                      <button type="button" onClick={() => setImage(index, '')} style={{ ...iconButton, color: '#dc2626' }}>{t('pages.photoRemove')}</button>
                    )}
                    {!section.image && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('pages.photoDefault')}</span>}
                  </div>
                )}
                <label style={labelStyle}>{label('sectionHeading')}</label>
                <input type="text" maxLength={150} value={section.heading} onChange={e => setSection(index, 'heading', e.target.value)} style={{ ...lightInputStyle, marginBottom: '0.8rem' }} />
                <label style={labelStyle}>{label('sectionText')}</label>
                <textarea rows={4} maxLength={5000} value={section.text} onChange={e => setSection(index, 'text', e.target.value)} style={{ ...lightInputStyle, resize: 'vertical' }} />
              </div>
            ))}
            <button type="button" onClick={addSection} disabled={current.sections.length >= 20} className="btn btn-outline" style={{ borderStyle: 'dashed', borderColor: 'var(--primary-color)', color: 'var(--primary-color)', width: '100%', padding: '0.8rem' }}>
              {label('addSection')}
            </button>
          </div>

          {/* Save bar */}
          <div style={{ position: 'sticky', bottom: 0, background: 'var(--card-bg)', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleSave} disabled={saving || !isDirty} className="btn" style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '0.85rem 2.2rem', borderRadius: '999px', fontSize: '1.05rem', opacity: saving || !isDirty ? 0.6 : 1 }}>
              {saving ? t('pages.saving') : t('pages.saveContent')}
            </button>
            {isDirty && !status.message && <span style={{ color: '#b45309' }}>{t('pages.unsaved')}</span>}
            {status.message && (
              <span style={{ color: status.type === 'success' ? '#047857' : '#b91c1c', fontWeight: 600 }}>{status.message}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePages;
