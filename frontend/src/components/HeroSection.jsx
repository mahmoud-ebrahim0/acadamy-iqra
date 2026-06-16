import React from 'react';

const HeroSection = ({ onBookTrial }) => {
  return (
    <section className="hero-cosmic" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '0 5%' }}>
      
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
        <div className="glow"></div>
      </div>
      
      {/* Asymmetrical Layout */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Massive Arabic overlay background text */}
        <div style={{ 
          position: 'absolute', 
          top: '-15%', 
          left: '-5%', 
          fontSize: '25vw', 
          fontFamily: 'var(--font-heading)',
          color: 'var(--primary-color)',
          opacity: 0.03,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          lineHeight: 1
        }}>
          إقرأ
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4rem', marginTop: '10vh' }}>
          
          {/* Left Block: Main Title */}
          <div style={{ flex: '1 1 500px', maxWidth: '700px' }}>
            <h1 style={{ 
              fontSize: 'clamp(4rem, 8vw, 6.5rem)', 
              lineHeight: '1.1', 
              marginBottom: '2rem',
              color: 'var(--text-color)',
              letterSpacing: '-1px'
            }}>
              Master the<br />
              <span style={{ color: 'var(--primary-color)', fontStyle: 'italic' }}>Sacred Chain</span>
            </h1>
            <p style={{ 
              fontSize: '1.4rem', 
              color: 'var(--text-muted)', 
              marginBottom: '3rem',
              maxWidth: '500px',
              borderLeft: '2px solid var(--accent-color)',
              paddingLeft: '1.5rem'
            }}>
              Connect your recitation directly to the Prophet ﷺ through elite Al-Azhar scholars. 
              A profound journey of spiritual and linguistic excellence.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button className="btn btn-accent" onClick={onBookTrial} style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem' }}>Begin Journey</button>
            </div>
          </div>

          {/* Right Block: Verse and Callout */}
          <div style={{ flex: '1 1 300px', textAlign: 'right', paddingBottom: '2rem' }}>
            <div style={{ display: 'inline-block', textAlign: 'right', borderRight: '4px solid var(--primary-color)', paddingRight: '2rem' }}>
              <span className="celestial-verse" style={{ display: 'block', fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '1rem' }}>
                وَجَعَلْنَا السَّمَاءَ سَقْفًا مَّحْفُوظًا
              </span>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1.1rem' }}>
                "And We made the sky a protected ceiling."<br/>(Quran 21:32)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Silhouette elements at bottom */}
      <div className="silhouette-container" style={{ opacity: 0.4 }}>
        <div className="person-silhouette"></div>
        <div className="mountains-silhouette"></div>
      </div>

      {/* Embedded Style for Glowing Verse */}
      <style>{`
        @keyframes intense-glow {
          0% { text-shadow: 0 0 10px rgba(250, 204, 21, 0.5), 0 0 20px rgba(250, 204, 21, 0.3); }
          50% { text-shadow: 0 0 20px rgba(250, 204, 21, 0.9), 0 0 40px rgba(250, 204, 21, 0.6), 0 0 60px rgba(255, 255, 255, 0.4); }
          100% { text-shadow: 0 0 10px rgba(250, 204, 21, 0.5), 0 0 20px rgba(250, 204, 21, 0.3); }
        }
        .celestial-verse {
          animation: intense-glow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
