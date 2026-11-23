import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';

const EMPTY_FORM = { _id: null, title: '', level: '', description: '', price: '', imageUrl: '', newImage: null, previewUrl: '', removeImage: false };
const money = (value) => `$${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/** Admin: courses as cards with their numbers; add / edit in one dialog; hide from the website or delete. */
const ManageCourses = () => {
  const { t } = useAdminLang();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add / edit dialog
  const [form, setForm] = useState(null); // null = closed
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/admin/courses');
      const data = await readJson(res);
      if (Array.isArray(data)) setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API on mount
    load();
  }, [load]);

  // Pick a new cover image and show a local preview of it.
  const chooseImage = (file) => {
    if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    setForm({ ...form, newImage: file || null, previewUrl: file ? URL.createObjectURL(file) : '', removeImage: false });
  };
  const clearImage = () => {
    if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    setForm({ ...form, newImage: null, previewUrl: '', removeImage: true });
  };

  const flash = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const openAdd = () => { setFormError(''); setForm({ ...EMPTY_FORM }); };
  const openEdit = (course) => { setFormError(''); setForm({ ...EMPTY_FORM, ...course, price: String(course.price ?? '') }); };
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('level', form.level);
    data.append('description', form.description);
    data.append('price', form.price);
    if (!form._id) data.append('icon', '📖');
    if (form.newImage) data.append('image', form.newImage);
    else if (form._id && form.removeImage) data.append('removeImage', 'true');

    setSaving(true);
    setFormError('');
    try {
      const res = await fetchWithAuth(form._id ? `/api/admin/courses/${form._id}` : '/api/admin/courses', {
        method: form._id ? 'PUT' : 'POST',
        body: data,
      });
      const body = await readJson(res);
      if (!res.ok) { setFormError(t.server(body.message) || t(form._id ? 'courses.updateFailed' : 'courses.createFailed')); return; }
      flash('success', t(form._id ? 'courses.updated' : 'courses.created'));
      setForm(null);
      load();
    } catch {
      setFormError(t('common.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (course) => {
    try {
      const data = new FormData();
      data.append('published', String(!(course.published !== false)));
      const res = await fetchWithAuth(`/api/admin/courses/${course._id}`, { method: 'PUT', body: data });
      if (!res.ok) throw new Error();
      flash('success', t((course.published !== false) ? 'courses.hidden' : 'courses.shown', { title: course.title }));
      load();
    } catch {
      flash('error', t('courses.updateFailed'));
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(t('courses.confirmDeleteNamed', { title: course.title }))) return;
    try {
      const res = await fetchWithAuth(`/api/admin/courses/${course._id}`, { method: 'DELETE' });
      const body = await readJson(res);
      if (!res.ok) { flash('error', t.server(body.message) || t('courses.deleteFailed')); return; }
      flash('success', t('courses.deleted'));
      setCourses(prev => prev.filter(c => c._id !== course._id));
    } catch {
      flash('error', t('common.networkError'));
    }
  };

  const totals = courses.reduce((acc, c) => ({
    published: acc.published + (c.published !== false ? 1 : 0),
    students: acc.students + (c.stats?.students || 0),
    revenue: acc.revenue + (c.stats?.revenue || 0),
  }), { published: 0, students: 0, revenue: 0 });
  const formatPrice = (price) => (Number(price) > 0 ? money(price) : t('courses.free'));
  const currentImage = form && (form.previewUrl || (!form.removeImage && form.imageUrl));

  return (
    <div className="ov-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('courses.title')}</h1>
          <p className="page-sub">{t('courses.subtitle')}</p>
        </div>
        <button type="button" className="sched-btn sched-btn-primary" onClick={openAdd}>➕ {t('courses.addTitle')}</button>
      </header>

      {/* Summary */}
      <div className="crs-summary">
        <span>📚 {t('courses.sum.total', { count: courses.length })}</span>
        <span>🌐 {t('courses.sum.published', { count: totals.published })}</span>
        <span>👥 {t('courses.sum.students', { count: totals.students })}</span>
        <span>💰 {t('courses.sum.revenue', { amount: money(totals.revenue) })}</span>
      </div>

      {message.text && <div className={`crs-flash ${message.type}`}>{message.text}</div>}

      {loading ? (
        <p className="ov-empty">{t('courses.loading')}</p>
      ) : courses.length === 0 ? (
        <div className="crs-empty">
          <p>{t('courses.empty')}</p>
          <button type="button" className="sched-btn sched-btn-primary" onClick={openAdd}>➕ {t('courses.addTitle')}</button>
        </div>
      ) : (
        <div className="crs-grid">
          {courses.map(course => (
            <article key={course._id} className={`crs-card ${(course.published !== false) ? '' : 'hidden-course'}`}>
              <div className="crs-cover">
                {course.imageUrl ? <img src={course.imageUrl} alt="" /> : <span aria-hidden="true">{course.icon || '📖'}</span>}
                <span className={`crs-status ${(course.published !== false) ? 'on' : 'off'}`}>{(course.published !== false) ? t('courses.status.published') : t('courses.status.hidden')}</span>
                <span className="crs-price">{formatPrice(course.price)}</span>
              </div>
              <div className="crs-body">
                <h3>{course.title}</h3>
                <span className="crs-level">👤 {course.level}</span>
                <p className="crs-desc">{course.description}</p>
                <div className="crs-stats">
                  <div><strong>{course.stats?.students || 0}</strong><span>{t('courses.stat.students')}</span></div>
                  <div><strong>{course.stats?.active || 0}</strong><span>{t('courses.stat.active')}</span></div>
                  <div><strong>{money(course.stats?.revenue)}</strong><span>{t('courses.stat.revenue')}</span></div>
                </div>
              </div>
              <div className="crs-actions">
                <button type="button" className="sched-btn sched-btn-ghost" onClick={() => openEdit(course)}>✏️ {t('common.edit')}</button>
                <button type="button" className="sched-btn sched-btn-ghost" onClick={() => togglePublished(course)}>
                  {(course.published !== false) ? `🙈 ${t('courses.hide')}` : `👁️ ${t('courses.show')}`}
                </button>
                <span style={{ flex: 1 }} />
                <button type="button" className="ov-icon-btn danger" onClick={() => handleDelete(course)} title={t('common.delete')} aria-label={t('common.delete')}>🗑</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / edit dialog */}
      {form && (
        <div className="sched-overlay" onClick={e => { if (e.target === e.currentTarget) setForm(null); }}>
          <form className="sched-modal" style={{ maxWidth: '760px' }} onSubmit={handleSave} role="dialog" aria-modal="true" aria-labelledby="crs-form-title">
            <div className="sched-header">
              <div className="sched-header-icon" aria-hidden="true">📚</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 id="crs-form-title">{form._id ? t('courses.editTitle') : t('courses.addTitle')}</h2>
                <p>{form._id ? form.title : t('courses.addHint')}</p>
              </div>
              <button type="button" className="sched-close" onClick={() => setForm(null)} aria-label={t('common.cancel')}>✕</button>
            </div>

            <div className="sched-body">
              <div className="crs-form">
                <div className="crs-form-fields">
                  <div className="acc-field">
                    <label htmlFor="crs-title">{t('courses.courseTitle')}</label>
                    <input id="crs-title" required maxLength={150} className="form-control" value={form.title} onChange={update('title')} placeholder={t('courses.titlePlaceholder')} />
                  </div>
                  <div className="acc-row">
                    <div className="acc-field">
                      <label htmlFor="crs-level">{t('courses.ageGroup')}</label>
                      <input id="crs-level" required maxLength={100} className="form-control" value={form.level} onChange={update('level')} placeholder={t('courses.agePlaceholder')} />
                    </div>
                    <div className="acc-field">
                      <label htmlFor="crs-price">{t('courses.price')}</label>
                      <input id="crs-price" required type="number" min="0" step="0.01" dir="ltr" className="form-control" value={form.price} onChange={update('price')} placeholder={t('courses.pricePlaceholder')} />
                      <small className="acc-hint">{t('courses.freeHint')}</small>
                    </div>
                  </div>
                  <div className="acc-field">
                    <label htmlFor="crs-desc">{t('courses.description')}</label>
                    <textarea id="crs-desc" required rows={4} maxLength={2000} className="form-control" value={form.description} onChange={update('description')} placeholder={t('courses.descriptionPlaceholder')} style={{ resize: 'vertical' }} />
                  </div>
                </div>

                <div className="acc-field crs-image-field">
                  <label>{t('courses.image')}</label>
                  <label className={`crs-drop ${currentImage ? 'has-image' : ''}`}>
                    {currentImage ? <img src={currentImage} alt="" /> : (
                      <span className="crs-drop-empty">🖼️<br />{t('courses.imageUpload')}<small>{t('courses.imageHint')}</small></span>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { chooseImage(e.target.files[0]); e.target.value = ''; }} />
                  </label>
                  {currentImage && (
                    <button type="button" className="sched-btn sched-btn-danger" onClick={clearImage}>{t('courses.removeImage')}</button>
                  )}
                </div>
              </div>

              {formError && <p className="sched-error">{formError}</p>}
            </div>

            <div className="sched-footer">
              <span style={{ flex: 1 }} />
              <button type="button" onClick={() => setForm(null)} className="sched-btn sched-btn-ghost">{t('common.cancel')}</button>
              <button type="submit" disabled={saving} className="sched-btn sched-btn-primary">
                {saving ? t('courses.saving') : form._id ? t('common.save') : t('courses.create')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
