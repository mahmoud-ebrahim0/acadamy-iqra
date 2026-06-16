import React from 'react';
import { Link } from 'react-router-dom';

const WomensAcademySection = () => {
  return (
    <section id="womens-academy" className="section" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '2rem',
          padding: '4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 0 30px rgba(236, 72, 153, 0.1)',
          border: '1px solid rgba(236, 72, 153, 0.2)',
          backdropFilter: 'blur(15px)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.5))' }}>🌸</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-color)', marginBottom: '1.5rem', textShadow: '0 0 15px rgba(236, 72, 153, 0.3)' }}>
            Women's Private Academy
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: '1.8' }}>
            Empowering Muslim sisters with top-tier Online Tajweed and Quran Classes. 
            Enjoy absolute privacy and dedicated learning environments taught exclusively by highly qualified female instructors from Al-Azhar Al-Sharif.
          </p>
          <Link to="/courses" className="btn" style={{ 
            borderColor: 'rgba(236, 72, 153, 0.5)', 
            color: '#fbcfe8',
            boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
            fontSize: '1.2rem',
            padding: '1rem 2.5rem'
          }}>
            Explore Sisters' Courses
          </Link>
        </div>
      </div>
      {/* Pink/Purple cosmic ambient light for this specific section */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
        zIndex: 1,
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>
    </section>
  );
};

export default WomensAcademySection;
