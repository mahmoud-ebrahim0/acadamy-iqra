import { Link } from 'react-router-dom';
import { useLang } from '../i18n/lang';
import { useSiteSettings, whatsappDigits } from '../utils/useSiteSettings';

const SOCIAL = [
  ['facebook', 'Facebook', 'M14 8h3V4h-3c-2.8 0-4 1.7-4 4.2V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z'],
  ['instagram', 'Instagram', 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z'],
  ['youtube', 'YouTube', 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z'],
  ['tiktok', 'TikTok', 'M16.5 3c.4 2.3 1.8 3.8 4 4v3.2a7.6 7.6 0 0 1-4-1.2v6.3A5.8 5.8 0 1 1 10.7 9.5v3.3a2.6 2.6 0 1 0 2.6 2.5V3z'],
];

const Footer = () => {
  const { t } = useLang();
  const settings = useSiteSettings();
  const socials = SOCIAL.filter(([key]) => settings[key]);

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
              <li>
                <a href={`https://wa.me/${whatsappDigits(settings)}`} target="_blank" rel="noreferrer">
                  💬 {t('footer.whatsapp')}
                </a>
              </li>
              {settings.phone && <li><a href={`tel:${settings.phone.replace(/\s/g, '')}`}>📞 <bdi dir="ltr">{settings.phone}</bdi></a></li>}
              {settings.email && <li><a href={`mailto:${settings.email}`}>✉️ <bdi>{settings.email}</bdi></a></li>}
            </ul>
            {socials.length > 0 && (
              <div className="footer-social">
                {socials.map(([key, label, icon]) => (
                  <a key={key} href={settings[key]} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d={icon} /></svg>
                  </a>
                ))}
              </div>
            )}
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
