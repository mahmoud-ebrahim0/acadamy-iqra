import React from 'react';

const starStudents = [
  { id: 1, name: 'Ahmad M.', achievement: 'Completed Juz Amma this week!', image: '/sheikh.png', delay: '0s' },
  { id: 2, name: 'Sara Y.', achievement: 'Perfect Tajweed Score', image: '/niqab.png', delay: '1s' },
  { id: 3, name: 'Omar K.', achievement: 'Memorized Surah Al-Baqarah', image: '/sheikh.png', delay: '2s' },
  { id: 4, name: 'Fatima Z.', achievement: 'Obtained Ijazah in Hafs', image: '/niqab.png', delay: '3s' },
  { id: 5, name: 'Yusuf A.', achievement: '100% Attendance this Month', image: '/sheikh.png', delay: '1.5s' }
];

const StarsOfTarteelSection = () => {
  return (
    <section className="section" style={{ background: 'var(--bg-color)', paddingBottom: '6rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">Stars of Tarteel</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Hover over the stars to see this week's outstanding students.</p>
        </div>

        <div className="galaxy-container" style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: '4rem', 
          padding: '6rem 2rem', 
          background: 'radial-gradient(circle at center, rgba(15,23,42,0.8) 0%, var(--bg-color) 100%)',
          borderRadius: '2rem',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Twinkling background stars */}
          <div style={{ position: 'absolute', top: '20%', left: '15%', width: '4px', height: '4px', background: 'white', borderRadius: '50%', boxShadow: '0 0 10px white' }}></div>
          <div style={{ position: 'absolute', top: '80%', left: '85%', width: '3px', height: '3px', background: 'white', borderRadius: '50%', boxShadow: '0 0 10px white' }}></div>
          <div style={{ position: 'absolute', top: '40%', left: '80%', width: '5px', height: '5px', background: 'var(--primary-color)', borderRadius: '50%', boxShadow: '0 0 15px var(--primary-color)' }}></div>
          <div style={{ position: 'absolute', top: '70%', left: '20%', width: '6px', height: '6px', background: 'var(--accent-color)', borderRadius: '50%', boxShadow: '0 0 15px var(--accent-color)' }}></div>
          
          {starStudents.map((student, index) => (
            <div 
              key={student.id} 
              className="star-student floating-star" 
              style={{ 
                position: 'relative', 
                width: '120px', 
                height: '120px',
                animationDelay: student.delay,
                marginTop: index % 2 !== 0 ? '4rem' : '0' // Creates a natural wave layout
              }}
            >
              <img src={student.image} alt={student.name} />
              <div className="star-tooltip" style={{ minWidth: '220px', textAlign: 'center' }}>
                <strong style={{ color: 'var(--primary-color)', display: 'block', marginBottom: '0.2rem', fontSize: '1.2rem' }}>{student.name}</strong>
                <span style={{ fontSize: '0.95rem' }}>{student.achievement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float-star {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        .floating-star {
          animation: float-star 6s ease-in-out infinite;
          border: 4px solid rgba(250, 204, 21, 0.4);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .floating-star:hover {
          border-color: var(--accent-color);
          box-shadow: 0 0 40px rgba(56, 189, 248, 0.8);
          animation-play-state: paused;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .floating-star {
            margin-top: 0 !important;
          }
          .galaxy-container {
            gap: 2rem !important;
            padding: 3rem 1rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default StarsOfTarteelSection;
