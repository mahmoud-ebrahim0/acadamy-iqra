import React, { useState, useEffect } from 'react';

const inspirations = [
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", source: "سورة الشرح - آية 6" },
  { text: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", source: "سورة الضحى - آية 5" },
  { text: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا", source: "سورة التوبة - آية 40" },
  { text: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ", source: "سورة غافر - آية 60" },
  { text: "رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ", source: "سورة البقرة - آية 286" },
  { text: "من سلك طريقاً يلتمس فيه علماً، سهل الله له به طريقاً إلى الجنة", source: "حديث شريف - رواه مسلم" },
  { text: "الكلمة الطيبة صدقة", source: "حديث شريف - متفق عليه" }
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
      <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '1.2rem', opacity: 0.8 }}>إضاءة اليوم ✨</h3>
      <p style={{ fontSize: '2rem', lineHeight: '1.6', fontFamily: 'El Messiri, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        "{quote.text}"
      </p>
      <p style={{ marginTop: '1rem', color: '#888', fontSize: '1rem' }}>- {quote.source}</p>
    </div>
  );
};

export default DailyInspiration;
