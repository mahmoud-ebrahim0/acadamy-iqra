import React, { useState, useEffect } from 'react';

const CoursesSection = () => {
  const [coursesData, setCoursesData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/client/courses')
      .then(res => res.json())
      .then(data => setCoursesData(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="section courses">
      <div className="container">
        <h2 className="section-title">قائمة الدورات المميزة</h2>
        <div className="courses-grid">
          {coursesData.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-img">{course.icon}</div>
              <div className="course-content">
                <span className="course-age">{course.age}</span>
                <h3 className="course-title">{course.title}</h3>
                <p style={{marginBottom: '1rem', color: 'var(--text-muted)'}}>دورة {course.category}</p>
                <button className="btn">الالتحاق بالدورة</button>
              </div>
            </div>
          ))}
          {coursesData.length === 0 && (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
              لا توجد دورات متاحة حالياً.
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button className="btn btn-accent">الذهاب لصفحة الدورات كاملة</button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
