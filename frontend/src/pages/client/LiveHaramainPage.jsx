import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const LiveHaramainPage = () => {
  const [activeStream, setActiveStream] = useState('makkah');

  return (
    <div className="live-haramain-page" style={{ background: '#0a0b0a', color: '#e8e8e3', minHeight: '100vh', fontFamily: 'El Messiri, sans-serif' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ color: '#d4af37', fontSize: '3rem', marginBottom: '1rem', fontFamily: 'Cinzel, serif' }}>بث مباشر من الحرمين</h1>
        <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '3rem' }}>
          شاهد البث الحي على مدار الساعة من المسجد الحرام بمكة المكرمة والمسجد النبوي بالمدينة المنورة.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveStream('makkah')}
            style={{
              background: activeStream === 'makkah' ? '#d4af37' : 'transparent',
              color: activeStream === 'makkah' ? '#0a0b0a' : '#d4af37',
              border: '2px solid #d4af37',
              padding: '0.8rem 2rem',
              borderRadius: '30px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🕌 المسجد الحرام (مكة)
          </button>
          <button 
            onClick={() => setActiveStream('madinah')}
            style={{
              background: activeStream === 'madinah' ? '#d4af37' : 'transparent',
              color: activeStream === 'madinah' ? '#0a0b0a' : '#d4af37',
              border: '2px solid #d4af37',
              padding: '0.8rem 2rem',
              borderRadius: '30px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🕌 المسجد النبوي (المدينة)
          </button>
        </div>

        <div style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          height: 0,
          overflow: 'hidden',
          maxWidth: '100%',
          background: '#000',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(212,175,55,0.2)'
        }}>
          {activeStream === 'makkah' ? (
            <iframe 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src="https://www.youtube.com/embed/live_stream?channel=UCXwXQxRz-d6G5jG1h6P9v1g&autoplay=1&mute=0" 
              title="Makkah Live" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <iframe 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src="https://www.youtube.com/embed/live_stream?channel=UC4b4n_hWqHnUj_LwX4k2bZg&autoplay=1&mute=0" 
              title="Madinah Live" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          )}
        </div>
        
        <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.9rem' }}>
          * البث المباشر مقدم عبر قنوات يوتيوب الرسمية. قد يتأخر البث بضع ثوانٍ.
        </p>

      </div>
      <Footer />
    </div>
  );
};

export default LiveHaramainPage;
