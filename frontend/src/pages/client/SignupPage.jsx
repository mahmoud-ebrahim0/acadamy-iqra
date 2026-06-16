import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userName', data.user.name);
        window.location.href = '/home';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server error, please try again later.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
      <div style={{ background: 'var(--card-bg)', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Create Account</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%', marginBottom: '1rem' }}>Sign Up</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Login here</Link></p>
          <Link to="/home" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'block', marginTop: '1rem' }}>&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
