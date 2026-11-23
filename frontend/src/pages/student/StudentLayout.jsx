import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { fetchWithAuth, readJson } from '../../utils/api';
import { clearSession, getUserName, SESSION_EVENT } from '../../utils/auth';
import { useLang } from '../../i18n/lang';
import LangToggle from '../../components/LangToggle';
import NavIcon from '../../components/NavIcon';
import logo from '../../assets/tarteel-logo-maroon.png';

// Sidebar sections and their pages (paths are relative to /dashboard).
const NAV_GROUPS = [
  { key: 'main', links: [{ to: '', key: 'home', end: true }, { to: 'courses', key: 'courses' }] },
  { key: 'learning', links: [{ to: 'attendance', key: 'attendance' }, { to: 'reports', key: 'reports' }] },
  { key: 'more', links: [{ to: 'browse', key: 'browse' }, { to: 'profile', key: 'profile' }] },
];

/**
 * Student portal: its own layout (sidebar, no marketing navbar/footer).
 * Loads the student's data once and shares it with every page through the outlet context.
 */
const StudentLayout = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({ enrollments: [], reports: [], attendance: {} });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [, setSessionVersion] = useState(0);

  const reload = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/student/dashboard');
      const body = await readJson(res);
      if (!res.ok) { setLoadError(body.message || 'student.loadError'); return; }
      setLoadError('');
      setData({ enrollments: body.enrollments || [], reports: body.reports || [], attendance: body.attendance || {} });
    } catch {
      setLoadError('student.connection');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the student's data from the API
    reload();
  }, [reload]);

  // Re-render when the name changes (profile page).
  useEffect(() => {
    const refresh = () => setSessionVersion(v => v + 1);
    window.addEventListener(SESSION_EVENT, refresh);
    return () => window.removeEventListener(SESSION_EVENT, refresh);
  }, []);

  // Scroll to top when moving between portal pages.
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const handleLogout = () => {
    clearSession();
    navigate('/home', { replace: true });
  };

  const name = getUserName() || t('student.defaultName');

  return (
    <div className="admin-layout instructor-layout portal-layout">
      <aside className="admin-sidebar ps-sidebar">
        {/* Brand */}
        <div className="ps-brand">
          <img src={logo} alt="" />
          <span>
            {lang === 'ar'
              ? <>{t('instructor.brandRest')} <b>{t('instructor.brandHighlight')}</b></>
              : <><b>{t('instructor.brandHighlight')}</b> {t('instructor.brandRest')}</>}
          </span>
        </div>

        <LangToggle className="lang-switch-dark ps-lang" />

        {/* Navigation */}
        <nav className="instructor-nav ps-nav" aria-label={t('portal.role')}>
          {NAV_GROUPS.map(group => (
            <div key={group.key} className="sidebar-group">
              <div className="sidebar-group-title">{t(`portal.navGroup.${group.key}`)}</div>
              {group.links.map(link => (
                <NavLink key={link.key} to={link.to ? `/dashboard/${link.to}` : '/dashboard'} end={link.end} className={({ isActive }) => `portal-link ${isActive ? 'active' : ''}`}>
                  <NavIcon name={link.key} /> <span>{t(`portal.nav.${link.key}`)}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Account */}
        <div className="ps-footer">
          <div className="ps-user">
            <span className="portal-user-avatar" aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong>{name}</strong>
              <small>{t('portal.role')}</small>
            </div>
            <button type="button" onClick={handleLogout} className="ps-logout" title={t('nav.logout')} aria-label={t('nav.logout')}>
              <NavIcon name="logout" size={19} />
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>{t('student.loading')}</p>
        ) : loadError ? (
          <p className="acc-error">{loadError.startsWith('student.') ? t(loadError) : t.server(loadError)}</p>
        ) : (
          <Outlet context={{ ...data, reload }} />
        )}
      </main>
    </div>
  );
};

export default StudentLayout;
