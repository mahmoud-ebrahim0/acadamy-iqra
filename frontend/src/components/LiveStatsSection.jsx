import React, { useState, useEffect } from 'react';

const AnimatedNumber = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <div className="stat-number">{count.toLocaleString()}{suffix}</div>;
};

const LiveStatsSection = () => {
  return (
    <section id="stats" style={{ position: 'relative', zIndex: 10 }}>
      <div className="stats-container">
        <div className="stat-box">
          <AnimatedNumber target={54300} suffix="+" />
          <div className="stat-label">Ayahs Memorized</div>
        </div>
        <div className="stat-box">
          <AnimatedNumber target={1250} suffix="+" />
          <div className="stat-label">Active Students</div>
        </div>
        <div className="stat-box">
          <AnimatedNumber target={15400} suffix="+" />
          <div className="stat-label">Live Broadcast Hours</div>
        </div>
        <div className="stat-box">
          <AnimatedNumber target={340} />
          <div className="stat-label">Certified Ijazahs</div>
        </div>
      </div>
    </section>
  );
};

export default LiveStatsSection;
