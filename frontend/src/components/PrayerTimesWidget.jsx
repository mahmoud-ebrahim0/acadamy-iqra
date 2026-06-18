import React, { useState, useEffect } from 'react';

const PrayerTimesWidget = () => {
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5')
      .then(res => res.json())
      .then(data => {
        setTimings(data.data.timings);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch prayer times", err);
        setLoading(false);
      });
  }, []);

  if (loading || !timings) return null;

  const names = { Fajr: 'Fajr', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' };
  const targetPrayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div className="prayer-times-widget" style={{ 
      background: 'rgba(10, 11, 10, 0.8)', 
      border: '1px solid rgba(212, 175, 55, 0.3)', 
      borderRadius: '12px', 
      padding: '1.5rem', 
      margin: '2rem auto', 
      maxWidth: '800px',
      color: '#e8e8e3',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 10
    }}>
      <h3 style={{ color: '#d4af37', marginBottom: '1.5rem', fontSize: '1.5rem', textShadow: '0 0 10px rgba(212,175,55,0.3)' }}>
        Prayer Times <span style={{fontSize: '1rem', color: '#888'}}>(Cairo Time)</span>
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
        {targetPrayers.map(prayer => (
          <div key={prayer} style={{ textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.8 }}>{names[prayer]}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#d4af37' }}>{timings[prayer]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerTimesWidget;
