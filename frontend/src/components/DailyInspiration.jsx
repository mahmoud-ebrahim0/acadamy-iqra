import React, { useState, useEffect } from 'react';

const inspirations = [
  { text: "Indeed, with hardship [will be] ease", source: "Surah Ash-Sharh - Verse 6" },
  { text: "And your Lord is going to give you, and you will be satisfied", source: "Surah Ad-Duhaa - Verse 5" },
  { text: "Do not grieve; indeed Allah is with us", source: "Surah At-Tawbah - Verse 40" },
  { text: "And your Lord says, 'Call upon Me; I will respond to you'", source: "Surah Ghafir - Verse 60" },
  { text: "Our Lord, and burden us not with that which we have no ability to bear", source: "Surah Al-Baqarah - Verse 286" },
  { text: "Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him", source: "Hadith - Sahih Muslim" },
  { text: "A good word is charity", source: "Hadith - Agreed Upon" }
];

const DailyInspiration = () => {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    // Get a deterministic random based on the day of the year so it changes daily
    const date = new Date();
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % inspirations.length;
    setQuote(inspirations[index]);
  }, []);

  if (!quote) return null;

  return (
    <div className="daily-inspiration-widget" style={{
      background: 'linear-gradient(135deg, rgba(10, 11, 10, 0.9), rgba(212, 175, 55, 0.05))',
      borderLeft: '4px solid #d4af37',
      borderRadius: '8px',
      padding: '2rem',
      margin: '2rem auto',
      maxWidth: '800px',
      color: '#e8e8e3',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-20px', left: '-20px', fontSize: '6rem', opacity: 0.05, color: '#d4af37' }}>❞</div>
      <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.2rem', opacity: 0.8 }}>Daily Inspiration ✨</h3>
      <p style={{ fontSize: '2rem', lineHeight: '1.6', fontFamily: 'El Messiri, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        "{quote.text}"
      </p>
      <p style={{ marginTop: '1rem', color: '#888', fontSize: '1rem' }}>- {quote.source}</p>
    </div>
  );
};

export default DailyInspiration;
