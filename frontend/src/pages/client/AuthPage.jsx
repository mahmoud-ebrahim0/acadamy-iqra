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
        ? 'http://localhost:5000/api/client/login'
        : 'http://localhost:5000/api/client/register';
      
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
    <div className="hero-cosmic" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {/* Deep Space Background Elements */}
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      <div className="cosmic-swirl swirl-1" style={{ top: '10%', left: '20%' }}></div>
      <div className="cosmic-swirl swirl-2" style={{ bottom: '10%', right: '20%' }}></div>

      <div style={{ position: 'relative', zIndex: 10, background: 'var(--card-bg)', padding: '3rem', borderRadius: '2rem', boxShadow: '0 0 40px rgba(56, 189, 248, 0.2), inset 0 0 20px rgba(250, 204, 21, 0.1)', width: '100%', maxWidth: '450px', backdropFilter: 'blur(15px)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/home" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem', textShadow: '0 0 15px rgba(250, 204, 21, 0.5)' }}>
            <span>Iqra</span> Academy
          </Link>
          <h2 style={{ color: 'white', fontSize: '1.8rem', textShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>
            {isLogin ? 'Welcome Back 🚀' : 'Begin Your Journey ✨'}
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
              <label className="form-label" style={{ color: '#cbd5e1' }}>Full Name</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Cosmic Explorer" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(250, 204, 21, 0.3)' }} />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" style={{ color: '#cbd5e1' }}>Email Address</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="explorer@galaxy.com" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(250, 204, 21, 0.3)' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(250, 204, 21, 0.3)' }} />
          </div>
          
          <button type="submit" className="btn btn-accent" disabled={loading} style={{ width: '100%', fontSize: '1.2rem', padding: '0.8rem', textShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>
            {loading ? 'Transmitting...' : (isLogin ? 'Login to Dashboard' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account?" : "Already exploring with us?"}
            <button onClick={toggleAuthMode} type="button" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', marginLeft: '0.5rem', cursor: 'pointer', fontSize: '1rem', textShadow: '0 0 10px rgba(250, 204, 21, 0.3)' }}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
          <Link to="/home" style={{ color: '#64748b', textDecoration: 'none', display: 'block', marginTop: '1.5rem', fontSize: '0.9rem' }}>&larr; Abort and Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
