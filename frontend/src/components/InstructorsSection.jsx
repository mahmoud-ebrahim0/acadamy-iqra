import React, { useState, useEffect } from 'react';

const InstructorsSection = () => {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    // Mockup Data to fill the site
    const mockupInstructors = [
      { _id: '1', name: 'Sheikh Ahmed Al-Azhari', rank: 'Senior Qari & Ijazah Holder', imageUrl: '' },
      { _id: '2', name: 'Sheikh Mahmoud', rank: 'Specialist in 10 Qira\'at', imageUrl: '' },
      { _id: '3', name: 'Ustazah Fatima', rank: 'Senior Tajweed Expert (Female)', imageUrl: '' },
      { _id: '4', name: 'Ustadh Omar', rank: 'Quran Foundation Tutor', imageUrl: '' },
      { _id: '5', name: 'Ustazah Aisha', rank: 'Hifz Instructor (Female)', imageUrl: '' },
      { _id: '6', name: 'Sheikh Bilal', rank: 'Islamic Studies Tutor', imageUrl: '' }
    ];
    setInstructors(mockupInstructors);
  }, []);
  

  // Dynamically assign an image based on the instructor's name/title
  const getFallbackImage = (name) => {
    const safeName = name || '';
    if (safeName.toLowerCase().includes('ustazah') || safeName.toLowerCase().includes('female')) {
      return '/niqab.png';
    }
    return '/sheikh.png'; // Default
  };

  // Split instructors into two tiers based on rank (just to match the old UI logic)
  const safeInstructors = Array.isArray(instructors) ? instructors : [];
  const seniorInstructors = safeInstructors.filter(inst => {
    const rank = inst.rank || '';
    return rank.toLowerCase().includes('senior') || rank.toLowerCase().includes('qari') || rank.toLowerCase().includes('specialist');
  });
  const tajweedInstructors = safeInstructors.filter(inst => {
    const rank = inst.rank || '';
    return !rank.toLowerCase().includes('senior') && !rank.toLowerCase().includes('qari') && !rank.toLowerCase().includes('specialist');
  });

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
