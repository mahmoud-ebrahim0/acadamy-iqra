import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CoursesSection = () => {
  const navigate = useNavigate();
  const [coursesData, setCoursesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mockup Data to fill the site
    const mockupCourses = [
      { _id: '1', icon: '📖', level: 'Beginner', title: 'Learn Noorani Qaida', description: 'Master the basics of Arabic reading and pronunciation to read the Quran correctly.', price: 50 },
      { _id: '2', icon: '🕌', level: 'Intermediate', title: 'Tajweed Rules Masterclass', description: 'Dive deep into the rules of Tajweed to beautify your recitation.', price: 75 },
      { _id: '3', icon: '⭐', level: 'Advanced', title: 'Quran Memorization (Hifz)', description: 'Structured program to memorize the Holy Quran with a certified tutor.', price: 100 },
      { _id: '4', icon: '🎓', level: 'All Levels', title: 'Islamic Studies & Aqeedah', description: 'Comprehensive curriculum covering Fiqh, Seerah, and Islamic history.', price: 60 },
      { _id: '5', icon: '🗣️', level: 'Beginner', title: 'Conversational Arabic', description: 'Learn to speak and understand the Arabic language used in daily life.', price: 85 },
      { _id: '6', icon: '📜', level: 'Advanced', title: 'Ijazah Program (Sanad)', description: 'Earn a certified Ijazah linked to the Prophet (PBUH) upon completion.', price: 150 }
    ];

    const fetchCourses = () => {
      setIsLoading(true);
      setTimeout(() => {
        setCoursesData(mockupCourses);
        setIsLoading(false);
      }, 1000); // Simulate network delay
    };

    fetchCourses();
  }, []);

  return (
    <section className="section courses" style={{ position: 'relative', overflow: 'hidden', minHeight: '600px' }}>
      {/* Background Cosmic Elements */}
      <div className="cosmic-swirl swirl-1"></div>
      <div className="cosmic-swirl swirl-2"></div>
      <div className="asteroid" style={{ top: '20%', left: '15%' }}></div>
      <div className="asteroid" style={{ top: '60%', right: '25%', width: '10px', height: '10px', animationDelay: '5s' }}></div>
      <div className="asteroid" style={{ top: '80%', left: '30%', width: '20px', height: '20px', animationDelay: '12s' }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Featured Courses</h2>
        
        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary-color)' }}>
            <div style={{ fontSize: '4rem', animation: 'float-icon 2s infinite ease-in-out', marginBottom: '1.5rem' }}>⏳</div>
            <h3 style={{ textShadow: '0 0 15px rgba(250, 204, 21, 0.5)', fontSize: '1.5rem' }}>Summoning Data from the Cosmic Database...</h3>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '1.5rem', backdropFilter: 'blur(10px)', maxWidth: '600px', margin: '0 auto', boxShadow: '0 0 30px rgba(239,68,68,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 20px rgba(239, 68, 68, 0.8)' }}>⚠️</div>
            <h3 style={{ color: '#f87171', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Connection Lost to Antigravity Base</h3>
            <p style={{ color: '#fca5a5' }}>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-outline" style={{ marginTop: '1.5rem', borderColor: '#f87171', color: '#f87171' }}>Retry Connection</button>
          </div>
        )}

        {/* Success State (Data Loaded) */}
        {!isLoading && !error && (
          <>
            <div className="courses-grid">
              {Array.isArray(coursesData) && coursesData.map(course => (
                <div key={course._id} className="course-card">
                  {/* If the course has an imageUrl, show it. Otherwise fallback to icon */}
                  {course.imageUrl ? (
                    <div style={{ height: '200px', backgroundImage: `url(${course.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid rgba(250, 204, 21, 0.2)' }}></div>
                  ) : (
                    <div className="course-img">{course.icon || '📚'}</div>
                  )}
                  
                  <div className="course-content">
                    <span className="course-age">{course.level}</span>
                    <h3 className="course-title">{course.title}</h3>
                    {course.description ? (
                      <p style={{marginBottom: '1rem', color: '#cbd5e1', fontSize: '0.95rem'}}>{course.description.length > 80 ? course.description.substring(0, 80) + '...' : course.description}</p>
                    ) : (
                      <p style={{marginBottom: '1rem', color: '#cbd5e1'}}>Course</p>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem' }}>
                      <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.3rem', textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>
                        {course.price ? `$${course.price}` : 'Free'}
                      </span>
                      <button onClick={() => navigate(`/checkout/${course._id}`, { state: { course } })} className="btn" style={{ padding: '0.5rem 1.5rem' }}>Enroll Now</button>
                    </div>
                  </div>
                </div>
              ))}
              
              {coursesData.length === 0 && (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem', color: '#94a3b8' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>No courses discovered in this galaxy yet.</h3>
                </div>
              )}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <button className="btn btn-accent" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Explore All Galaxies</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
