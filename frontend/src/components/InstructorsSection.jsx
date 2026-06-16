import React, { useState, useEffect } from 'react';

const InstructorsSection = () => {
  const [instructors, setInstructors] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    // Fetch from real Mongoose Backend
    fetch('http://localhost:5000/api/client/instructors')
      .then(res => res.json())
      .then(data => setInstructors(data))
      .catch(err => console.error("Error fetching instructors:", err));
  }, []);
  
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

  // Dynamically assign an image based on the instructor's name/title
  const getFallbackImage = (name) => {
    if (name.toLowerCase().includes('ustazah') || name.toLowerCase().includes('female')) {
      return '/niqab.png';
    }
    return '/sheikh.png'; // Default
  };

  // Split instructors into two tiers based on rank (just to match the old UI logic)
  const seniorInstructors = instructors.filter(inst => inst.rank.toLowerCase().includes('senior') || inst.rank.toLowerCase().includes('qari') || inst.rank.toLowerCase().includes('specialist'));
  const tajweedInstructors = instructors.filter(inst => !inst.rank.toLowerCase().includes('senior') && !inst.rank.toLowerCase().includes('qari') && !inst.rank.toLowerCase().includes('specialist'));

  return (
    <section className="section instructors" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">Our Elite Instructors</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Learn directly from certified Azhari scholars and senior Qaris.</p>
        </div>

        {instructors.length === 0 && (
           <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
             <h3>No instructors available right now. Ask Admin to add some!</h3>
           </div>
        )}

        {/* Senior Tier */}
        {seniorInstructors.length > 0 && (
          <>
            <h3 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(250, 204, 21, 0.2)', paddingBottom: '1rem', display: 'inline-block', left: '50%', position: 'relative', transform: 'translateX(-50%)' }}>
              Senior Reciters & Ijazah Holders
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '5rem' }}>
              {seniorInstructors.map(inst => (
                <div key={inst._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '280px' }}>
                  <div className="islamic-frame" style={{ marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(250, 204, 21, 0.3)' }}>
                    <img src={getFallbackImage(inst.name)} alt={inst.name} />
                  </div>
                  <h4 style={{ color: 'var(--text-color)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>{inst.name}</h4>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{inst.rank}</p>
                  
                  {/* Dummy audio just for UI demonstration */}
                  <audio id={`audio-${inst._id}`} src="https://server8.mp3quran.net/afs/001.mp3" onEnded={() => setPlayingId(null)} />
                  <button className="btn-audio" onClick={() => handlePlay(inst._id)}>
                    <span style={{ fontSize: '1.2rem' }}>{playingId === inst._id ? '⏸️' : '▶️'}</span> 
                    {playingId === inst._id ? 'Playing...' : 'Listen to Recitation'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tajweed & Foundation Tier */}
        {tajweedInstructors.length > 0 && (
          <>
            <h3 style={{ color: 'var(--accent-color)', textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '1rem', display: 'inline-block', left: '50%', position: 'relative', transform: 'translateX(-50%)' }}>
              Tajweed & Foundation Tutors
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
              {tajweedInstructors.map(inst => (
                <div key={inst._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '220px' }}>
                  <div className="islamic-frame" style={{ width: '180px', height: '180px', marginBottom: '1rem', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', borderRadius: '0' }}>
                    <img src={getFallbackImage(inst.name)} alt={inst.name} />
                  </div>
                  <h4 style={{ color: 'var(--text-color)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{inst.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{inst.rank}</p>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default InstructorsSection;
