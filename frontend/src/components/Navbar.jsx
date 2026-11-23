import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { clearSession, dashboardPathFor, getRole, getToken, getUserName, SESSION_EVENT } from '../utils/auth';
import { useLang } from '../i18n/lang';
import LangToggle from './LangToggle';

import logo from '../assets/tarteel-logo-maroon.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth state on render and route change
  const { t, lang } = useLang();
  const token = getToken();
  const userName = getUserName();
  // Inside the student area the menu shows the student's own pages instead of the home page sections.
  // Logged-in students see links to their portal instead of the marketing sections (e.g. on checkout).
  const studentArea = Boolean(token) && getRole() === 'student';

  // Re-render when the name changes (e.g. after editing the profile).
  const [, setSessionVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setSessionVersion(v => v + 1);
    window.addEventListener(SESSION_EVENT, refresh);
    return () => window.removeEventListener(SESSION_EVENT, refresh);
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/home';
  };

  // Close mobile menu on route change (adjusting state during render, as React recommends).
  const [menuPath, setMenuPath] = useState(location.pathname);
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setIsOpen(false);
  }

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



  const dashboardLink = dashboardPathFor(getRole());

  return (
    <nav className={`navbar ${showNavbar ? '' : 'navbar-hidden'}`}>
      <div className="container">
        <Link to="/home" className="nav-logo" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={{ gap: '10px' }}>
          <img src={logo} alt="Tarteel Academy Logo" style={{ height: '40px', width: 'auto', borderRadius: '5px' }} />
          {lang === 'ar'
            ? <>{t('nav.brandRest')} <span>{t('nav.brandHighlight')}</span></>
            : <><span>{t('nav.brandHighlight')}</span> {t('nav.brandRest')}</>}
        </Link>
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>
        {studentArea ? (
          <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
            <li><NavLink to="/dashboard" end>{t('portal.nav.home')}</NavLink></li>
            <li><NavLink to="/dashboard/courses">{t('nav.myCourses')}</NavLink></li>
            <li><NavLink to="/dashboard/browse">{t('nav.browseCourses')}</NavLink></li>
          </ul>
        ) : (
          <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
            <li><a href="#hero" onClick={(e) => handleScrollTo(e, 'hero')}>{t('nav.home')}</a></li>
            <li><a href="#courses" onClick={(e) => handleScrollTo(e, 'courses')}>{t('nav.courses')}</a></li>
            <li><a href="#methodology" onClick={(e) => handleScrollTo(e, 'methodology')}>{t('nav.sanad')}</a></li>
            <li><a href="#faq" onClick={(e) => handleScrollTo(e, 'faq')}>{t('nav.faq')}</a></li>
          </ul>
        )}
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }} className="nav-auth">
          <LangToggle />
          {token ? (
            <>
              <Link to={dashboardLink} style={{ color: 'var(--primary-color)', textShadow: '0 0 10px rgba(250,204,21,0.5)', fontWeight: 'bold', textDecoration: 'none' }}>{t('nav.hi', { name: userName?.split(' ')[0] || '' })}</Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)', padding: '0.4rem 1rem' }}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>{t('nav.login')}</Link>
              <Link to="/signup" className="btn btn-accent login-btn" style={{ borderRadius: '50px', padding: '0.6rem 1.5rem' }}>{t('nav.bookTrial')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
