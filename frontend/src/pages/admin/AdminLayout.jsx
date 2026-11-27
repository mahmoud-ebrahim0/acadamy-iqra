import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearSession } from '../../utils/auth';
import { useAdminLang } from '../../i18n/lang';
import NotificationBell from '../../components/NotificationBell';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, dir, toggleLang } = useAdminLang();

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  const handleLogout = () => {
    clearSession();
    navigate('/home');
  };

  return (
    <div className="admin-layout" dir={dir} lang={lang}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <Link to="/home" className="admin-sidebar-logo">
          {lang === 'ar'
            ? <>{t('brand.rest')} <span>{t('brand.highlight')}</span></>
            : <><span>{t('brand.highlight')}</span> {t('brand.rest')}</>}
        </Link>

        <div className="sb-tools">
          <button type="button" onClick={toggleLang} className="admin-lang-toggle" aria-label={t('lang.switch')}>
            🌐 {t('lang.switch')}
          </button>
          <NotificationBell />
        </div>

        <div className="admin-nav">
          <Link to="/admin" className={isActive('/admin')}>{t('nav.overview')}</Link>
          <Link to="/admin/students" className={isActive('/admin/students')}>{t('nav.students')}</Link>
          <Link to="/admin/consultations" className={isActive('/admin/consultations')}>{t('nav.consultations')}</Link>
          <Link to="/admin/courses" className={isActive('/admin/courses')}>{t('nav.courses')}</Link>
          <Link to="/admin/instructors" className={isActive('/admin/instructors')}>{t('nav.instructors')}</Link>
          <Link to="/admin/payouts" className={isActive('/admin/payouts')}>{t('nav.payouts')}</Link>
          <Link to="/admin/pages" className={isActive('/admin/pages')}>{t('nav.pages')}</Link>
          <Link to="/admin/settings" className={isActive('/admin/settings')}>{t('nav.settings')}</Link>

          <button onClick={handleLogout} className="admin-nav-logout">{t('nav.logout')}</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
