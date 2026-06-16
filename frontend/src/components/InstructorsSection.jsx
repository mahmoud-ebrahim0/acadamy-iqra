import React, { useState } from 'react';

const seniorInstructors = [
  { id: 1, name: 'Sheikh Ali Qoja', role: 'Senior Qari & Ijazah Holder', image: '/sheikh.png', audio: 'https://server8.mp3quran.net/afs/001.mp3' },
  { id: 2, name: 'Sheikh Abdulrahman', role: '10 Qira\'at Specialist', image: '/sheikh.png', audio: 'https://server8.mp3quran.net/afs/001.mp3' }
];

const tajweedInstructors = [
  { id: 3, name: 'Ustaz Ahmed Sino', role: 'Arabic & Foundation Tutor', image: '/sheikh.png' },
  { id: 4, name: 'Ustazah Rayan', role: 'Women\'s Tajweed Tutor', image: '/niqab.png' },
  { id: 5, name: 'Ustazah Banan', role: 'Kids Quran Tutor', image: '/niqab.png' },
  { id: 6, name: 'Ustazah Jumana', role: 'Arabic Language Specialist', image: '/niqab.png' }
];

const InstructorsSection = () => {
  const [playingId, setPlayingId] = useState(null);
  
  const handlePlay = (id) => {
    if (playingId === id) {
      setPlayingId(null);
      const audioEl = document.getElementById(`audio-${id}`);
      if (audioEl) audioEl.pause();
    } else {
      if (playingId) {
        const currentAudio = document.getElementById(`audio-${playingId}`);
        if (currentAudio) currentAudio.pause();
      }
      setPlayingId(id);
      const audioEl = document.getElementById(`audio-${id}`);
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(e => console.log("Audio play blocked", e));
      }
    }
  };

  return (
    <section className="section instructors" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">Our Elite Instructors</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Learn directly from certified Azhari scholars and senior Qaris.</p>
        </div>

        {/* Senior Tier */}
        <h3 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(250, 204, 21, 0.2)', paddingBottom: '1rem', display: 'inline-block', left: '50%', position: 'relative', transform: 'translateX(-50%)' }}>
          Senior Reciters & Ijazah Holders
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '5rem' }}>
          {seniorInstructors.map(inst => (
            <div key={inst.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '280px' }}>
              <div className="islamic-frame" style={{ marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(250, 204, 21, 0.3)' }}>
                <img src={inst.image} alt={inst.name} />
              </div>
              <h4 style={{ color: 'var(--text-color)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>{inst.name}</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{inst.role}</p>
              
              <audio id={`audio-${inst.id}`} src={inst.audio} onEnded={() => setPlayingId(null)} />
              <button className="btn-audio" onClick={() => handlePlay(inst.id)}>
                <span style={{ fontSize: '1.2rem' }}>{playingId === inst.id ? '⏸️' : '▶️'}</span> 
                {playingId === inst.id ? 'Playing...' : 'Listen to Recitation'}
              </button>
            </div>
          ))}
        </div>

        {/* Tajweed & Foundation Tier */}
        <h3 style={{ color: 'var(--accent-color)', textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '1rem', display: 'inline-block', left: '50%', position: 'relative', transform: 'translateX(-50%)' }}>
          Tajweed & Foundation Tutors
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          {tajweedInstructors.map(inst => (
            <div key={inst.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '220px' }}>
              <div className="islamic-frame" style={{ width: '180px', height: '180px', marginBottom: '1rem', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', borderRadius: '0' }}>
                <img src={inst.image} alt={inst.name} />
              </div>
              <h4 style={{ color: 'var(--text-color)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{inst.name}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{inst.role}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default InstructorsSection;
