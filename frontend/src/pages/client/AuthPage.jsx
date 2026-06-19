import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = isLogin 
        ? 'https://acadamy-iqra-production.up.railway.app/api/client/login'
        : 'https://acadamy-iqra-production.up.railway.app/api/client/register';
      
      const payload = isLogin ? { email, password } : { name, email, password };

      // Make actual request to our MongoDB-backed Express Server
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        // Save unified user details if provided
        if (data.user?.name) {
          localStorage.setItem('userName', data.user.name);
          localStorage.setItem('userId', data.user._id);
        }

        // Currently, our User model might not send a specific role if not populated deeply, 
        // but we assume if it works, and it's admin@admin.com it's admin for the demo.
        // Or if the backend returns a role, we use it. 
        const role = data.user?.role || (email.trim().toLowerCase() === 'admin@admin.com' ? 'admin' : 'student');

        if (role === 'admin') {
          localStorage.setItem('adminToken', data.token);
          window.location.href = '/admin';
        } else if (role === 'instructor') {
          localStorage.setItem('userToken', data.token);
          window.location.href = '/instructor';
        } else {
          localStorage.setItem('userToken', data.token);
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection to backend lost. Make sure MongoDB and Server are running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)' }}>

      <div style={{ position: 'relative', zIndex: 10, background: 'var(--card-bg)', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/home" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            Tarteel Academy
          </Link>
          <h2 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', fontFamily: 'var(--font-heading)' }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '0.8rem', marginBottom: '1.5rem', textAlign: 'center', textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-color)' }}>Full Name</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Ahmed Ali" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-color)' }}>Email Address</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@example.com" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ color: 'var(--text-color)' }}>Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
          </div>
          
          <button type="submit" className="btn btn-accent" disabled={loading} style={{ width: '100%', fontSize: '1.2rem', padding: '0.8rem', borderRadius: '50px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}>
            {loading ? 'Processing...' : (isLogin ? 'Login to Dashboard' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account?" : "Already studying with us?"}
            <button onClick={toggleAuthMode} type="button" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', marginLeft: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
          <Link to="/home" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginTop: '1.5rem', fontSize: '0.9rem' }}>&larr; Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
