import { useEffect, useRef, useState } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useLang } from '../../i18n/lang';
import { lightInputStyle } from '../../utils/styles';
import { instructorImage } from '../../utils/instructorProfile';

const BIO_MAX = 600;

/**
 * Instructor's public profile: photo + short bio (Arabic / English), shown on the website's instructors section.
 */
const PublicProfileCard = () => {
  const { t } = useLang();
  const fileInput = useRef(null);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState({ bioAr: '', bioEn: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchWithAuth('/api/instructor/profile')
      .then(async res => {
        const data = await readJson(res);
        if (!res.ok) { setStatus({ type: 'error', message: t.server(data.message) || t('instructor.pub.loadError') }); return; }
        setProfile(data);
        setBio({ bioAr: data.bioAr || '', bioEn: data.bioEn || '' });
      })
      .catch(() => setStatus({ type: 'error', message: t('account.connection') }));
  }, [t]);

  const applyProfile = (data) => {
    setProfile(data);
    setBio({ bioAr: data.bioAr || '', bioEn: data.bioEn || '' });
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    setStatus({ type: '', message: '' });
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetchWithAuth('/api/instructor/photo', { method: 'POST', body: formData });
      const data = await readJson(res);
      if (!res.ok) { setStatus({ type: 'error', message: t.server(data.message) || t('instructor.pub.photoFailed') }); return; }
      setProfile(prev => ({ ...prev, photoUrl: data.photoUrl }));
      setStatus({ type: 'success', message: t('instructor.pub.photoSaved') });
    } catch {
      setStatus({ type: 'error', message: t('account.connection') });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!window.confirm(t('instructor.pub.removeConfirm'))) return;
    try {
      const res = await fetchWithAuth('/api/instructor/photo', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProfile(prev => ({ ...prev, photoUrl: '' }));
      setStatus({ type: 'success', message: t('instructor.pub.photoRemoved') });
    } catch {
      setStatus({ type: 'error', message: t('instructor.saveFailed') });
    }
  };

  const saveBio = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetchWithAuth('/api/instructor/profile', { method: 'PUT', body: JSON.stringify(bio) });
      const data = await readJson(res);
      if (!res.ok) { setStatus({ type: 'error', message: t.server(data.message) || t('instructor.saveFailed') }); return; }
      applyProfile(data);
      setStatus({ type: 'success', message: t('instructor.pub.bioSaved') });
    } catch {
      setStatus({ type: 'error', message: t('account.connection') });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <section className="acc-card pub-card">{status.message ? <p className="acc-error">{status.message}</p> : <p style={{ color: 'var(--text-muted)' }}>{t('student.loading')}</p>}</section>;
  }

  const bioDirty = bio.bioAr !== (profile.bioAr || '') || bio.bioEn !== (profile.bioEn || '');

  return (
    <section className="acc-card pub-card">
      <div className="acc-section-title">
        <span aria-hidden="true">🌐</span>
        <div>
          <h4>{t('instructor.pub.title')}</h4>
          <p>{t('instructor.pub.subtitle')}</p>
        </div>
      </div>

      <div className="pub-layout">
        {/* Photo */}
        <div className="pub-photo">
          <img src={instructorImage(profile)} alt={profile.name} className={profile.photoUrl ? '' : 'default'} />
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { uploadPhoto(e.target.files[0]); e.target.value = ''; }} />
          <div className="pub-photo-actions">
            <button type="button" className="sched-btn sched-btn-primary" disabled={uploading} onClick={() => fileInput.current?.click()}>
              {uploading ? t('instructor.pub.uploading') : profile.photoUrl ? t('instructor.pub.change') : t('instructor.pub.upload')}
            </button>
            {profile.photoUrl && (
              <button type="button" className="sched-btn sched-btn-danger" onClick={removePhoto}>{t('instructor.pub.remove')}</button>
            )}
          </div>
          <small className="acc-hint">{profile.photoUrl ? t('instructor.pub.photoHint') : t('instructor.pub.defaultHint')}</small>
        </div>

        {/* Bio */}
        <form className="acc-form pub-bio" onSubmit={saveBio}>
          <div className="acc-field">
            <label htmlFor="bio-ar">{t('instructor.pub.bioAr')}</label>
            <textarea id="bio-ar" dir="rtl" rows={3} maxLength={BIO_MAX} value={bio.bioAr} onChange={e => { setBio({ ...bio, bioAr: e.target.value }); setStatus({ type: '', message: '' }); }} placeholder={t('instructor.pub.bioArPh')} style={{ ...lightInputStyle, resize: 'vertical' }} />
            <small className="acc-hint">{bio.bioAr.length}/{BIO_MAX}</small>
          </div>
          <div className="acc-field">
            <label htmlFor="bio-en">{t('instructor.pub.bioEn')}</label>
            <textarea id="bio-en" dir="ltr" rows={3} maxLength={BIO_MAX} value={bio.bioEn} onChange={e => { setBio({ ...bio, bioEn: e.target.value }); setStatus({ type: '', message: '' }); }} placeholder="e.g. Al-Azhar graduate with an Ijazah in Hafs, 10 years of teaching children and adults." style={{ ...lightInputStyle, resize: 'vertical' }} />
            <small className="acc-hint">{bio.bioEn.length}/{BIO_MAX}</small>
          </div>
          <div className="acc-footer">
            {status.message && <span className={`acc-status ${status.type}`}>{status.message}</span>}
            <span style={{ flex: 1 }} />
            <button type="submit" className="sched-btn sched-btn-primary" disabled={saving || !bioDirty}>
              {saving ? t('account.saving') : t('instructor.pub.saveBio')}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default PublicProfileCard;
