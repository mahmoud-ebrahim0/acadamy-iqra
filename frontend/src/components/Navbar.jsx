import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth state on render and route change
  const token = localStorage.getItem('userToken');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    window.location.href = '/home';
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Hide Navbar on Scroll Down, Show on Scroll Up
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setShowNavbar(false);
        } else {
          setShowNavbar(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Smooth Scroll Handler
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (location.pathname !== '/home' && location.pathname !== '/') {
      navigate('/home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // give time for route to load
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <nav className={`navbar ${showNavbar ? '' : 'navbar-hidden'}`}>
      <div className="container">
        <Link to="/home" className="nav-logo" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <span>Iqra</span> Academy
        </Link>
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>
        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li><a href="#hero" onClick={(e) => handleScrollTo(e, 'hero')}>Home</a></li>
          <li><a href="#courses" onClick={(e) => handleScrollTo(e, 'courses')}>Courses</a></li>
          <li><a href="#instructors" onClick={(e) => handleScrollTo(e, 'instructors')}>Instructors</a></li>
          <li><a href="#methodology" onClick={(e) => handleScrollTo(e, 'methodology')}>Sanad</a></li>
          <li><a href="#womens-academy" onClick={(e) => handleScrollTo(e, 'womens-academy')}>Sisters</a></li>
          <li><a href="#faq" onClick={(e) => handleScrollTo(e, 'faq')}>FAQ</a></li>
        </ul>
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }} className="nav-auth">
          <button onClick={toggleTheme} title="Toggle Daylight/Cosmic Theme" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', transition: 'transform 0.3s', transform: theme === 'light' ? 'rotate(-20deg)' : 'rotate(0)' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {token ? (
            <>
              <Link to="/dashboard" style={{ color: 'var(--primary-color)', textShadow: '0 0 10px rgba(250,204,21,0.5)', fontWeight: 'bold', textDecoration: 'none' }}>Hi, {userName?.split(' ')[0]}</Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)', padding: '0.4rem 1rem' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
              <Link to="/signup" className="btn btn-accent login-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
