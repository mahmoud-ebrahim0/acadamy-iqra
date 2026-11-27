import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../i18n/lang';
import { useSiteContent } from '../../utils/useSiteContent';
import { pagesContent } from '../../i18n/pagesContent';
import { useSiteSettings, whatsappDigits } from '../../utils/useSiteSettings';

/**
 * Content page (About, Terms, Privacy, Refund). `page` is the page slug.
 * Text comes from the admin dashboard; until the admin edits a page, the built-in default text is shown.
 */
const InfoPage = ({ page }) => {
  const { lang } = useLang();
  const settings = useSiteSettings();
  const defaults = pagesContent[lang] || pagesContent.en;
  const { ready, data } = useSiteContent(page, { en: pagesContent.en[page], ar: pagesContent.ar[page] });

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <header style={{ background: 'var(--primary-color)', color: '#fff', padding: '5rem 1.5rem 3.5rem', textAlign: 'center', borderBottom: '5px solid var(--accent-color)', minHeight: '14rem' }}>
        {ready && (
          <>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>{data.title}</h1>
            {data.intro && <p style={{ maxWidth: '720px', margin: '0 auto', fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{data.intro}</p>}
          </>
        )}
      </header>

      <main className="container" style={{ flex: 1, maxWidth: '860px', padding: '3.5rem 1.5rem' }}>
        {ready && data.sections.map((section, index) => (
          <section key={index} style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '1.8rem 2rem', marginBottom: '1.25rem', borderInlineStart: '4px solid var(--accent-color)', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '0.6rem' }}>{section.heading}</h2>
            <p style={{ color: 'var(--text-color)', fontSize: '1.08rem', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{section.text}</p>
          </section>
        ))}

        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '1rem' }}>
          <h3 style={{ color: 'var(--primary-color)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>{defaults.contactTitle}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem' }}>{defaults.contactText}</p>
          <a href={`https://wa.me/${whatsappDigits(settings)}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#25D366', color: '#fff', padding: '0.8rem 2rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700 }}>
            {defaults.contactButton}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InfoPage;
