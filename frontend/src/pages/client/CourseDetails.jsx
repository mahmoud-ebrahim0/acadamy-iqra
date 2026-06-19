import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CourseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

  // If someone navigates to this page without a course object in state, redirect to home
  if (!course) {
    return <Navigate to="/home" replace />;
  }

  const handleEnroll = () => {
    navigate(`/checkout/${course._id}`, { state: { course } });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Hero Section for Course */}
      <div style={{ 
        backgroundColor: 'var(--primary-color)', 
        color: 'white', 
        padding: '6rem 2rem 4rem', 
        textAlign: 'center',
        borderBottom: '5px solid var(--accent-color)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            fontSize: '5rem', 
            marginBottom: '1rem', 
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            borderRadius: '50%',
            border: '2px solid var(--accent-color)'
          }}>
            {course.icon || '📚'}
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{course.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '1.2rem', opacity: 0.9 }}>
            <span><i style={{ color: 'var(--accent-color)' }}>Level:</i> {course.level}</span>
            <span>|</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
              {course.price ? `$${course.price}` : 'Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ flex: 1, padding: '4rem 2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        
        {/* Left Column: Description */}
        <div style={{ flex: '1 1 600px' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-secondary)', paddingBottom: '0.5rem' }}>
            Course Overview
          </h2>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-color)', marginBottom: '2rem' }}>
            {course.description || 'This course offers a comprehensive learning experience designed for students seeking to deepen their understanding of Islamic studies and Quranic recitation. Join our expert Al-Azhar certified instructors on this spiritual journey.'}
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-secondary)', paddingBottom: '0.5rem' }}>
            What You Will Learn
          </h2>
          <ul style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Master proper pronunciation and Tajweed rules.</li>
            <li style={{ marginBottom: '0.5rem' }}>Understand the deeper meanings of the Quranic text.</li>
            <li style={{ marginBottom: '0.5rem' }}>Connect directly with qualified scholars from Al-Azhar.</li>
            <li style={{ marginBottom: '0.5rem' }}>Flexible learning schedule tailored to your pace.</li>
          </ul>
        </div>

        {/* Right Column: Sticky Enrollment Card */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <div style={{ 
            backgroundColor: 'var(--card-bg)', 
            padding: '2.5rem', 
            borderRadius: '15px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'sticky',
            top: '100px'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-color)' }}>
              Ready to start your journey?
            </h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
              Secure your spot and begin learning directly from elite scholars.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {course.price ? `$${course.price}` : 'Free'}
              </span>
            </div>
            <button 
              onClick={handleEnroll} 
              className="btn btn-accent" 
              style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}
            >
              Enroll Now
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <i style={{ color: '#25d366' }}>✓</i> 100% Satisfaction Guarantee
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;
