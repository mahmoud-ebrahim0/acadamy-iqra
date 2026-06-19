import React from 'react';
import heroBg from '../assets/hero-bg.png';

const HeroSection = ({ onBookTrial }) => {
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
          left: '-5%', 
          fontSize: '25vw', 
          fontFamily: 'var(--font-heading)',
          color: 'var(--primary-color)',
          opacity: 0.03,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          lineHeight: 1
        }}>
          ترتيل
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
              <button className="btn btn-accent" onClick={onBookTrial} style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem', borderRadius: '50px', background: 'var(--primary-color)', color: 'white', border: 'none' }}>Begin Journey</button>
            </div>
          </div>

          {/* Right Block: Verse and Callout */}
          <div style={{ flex: '1 1 300px', textAlign: 'right', paddingBottom: '2rem' }}>
            <div style={{ display: 'inline-block', textAlign: 'right', borderRight: '4px solid var(--primary-color)', paddingRight: '2rem' }}>
              <span className="celestial-verse" style={{ display: 'block', fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '1rem' }}>
                وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
              </span>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1.1rem' }}>
                "And recite the Quran with measured recitation."<br/>(Quran 73:4)
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
