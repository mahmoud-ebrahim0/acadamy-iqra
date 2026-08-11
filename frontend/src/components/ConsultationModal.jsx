import React, { useState } from 'react';
import { API_URL } from '../utils/api';

const ConsultationModal = ({ isOpen, onClose }) => {
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
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setFormData({ name: '', age: '', whatsapp: '' });
        }, 3000);
      } else {
        setError(data.message || 'Failed to send request.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
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
            <h3 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', marginBottom: '1rem' }}>Request Sent!</h3>
            <p style={{ color: 'var(--text-muted)' }}>We will contact you via WhatsApp shortly to schedule your free evaluation.</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-color)', textAlign: 'center' }}>Free Consultation</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>Book your free evaluation session with Al-Azhar scholars.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Ahmad Abdullah"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Student Age</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  placeholder="e.g. 12"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">WhatsApp Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  required 
                  placeholder="+20 100 000 0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
              {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
              <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', fontSize: '1.2rem', padding: '0.8rem' }}>
                {loading ? 'Sending...' : 'Request Evaluation'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsultationModal;
