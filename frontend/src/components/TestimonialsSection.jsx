import { homeContent } from '../i18n/homeContent';
import { useSiteContent } from '../utils/useSiteContent';

const DEFAULTS = { en: homeContent.en.testimonials, ar: homeContent.ar.testimonials };
const STYLES = [
  { color: 'var(--accent-color)', glow: 'rgba(56, 189, 248, 0.05)', authorGlow: 'rgba(56, 189, 248, 0.4)' },
  { color: 'var(--primary-color)', glow: 'rgba(250, 204, 21, 0.05)', authorGlow: 'rgba(250, 204, 21, 0.4)' },
];

/** Parents' testimonials, edited by the admin (Dashboard → Website Content → Testimonials). */
const TestimonialsSection = () => {
  const { ready, data } = useSiteContent('testimonials', DEFAULTS);
  const testimonials = data.sections.map((s, i) => ({ author: s.heading, text: s.text, ...STYLES[i % STYLES.length] }));

  if (!ready || testimonials.length === 0) return null;

  return (
    <section className="section testimonials" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Cosmic Elements */}
      <div className="cosmic-swirl swirl-1" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(250, 204, 21, 0.08)', width: '600px', height: '600px' }}></div>
      <div className="asteroid" style={{ top: '20%', left: '20%', width: '18px', height: '18px', animationDelay: '4s' }}></div>
      <div className="asteroid" style={{ top: '80%', right: '20%', width: '14px', height: '14px', animationDelay: '9s' }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">{data.title}</h2>
        {data.intro && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.2rem' }}>{data.intro}</p>}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {testimonials.map((item, index) => (
            <div key={index} className="testimonial-card" style={{ borderInlineStart: `4px solid ${item.color}`, boxShadow: `0 10px 40px rgba(0,0,0,0.6), inset 0 0 30px ${item.glow}` }}>
              <p className="testimonial-text" style={{ whiteSpace: 'pre-line' }}>
                {item.text}
              </p>
              <h4 style={{ color: item.color, textShadow: `0 0 10px ${item.authorGlow}` }}>{item.author}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
