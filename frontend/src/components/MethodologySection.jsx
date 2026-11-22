import { useLang } from '../i18n/lang';

const NODES = [
  { key: 'n1', icon: '📜', color: 'var(--primary-color)', glow: 'rgba(250, 204, 21, 0.4)', reverse: false },
  { key: 'n2', icon: '🗣️', color: 'var(--accent-color)', glow: 'rgba(56, 189, 248, 0.4)', reverse: true },
  { key: 'n3', icon: '🎓', color: 'var(--primary-color)', glow: 'rgba(250, 204, 21, 0.4)', reverse: false },
];

const MethodologySection = () => {
  const { t } = useLang();

  return (
    <section id="methodology" className="section" style={{ background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden', padding: '8rem 0' }}>

      {/* Abstract Glowing Chain in Background */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}>
        <path d="M-100,100 C200,400 400,-100 800,200 S1200,500 1600,100" fill="transparent" stroke="var(--primary-color)" strokeWidth="4" />
        <path d="M-100,200 C300,500 500,0 900,300 S1300,600 1700,200" fill="transparent" stroke="var(--accent-color)" strokeWidth="2" />
      </svg>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 className="section-title" style={{ fontSize: '3rem', textShadow: '0 0 20px rgba(250, 204, 21, 0.4)' }}>{t('method.title')}</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem' }}>
            {t('method.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center', position: 'relative' }}>

          {/* Central Vertical Connecting Line */}
          <div className="timeline-line" style={{ position: 'absolute', top: '0', bottom: '0', left: '50%', width: '2px', background: 'linear-gradient(to bottom, var(--primary-color), var(--accent-color), var(--primary-color))', transform: 'translateX(-50%)', zIndex: 1, opacity: 0.5 }}></div>

          {NODES.map(node => (
            <div key={node.key} style={{ display: 'flex', alignItems: 'center', gap: '3rem', maxWidth: '900px', width: '100%', flexDirection: node.reverse ? 'row-reverse' : 'row' }}>
              {/* Text sits next to the center line in both languages */}
              <div style={{ flex: 1, textAlign: node.reverse ? 'start' : 'end' }}>
                <h3 style={{ fontSize: '2.2rem', color: node.color, marginBottom: '1rem' }}>{t(`method.${node.key}.title`)}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                  {t(`method.${node.key}.text`)}
                </p>
              </div>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--card-bg)', border: `4px solid ${node.color}`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', boxShadow: `0 0 40px ${node.glow}`, zIndex: 2, flexShrink: 0 }}>
                {node.icon}
              </div>
              <div style={{ flex: 1 }}></div>
            </div>
          ))}

        </div>

      </div>

      {/* Mobile fix CSS for timeline */}
      <style>{`
        @media (max-width: 768px) {
          .timeline-line { display: none; }
          #methodology > div > div > div {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1.5rem !important;
          }
          #methodology > div > div > div > div {
            text-align: center !important;
          }
        }
      `}</style>
    </section>
  );
};

export default MethodologySection;
