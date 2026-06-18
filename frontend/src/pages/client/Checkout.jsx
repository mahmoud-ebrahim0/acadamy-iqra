import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    whatsapp: '',
    email: '',
    password: '',
    level: 'Beginner'
  });

  const [paymentMethod, setPaymentMethod] = useState('Vodafone Cash');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If someone accessed /checkout without selecting a course
  if (!course) {
    return (
      <div className="hero-cosmic" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '2rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>No Course Selected!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Please select a course to enroll.</p>
          <Link to="/home" className="btn btn-accent">Go Back to Courses</Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((paymentMethod === 'Vodafone Cash' || paymentMethod === 'InstaPay') && !screenshot) {
      setError('Please upload a screenshot of your transfer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        courseId: course._id,
        paymentMethod
      };

      const res = await fetch('http://localhost:5000/api/client/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      let data;
      try {
        const textResponse = await res.text();
        console.log("Raw Server Response:", textResponse);
        data = JSON.parse(textResponse);
      } catch (jsonErr) {
        setError('The server is returning an HTML error page. This usually means the server was NOT successfully restarted, or it crashed. Please check the backend terminal.');
        setLoading(false);
        return;
      }

      if (data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userName', data.user.name);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Checkout failed.');
      }
    } catch (err) {
      setError('Connection lost. Please make sure MongoDB and Backend Server are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-cosmic" style={{ minHeight: '100vh', padding: '4rem 1rem' }}>
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Link to="/home" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)', textDecoration: 'none', textShadow: '0 0 15px rgba(250, 204, 21, 0.5)' }}>
            Iqra Academy
          </Link>
          <h1 style={{ color: 'white', fontSize: '2.5rem', marginTop: '1rem' }}>Complete Your Enrollment</h1>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
          
          {/* Left Column: Student Information Form */}
          <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(56, 189, 248, 0.2)', backdropFilter: 'blur(15px)' }}>
            <h2 style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '1px solid rgba(56,189,248,0.2)', paddingBottom: '0.5rem' }}>1. Student Information</h2>
            
            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Full Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" placeholder="Ahmed Ali" style={{ background: 'rgba(0,0,0,0.4)' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ color: '#cbd5e1' }}>Age</label>
                <input required type="number" name="age" value={formData.age} onChange={handleInputChange} className="form-control" placeholder="25" style={{ background: 'rgba(0,0,0,0.4)' }} />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label" style={{ color: '#cbd5e1' }}>WhatsApp Number</label>
                <input required type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="form-control" placeholder="+20 10X XXX XXXX" style={{ background: 'rgba(0,0,0,0.4)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-control" placeholder="ahmed@example.com" style={{ background: 'rgba(0,0,0,0.4)' }} />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Create Password (for Dashboard Access)</label>
              <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-control" placeholder="••••••••" style={{ background: 'rgba(0,0,0,0.4)' }} />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#cbd5e1' }}>Current Quran Level</label>
              <select name="level" value={formData.level} onChange={handleInputChange} className="form-control" style={{ background: 'rgba(0,0,0,0.8)' }}>
                <option value="Beginner">Beginner (Foundation)</option>
                <option value="Memorized Some">Memorized Some Parts</option>
                <option value="Advanced">Advanced (Ijazah Track)</option>
              </select>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div style={{ background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(250, 204, 21, 0.2)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '1px solid rgba(250,204,21,0.2)', paddingBottom: '0.5rem' }}>2. Order Summary & Payment</h2>
            
            {/* Course Summary Card */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Selected Course</p>
                <h3 style={{ color: 'white', fontSize: '1.2rem' }}>{course.title}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Total Price</p>
                <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>{course.price ? `$${course.price}` : 'Free'}</h3>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ color: '#cbd5e1', marginBottom: '1rem', display: 'block' }}>Select Payment Method</label>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {['Vodafone Cash', 'InstaPay', 'Credit Card'].map(method => (
                  <button 
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1, padding: '1rem 0.5rem', borderRadius: '1rem', border: '1px solid', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold', fontSize: '0.9rem',
                      background: paymentMethod === method ? 'rgba(250, 204, 21, 0.1)' : 'rgba(0,0,0,0.3)',
                      borderColor: paymentMethod === method ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                      color: paymentMethod === method ? 'var(--primary-color)' : '#94a3b8',
                      boxShadow: paymentMethod === method ? '0 0 15px rgba(250,204,21,0.2)' : 'none'
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Payment Details */}
            {(paymentMethod === 'Vodafone Cash' || paymentMethod === 'InstaPay') && (
              <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed rgba(56, 189, 248, 0.3)', marginBottom: '2rem' }}>
                <p style={{ color: '#cbd5e1', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  Please transfer <strong style={{ color: 'var(--primary-color)' }}>{course.price ? `$${course.price}` : 'Free'}</strong> to the following {paymentMethod} account:
                </p>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '0.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1.5rem', color: 'white', letterSpacing: '2px', fontFamily: 'monospace' }}>
                    {paymentMethod === 'Vodafone Cash' ? '01012345678' : 'iqra_academy@instapay'}
                  </span>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Upload Transfer Screenshot</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    style={{ 
                      width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', borderRadius: '0.5rem', color: 'var(--text-muted)',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} 
                  />
                  {screenshot && <p style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginTop: '0.5rem' }}>File selected: {screenshot.name}</p>}
                </div>
              </div>
            )}

            {paymentMethod === 'Credit Card' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                <p style={{ color: '#cbd5e1', textAlign: 'center' }}>You will be redirected to the secure Stripe payment gateway after clicking Confirm.</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', marginTop: 'auto', textShadow: '0 0 10px rgba(56,189,248,0.5)', boxShadow: '0 10px 30px rgba(56, 189, 248, 0.2)' }}>
              {loading ? 'Processing Enrollment...' : 'Confirm Payment & Start Journey ✨'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
