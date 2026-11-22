import { Link } from 'react-router-dom';
import { useLang } from '../i18n/lang';

const Footer = () => {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>{t('footer.brand')}</h3>
            <p style={{ opacity: 0.8 }}>{t('footer.about')}</p>
          </div>
          <div className="footer-col">
            <h3>{t('footer.quickLinks')}</h3>
            <ul className="footer-links">
              <li><Link to="/courses">{t('footer.coursesList')}</Link></li>
              <li><Link to="/instructors">{t('footer.instructors')}</Link></li>
              <li><Link to="/about">{t('footer.aboutAcademy')}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>{t('footer.policies')}</h3>
            <ul className="footer-links">
              <li><Link to="/terms">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
              <li><Link to="/refund">{t('footer.refund')}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>{t('footer.contact')}</h3>
            <ul className="footer-links">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noreferrer">Youtube</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
