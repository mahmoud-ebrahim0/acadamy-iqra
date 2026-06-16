import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const StudentDashboard = () => {
  const userName = localStorage.getItem('userName') || 'Student';
  const firstName = userName.split(' ')[0];

  // Mock Data
  const upcomingClasses = [
    { id: 1, course: 'Reading & Writing Arabic', instructor: 'Mr. Ali Qoja', date: 'Today', time: '5:00 PM', link: '#' },
    { id: 2, course: 'Juz Amma Recitation', instructor: 'Ms. Banan Saleh', date: 'Tomorrow', time: '4:30 PM', link: '#' }
  ];

  const activeCourses = [
    { id: 1, title: 'Reading & Writing Arabic Letters', progress: 75 },
    { id: 2, title: 'Juz Amma Recitation', progress: 40 }
  ];

  return (
    <>
      <Navbar />
      <div className="section" style={{ minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>
        {/* Cosmic Background Elements */}
        <div className="cosmic-swirl swirl-1" style={{ top: '20%', left: '10%' }}></div>
        <div className="cosmic-swirl swirl-2" style={{ bottom: '10%', right: '10%' }}></div>
        <div className="asteroid" style={{ top: '30%', left: '80%', animationDelay: '1s' }}></div>
        <div className="asteroid" style={{ top: '70%', left: '20%', width: '12px', height: '12px', animationDelay: '6s' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          
          {/* Welcome Card */}
          <div className="course-card" style={{ padding: '3rem', marginBottom: '3rem', textAlign: 'center', border: '1px solid rgba(250, 204, 21, 0.4)', boxShadow: '0 0 40px rgba(250, 204, 21, 0.1), inset 0 0 20px rgba(250, 204, 21, 0.1)' }}>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '1rem', textShadow: '0 0 15px rgba(250, 204, 21, 0.5)' }}>
              Welcome back, {firstName}! 🌟
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#cbd5e1' }}>Are you ready for your recitation today? Your journey to mastery continues.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            
            {/* Schedule Section */}
            <div className="course-card" style={{ padding: '2rem' }}>
              <h2 style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', textShadow: '0 0 10px rgba(56, 189, 248, 0.4)' }}>📅 Upcoming Classes</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingClasses.map(cls => (
                  <div key={cls.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--accent-color)' }}>
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{cls.course}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      👤 {cls.instructor} &nbsp;|&nbsp; 🕒 {cls.date} at {cls.time}
                    </p>
                    <a href={cls.link} className="btn btn-accent" style={{ width: '100%', padding: '0.6rem' }}>🎥 Join Zoom Class</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Section */}
            <div className="course-card" style={{ padding: '2rem' }}>
              <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>📈 Your Progress</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {activeCourses.map(course => (
                  <div key={course.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{course.title}</span>
                      <span style={{ color: 'var(--primary-color)' }}>{course.progress}%</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)' }}>
                      {/* Golden Progress Fill */}
                      <div style={{ 
                        width: `${course.progress}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #b45309, #facc15)', 
                        boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
                        borderRadius: '5px',
                        transition: 'width 1s ease-in-out'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <Link to="/home" className="btn btn-outline" style={{ width: '100%' }}>Browse More Courses</Link>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentDashboard;
