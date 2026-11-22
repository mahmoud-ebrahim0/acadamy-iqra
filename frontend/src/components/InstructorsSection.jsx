import { useState, useEffect } from 'react';
import { API_URL } from '../utils/api';
import { useLang } from '../i18n/lang';

const FEMALE_HINTS = ['ustazah', 'ustadha', 'ustadhah', 'sheikha', 'female', 'أستاذة', 'الأستاذة', 'الشيخة', 'معلمة', 'المعلمة'];
const SENIOR_HINTS = ['senior', 'qari', 'specialist', 'ijazah', 'قارئ', 'مقرئ', 'متخصص', 'إجازة', 'كبار'];
const isSenior = (rank) => SENIOR_HINTS.some(hint => rank.toLowerCase().includes(hint));

const InstructorsSection = () => {
  const { t } = useLang();
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch(`${API_URL}/api/client/instructors`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (Array.isArray(data)) setInstructors(data);
      } catch (err) {
        console.error('Error fetching instructors:', err);
      }
    };

    fetchInstructors();
  }, []);

  // Picture by the gender the admin chose; older records without it fall back to the name/title.
  const getImage = (inst) => {
    if (inst.gender === 'female') return '/niqab.png';
    if (inst.gender === 'male') return '/sheikh.png';
    const text = `${inst.name || ''} ${inst.rank || ''}`.toLowerCase();
    return FEMALE_HINTS.some(hint => text.includes(hint)) ? '/niqab.png' : '/sheikh.png';
  };

  // Split instructors into two tiers based on rank (just to match the old UI logic)
  const safeInstructors = Array.isArray(instructors) ? instructors : [];
  const seniorInstructors = safeInstructors.filter(inst => {
    const rank = inst.rank || '';
    return isSenior(rank);
  });
  const tajweedInstructors = safeInstructors.filter(inst => {
    const rank = inst.rank || '';
    return !isSenior(rank);
  });

  // Hide the whole section until there are real instructors to show.
  if (safeInstructors.length === 0) return null;

  return (
    <section className="section instructors" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">{t('instructors.title')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{t('instructors.subtitle')}</p>
        </div>


        {/* Senior Tier */}
        {seniorInstructors.length > 0 && (
          <>
            <h3 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(250, 204, 21, 0.2)', paddingBottom: '1rem', display: 'table', margin: '0 auto 2rem' }}>
              {t('instructors.senior')}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '5rem' }}>
              {seniorInstructors.map(inst => (
                <div key={inst._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '280px' }}>
                  <div className="islamic-frame" style={{ marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(250, 204, 21, 0.3)' }}>
                    <img src={getImage(inst)} alt={inst.name} />
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
            <h3 style={{ color: 'var(--accent-color)', textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '1rem', display: 'table', margin: '0 auto 2rem' }}>
              {t('instructors.tajweed')}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
              {tajweedInstructors.map(inst => (
                <div key={inst._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '220px' }}>
                  <div className="islamic-frame" style={{ width: '180px', height: '180px', marginBottom: '1rem', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', borderRadius: '0' }}>
                    <img src={getImage(inst)} alt={inst.name} />
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
