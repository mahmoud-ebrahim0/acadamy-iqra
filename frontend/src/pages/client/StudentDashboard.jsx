import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const StudentDashboard = () => {
  const formatZoomLink = (link) => {
    if (!link) return '#';
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return `https://${link}`;
    }
    return link;
  };

  const userName = localStorage.getItem('userName') || 'Student';
  const firstName = userName.split(' ')[0];
  const userId = localStorage.getItem('userId');

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetch(`https://acadamy-iqra-production.up.railway.app/api/student/dashboard?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          setEnrollments(data.enrollments || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

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

          {loading ? (
             <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary-color)' }}>Loading your dashboard...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
              
              {/* Schedule Section */}
              <div className="course-card" style={{ padding: '2rem' }}>
                <h2 style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', textShadow: '0 0 10px rgba(56, 189, 248, 0.4)' }}>📅 Upcoming Classes</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {enrollments.filter(e => e.scheduleTime).length > 0 ? enrollments.filter(e => e.scheduleTime).map(enr => (
                    <div key={enr._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--accent-color)' }}>
                      <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{enr.course?.title || 'Enrolled Course (Title Unavailable)'}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        👤 {enr.instructor?.name || 'Pending Instructor'} &nbsp;|&nbsp; 🕒 {enr.scheduleTime}
                      </p>
                      {enr.zoomLink ? (
                        <a href={formatZoomLink(enr.zoomLink)} target="_blank" rel="noreferrer" className="btn btn-accent" style={{ width: '100%', padding: '0.6rem', textAlign: 'center', display: 'block' }}>🎥 Join Zoom Class</a>
                      ) : (
                        <button className="btn btn-outline" style={{ width: '100%', padding: '0.6rem', cursor: 'not-allowed', color: 'var(--text-muted)' }}>No Link Yet</button>
                      )}
                    </div>
                  )) : (
                    <p style={{ color: 'var(--text-muted)' }}>You have no upcoming classes scheduled.</p>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="course-card" style={{ padding: '2rem' }}>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>📈 Your Progress</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {enrollments.length > 0 ? enrollments.map(enr => (
                    <div key={enr._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{enr.course?.title || 'Enrolled Course (Title Unavailable)'}</span>
                        <span style={{ color: 'var(--primary-color)' }}>{enr.progressPercentage}%</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Current Lesson: {enr.currentAyahOrLesson}</div>
                      {/* Progress Bar Container */}
                      <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '5px', overflow: 'hidden', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)' }}>
                        {/* Golden Progress Fill */}
                        <div style={{ 
                          width: `${enr.progressPercentage}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #b45309, #facc15)', 
                          boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
                          borderRadius: '5px',
                          transition: 'width 1s ease-in-out'
                        }}></div>
                      </div>
                    </div>
                  )) : (
                    <p style={{ color: 'var(--text-muted)' }}>You are not enrolled in any courses yet.</p>
                  )}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                  <Link to="/home" className="btn btn-outline" style={{ width: '100%' }}>Browse More Courses</Link>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentDashboard;
