import heroBg from '../assets/hero-bg.png';
import { useLang } from '../i18n/lang';

const HeroSection = ({ onBookTrial }) => {
  const { t, lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <section className="hero-section" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 5%',
      background: `url(${heroBg}) no-repeat center center/cover`
    }}>

      {/* Subtle white overlay for better text readability */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        zIndex: 1
      }}></div>

      {/* Asymmetrical Layout */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', width: '100%' }}>

        {/* Massive Arabic overlay background text */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          insetInlineStart: '-5%',
          fontSize: '25vw',
          fontFamily: 'var(--font-heading)',
          color: 'var(--primary-color)',
          opacity: 0.03,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          lineHeight: 1
        }}>
          {t('hero.bgWord')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4rem', marginTop: '10vh' }}>

          {/* Main Title */}
          <div style={{ flex: '1 1 500px', maxWidth: '700px' }}>
            <h1 style={{
              fontSize: isAr ? 'clamp(3.5rem, 7vw, 6rem)' : 'clamp(4rem, 8vw, 6.5rem)',
              lineHeight: isAr ? '1.4' : '1.1',
              marginBottom: '2rem',
              color: 'var(--text-color)',
              letterSpacing: isAr ? 'normal' : '-1px'
            }}>
              {t('hero.title1')}<br />
              <span style={{ color: 'var(--primary-color)', fontStyle: isAr ? 'normal' : 'italic' }}>{t('hero.title2')}</span>
            </h1>
            <p style={{
              fontSize: '1.4rem',
              color: 'var(--text-muted)',
              marginBottom: '3rem',
              maxWidth: '500px',
              borderInlineStart: '2px solid var(--accent-color)',
              paddingInlineStart: '1.5rem',
              lineHeight: isAr ? '1.9' : undefined
            }}>
              {t('hero.subtitle')}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button className="btn btn-accent" onClick={onBookTrial} style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem', borderRadius: '50px', background: 'var(--primary-color)', color: 'white', border: 'none' }}>{t('hero.cta')}</button>
            </div>
          </div>

          {/* Verse and Callout */}
          <div style={{ flex: '1 1 300px', textAlign: 'end', paddingBottom: '2rem' }}>
            <div style={{ display: 'inline-block', textAlign: 'end', borderInlineEnd: '4px solid var(--primary-color)', paddingInlineEnd: '2rem' }}>
              <span className="celestial-verse" dir="rtl" style={{ display: 'block', fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '1rem' }}>
                وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
              </span>
              <p style={{ color: 'var(--text-muted)', fontStyle: isAr ? 'normal' : 'italic', fontSize: '1.1rem' }}>
                {t('hero.verseMeaning') && <>{t('hero.verseMeaning')}<br/></>}
                {t('hero.verseRef')}
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
