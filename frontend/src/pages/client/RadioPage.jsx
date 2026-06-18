import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import './RadioPage.css';

// Dictionary for AR/EN
const dict = {
  ar: {
    subtitle: "بث مباشر",
    title: "إذاعة القرآن الكريم",
    desc: "استمع إلى تلاوة مستمرة من القرآن الكريم. اختر القارئ المفضل لديك من بين مئات الإذاعات المتوفرة.",
    searchPlaceholder: "ابحث عن قارئ أو إذاعة...",
    share: "مشاركة",
    copied: "تم النسخ!",
    nowPlaying: "يتم الآن الاستماع إلى:",
    tabs: {
      favorites: "المفضلة ❤️",
      reciters: "تلاوات 🎙️",
      tafseer: "تفسير 📚",
      hadith: "حديث وفقه 📜",
      adhkar: "أذكار وسكينة 🕊️",
      translations: "ترجمات 🌐"
    }
  },
  en: {
    subtitle: "Live Broadcast",
    title: "Holy Quran Radio",
    desc: "Immerse yourself in continuous recitation. Choose your favorite reciter from hundreds of available stations.",
    searchPlaceholder: "Search for a reciter or station...",
    share: "Share",
    copied: "Copied!",
    nowPlaying: "Now Listening To:",
    tabs: {
      favorites: "Favorites ❤️",
      reciters: "Reciters 🎙️",
      tafseer: "Tafseer 📚",
      hadith: "Hadith & Fiqh 📜",
      adhkar: "Adhkar & Peace 🕊️",
      translations: "Translations 🌐"
    }
  }
};

const topReciters = [
  { id: 32, name: "🌟 عبدالباسط عبدالصمد (المرتل)", url: "https://backup.qurango.net/radio/abdulbasit_abdulsamad" },
  { id: 74, name: "🌟 محمود خليل الحصري (المرتل)", url: "https://backup.qurango.net/radio/mahmoud_khalil_alhussary" },
  { id: 69, name: "🌟 محمد صديق المنشاوي (المرتل)", url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi" },
  { id: 77, name: "🌟 محمود علي البنا (المرتل)", url: "https://backup.qurango.net/radio/mahmoud_ali__albanna" },
  { id: 80, name: "🌟 مصطفى إسماعيل (المرتل)", url: "https://backup.qurango.net/radio/mustafa_ismail" }
];

const RadioPage = () => {
  const [radios, setRadios] = useState([]);
  const [currentRadio, setCurrentRadio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [lang, setLang] = useState('ar');
  const [activeTab, setActiveTab] = useState('reciters');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [listeningTime, setListeningTime] = useState(0);

  const audioRef = useRef(null);
  const location = useLocation();

  const t = dict[lang];

  // Load Favorites and Stats from LocalStorage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem('radioFavorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
    const savedTime = localStorage.getItem('listeningTime');
    if (savedTime) {
      setListeningTime(parseInt(savedTime));
    }
  }, []);

  // Tracking timer (Listening stats & Sleep timer)
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setListeningTime(prev => {
          const newTime = prev + 1;
          localStorage.setItem('listeningTime', newTime.toString());
          return newTime;
        });

        if (sleepTimer !== null) {
          setSleepTimer(prev => {
            if (prev <= 1) {
              if (audioRef.current) audioRef.current.pause();
              setIsPlaying(false);
              return null;
            }
            return prev - 1;
          });
        }
      }, 60000); // Tick every 60 seconds (1 minute)
    }
    return () => clearInterval(interval);
  }, [isPlaying, sleepTimer]);

  // Fetch API and handle Query Params
  useEffect(() => {
    const fetchAllRadios = async () => {
      try {
        const response = await fetch('https://mp3quran.net/api/v3/radios?language=ar');
        const data = await response.json();
        if (data.radios && data.radios.length > 0) {
          // Keep only non-reciter categories from the API
          const nonReciters = data.radios.filter(r => {
             const n = r.name;
             return n.includes('ترجمة') || n.includes('باللغة') || n.includes('translation') ||
                    n.includes('تفسير') || n.includes('المختصر') ||
                    n.includes('فتاوى') || n.includes('صحيح') || n.includes('سيرة') || n.includes('فقه') || n.includes('ابن عثيمين') || n.includes('ابن باز') ||
                    n.includes('أذكار') || n.includes('رقية') || n.includes('سكينة');
          });

          // Combine Top 5 Reciters + Non-Reciter Categories
          const allList = [...topReciters, ...nonReciters];
          setRadios(allList);

          // Check for shared URL parameter
          const searchParams = new URLSearchParams(location.search);
          const stationId = searchParams.get('station');
          if (stationId) {
            const sharedStation = allList.find(r => r.id === parseInt(stationId));
            if (sharedStation) {
              setCurrentRadio(sharedStation);
            } else {
              setCurrentRadio(allList[0]);
            }
          } else {
            setCurrentRadio(allList[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch all radios:", error);
      }
    };
    fetchAllRadios();
  }, [location.search]);

  // Autoplay handler
  useEffect(() => {
    if (audioRef.current && currentRadio) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Autoplay prevented.", err);
          setIsPlaying(false);
        });
    }
  }, [currentRadio]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.warn(e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const toggleFavorite = (radio) => {
    let newFavs;
    if (favorites.find(f => f.id === radio.id)) {
      newFavs = favorites.filter(f => f.id !== radio.id);
    } else {
      newFavs = [...favorites, radio];
    }
    setFavorites(newFavs);
    localStorage.setItem('radioFavorites', JSON.stringify(newFavs));
  };

  const shareRadio = () => {
    if (!currentRadio) return;
    const url = `${window.location.origin}${window.location.pathname}?station=${currentRadio.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Categorization Logic
  const getCategorizedRadios = () => {
    let filtered = radios;
    
    // 1. Search Filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 2. Tab Filter
    if (activeTab === 'favorites') {
      filtered = filtered.filter(r => favorites.some(f => f.id === r.id));
    } else if (activeTab === 'tafseer') {
      filtered = filtered.filter(r => r.name.includes('تفسير') || r.name.includes('المختصر'));
    } else if (activeTab === 'hadith') {
      filtered = filtered.filter(r => r.name.includes('فتاوى') || r.name.includes('صحيح') || r.name.includes('سيرة') || r.name.includes('فقه') || r.name.includes('ابن عثيمين') || r.name.includes('ابن باز'));
    } else if (activeTab === 'adhkar') {
      filtered = filtered.filter(r => r.name.includes('أذكار') || r.name.includes('رقية') || r.name.includes('سكينة'));
    } else if (activeTab === 'translations') {
      filtered = filtered.filter(r => r.name.includes('ترجمة') || r.name.includes('باللغة') || r.name.includes('translation'));
    } else { // reciters (default)
      // Reciters are everything else not strictly in other clear categories (or just show all minus translations/fatawa to be safe)
      filtered = filtered.filter(r => 
        !r.name.includes('ترجمة') && 
        !r.name.includes('تفسير') &&
        !r.name.includes('فتاوى') &&
        !r.name.includes('سيرة') &&
        !r.name.includes('أذكار')
      );
    }

    return filtered;
  };

  const displayList = getCategorizedRadios();

  return (
    <div className={`radio-page-container ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="radio-background"></div>
      <div className="radio-noise"></div>

      <div className="lang-toggle-container">
        <button className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          {lang === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>

      <div className="radio-content">
        
        {/* Sidebar / List Area */}
        <motion.div 
          className="radio-list-area"
          initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="radio-header">
            <span className="radio-subtitle">{t.subtitle}</span>
            <h1 className="radio-main-title">{t.title}</h1>
            <p className="radio-description">{t.desc}</p>
            <div className="listening-stats" style={{ marginTop: '1rem', color: '#d4af37', fontSize: '0.9rem' }}>
              {lang === 'ar' ? `⏱️ إجمالي استماعك: ${listeningTime} دقيقة تقريباً` : `⏱️ Total listening time: ~${listeningTime} mins`}
            </div>
          </div>

          <div className="radio-search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="radio-tabs">
            <button className={activeTab === 'favorites' ? 'active' : ''} onClick={() => setActiveTab('favorites')}>{t.tabs.favorites}</button>
            <button className={activeTab === 'reciters' ? 'active' : ''} onClick={() => setActiveTab('reciters')}>{t.tabs.reciters}</button>
            <button className={activeTab === 'tafseer' ? 'active' : ''} onClick={() => setActiveTab('tafseer')}>{t.tabs.tafseer}</button>
            <button className={activeTab === 'hadith' ? 'active' : ''} onClick={() => setActiveTab('hadith')}>{t.tabs.hadith}</button>
            <button className={activeTab === 'adhkar' ? 'active' : ''} onClick={() => setActiveTab('adhkar')}>{t.tabs.adhkar}</button>
            <button className={activeTab === 'translations' ? 'active' : ''} onClick={() => setActiveTab('translations')}>{t.tabs.translations}</button>
          </div>

          <div className="radio-items-list">
            {displayList.length === 0 ? (
              <div className="no-results">لا توجد نتائج / No results found</div>
            ) : (
              displayList.map(radio => {
                const isFav = favorites.some(f => f.id === radio.id);
                const isPlayingThis = currentRadio?.id === radio.id;
                return (
                  <div key={radio.id} className={`radio-list-item ${isPlayingThis ? 'active' : ''}`} onClick={() => setCurrentRadio(radio)}>
                    <div className="radio-item-info">
                      <span className="radio-item-icon">{isPlayingThis ? '🎶' : '📻'}</span>
                      <span className="radio-item-name">{radio.name}</span>
                    </div>
                    <button 
                      className={`fav-btn ${isFav ? 'active' : ''}`} 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(radio); }}
                      title="Add to Favorites"
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Player Area */}
        <motion.div 
          className="radio-player-area"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          {/* Visualizer */}
          <div className={`radio-visualizer ${isPlaying ? 'playing' : ''}`}>
            <div className="radio-visualizer-inner">
              <div className="radio-visualizer-core"></div>
            </div>
          </div>

          <div className="now-playing-info">
            <span className="now-playing-label">{t.nowPlaying}</span>
            <h3 className="now-playing-name">{currentRadio?.name || '...'}</h3>
          </div>

          {/* Controls */}
          <div className="radio-controls-container">
            <div className="control-buttons-row">
              <button className="play-btn-large" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="share-btn" onClick={shareRadio}>
                 {copied ? t.copied : t.share} 📤
              </button>
            </div>
            
            <div className="volume-control-large">
              <span>🔉</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange} 
                className="volume-slider-large"
              />
              <span>🔊</span>
            </div>

            <div className="extra-controls-row" style={{ marginTop: '0.5rem' }}>
              <select 
                value={sleepTimer || ''} 
                onChange={(e) => setSleepTimer(e.target.value ? parseInt(e.target.value) : null)}
                style={{
                  background: 'rgba(232,232,227,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#e8e8e3',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{color: '#000'}}>{lang === 'ar' ? 'إيقاف تلقائي: معطل 🌙' : 'Sleep Timer: Off 🌙'}</option>
                <option value="15" style={{color: '#000'}}>15 {lang === 'ar' ? 'دقيقة' : 'min'}</option>
                <option value="30" style={{color: '#000'}}>30 {lang === 'ar' ? 'دقيقة' : 'min'}</option>
                <option value="45" style={{color: '#000'}}>45 {lang === 'ar' ? 'دقيقة' : 'min'}</option>
                <option value="60" style={{color: '#000'}}>60 {lang === 'ar' ? 'دقيقة' : 'min'}</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {currentRadio && (
        <audio 
          ref={audioRef} 
          src={currentRadio.url} 
          preload="auto"
          autoPlay
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
};

export default RadioPage;
