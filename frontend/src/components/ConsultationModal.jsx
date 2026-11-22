import { useState } from 'react';
import { API_URL, readJson } from '../utils/api';
import { useLang } from '../i18n/lang';

const ConsultationModal = ({ isOpen, onClose }) => {
  const { t } = useLang();
  const [formData, setFormData] = useState({ name: '', age: '', whatsapp: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/client/consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await readJson(res);

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setFormData({ name: '', age: '', whatsapp: '' });
        }, 3000);
      } else {
        setError(t.server(data.message) || t('consult.failed'));
      }
    } catch {
      setError(t('consult.connection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
            <h3 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', marginBottom: '1rem' }}>{t('consult.sentTitle')}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t('consult.sentText')}</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-color)', textAlign: 'center' }}>{t('consult.title')}</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>{t('consult.subtitle')}</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('consult.name')}</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder={t('consult.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('consult.age')}</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  placeholder={t('consult.agePlaceholder')}
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">{t('consult.whatsapp')}</label>
                <input
                  type="tel"
                  dir="ltr"
                  className="form-control"
                  required
                  placeholder="+20 100 000 0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
              {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
              <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', fontSize: '1.2rem', padding: '0.8rem' }}>
                {loading ? t('consult.sending') : t('consult.submit')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsultationModal;
