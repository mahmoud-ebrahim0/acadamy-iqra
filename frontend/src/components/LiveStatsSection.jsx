import { useState, useEffect } from 'react';
import { useLang } from '../i18n/lang';
import { API_URL } from '../utils/api';

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

const STATS = [
  { key: 'students', label: 'stats.students' },
  { key: 'instructors', label: 'stats.instructors' },
  { key: 'courses', label: 'stats.courses' },
  { key: 'classesAttended', label: 'stats.classes' },
];

/** Real numbers counted from the database (students, teachers, courses, attended classes). */
const LiveStatsSection = () => {
  const { t } = useLang();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/client/stats`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setStats(data))
      .catch(() => {});
  }, []);

  // Hidden until the numbers arrive (never shows made-up values).
  if (!stats) return null;

  return (
    <section id="stats" style={{ position: 'relative', zIndex: 10 }}>
      <div className="stats-container">
        {STATS.map(stat => (
          <div key={stat.key} className="stat-box">
            <AnimatedNumber target={Number(stats[stat.key]) || 0} />
            <div className="stat-label">{t(stat.label)}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveStatsSection;
