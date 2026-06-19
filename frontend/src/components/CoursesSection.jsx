import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CoursesSection = () => {
  const navigate = useNavigate();
  const [coursesData, setCoursesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('https://acadamy-iqra-production.up.railway.app/api/client/courses');
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setCoursesData(data);
        } else {
          // Fallback mockup data with valid MongoDB ObjectIds (24 hex characters)
          const mockupCourses = [
            { _id: '64b123456789012345678901', icon: '📖', level: 'Beginner', title: 'Learn Noorani Qaida', description: 'Master the basics of Arabic reading and pronunciation to read the Quran correctly.', price: 50 },
            { _id: '64b123456789012345678902', icon: '🕌', level: 'Intermediate', title: 'Tajweed Rules Masterclass', description: 'Dive deep into the rules of Tajweed to beautify your recitation.', price: 75 },
            { _id: '64b123456789012345678903', icon: '⭐', level: 'Advanced', title: 'Quran Memorization (Hifz)', description: 'Structured program to memorize the Holy Quran with a certified tutor.', price: 100 },
            { _id: '64b123456789012345678904', icon: '🎓', level: 'All Levels', title: 'Islamic Studies & Aqeedah', description: 'Comprehensive curriculum covering Fiqh, Seerah, and Islamic history.', price: 60 },
            { _id: '64b123456789012345678905', icon: '🗣️', level: 'Beginner', title: 'Conversational Arabic', description: 'Learn to speak and understand the Arabic language used in daily life.', price: 85 },
            { _id: '64b123456789012345678906', icon: '📜', level: 'Advanced', title: 'Ijazah Program (Sanad)', description: 'Earn a certified Ijazah linked to the Prophet (PBUH) upon completion.', price: 150 }
          ];
          setCoursesData(mockupCourses);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses from server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="section courses" style={{ position: 'relative', overflow: 'hidden', minHeight: '600px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Featured Courses</h2>
        
        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary-color)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⏳</div>
            <h3 style={{ fontSize: '1.5rem' }}>Loading Courses...</h3>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: '#f87171', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Connection Failed</h3>
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
                      <p style={{marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem'}}>{course.description.length > 80 ? course.description.substring(0, 80) + '...' : course.description}</p>
                    ) : (
                      <p style={{marginBottom: '1.5rem', color: 'var(--text-muted)'}}>Course</p>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
                      <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                        {course.price ? `$${course.price}` : 'Free'}
                      </span>
                      <button onClick={() => navigate(`/course/${course._id}`, { state: { course } })} className="btn-outline-primary">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
              
              {coursesData.length === 0 && (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem', color: 'var(--text-muted)' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>No courses available yet.</h3>
                </div>
              )}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <button className="btn btn-accent" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px', background: 'var(--primary-color)', color: 'white', border: 'none' }}>View All Courses</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
