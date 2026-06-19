import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Use the client login endpoint for normal users
      const res = await fetch('https://acadamy-iqra-production.up.railway.app/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userName', data.user.name);
        // Redirect to home or dashboard after successful login
        window.location.href = '/home';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error, please try again later.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
      <div style={{ background: 'var(--card-bg)', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>Welcome Back</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%', marginBottom: '1rem' }}>Login</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-color)' }}>Sign Up</Link></p>
          <Link to="/home" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginTop: '1rem' }}>&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
