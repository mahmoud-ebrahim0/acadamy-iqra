import React, { useState } from 'react';

const ManageCourses = () => {
  const [courses, setCourses] = useState([
    { _id: '1', title: 'Quran Memorization (Hifz) for Beginners', level: 'Beginner', description: 'A structured path to memorizing the Holy Quran.', price: 50, icon: '📖' },
    { _id: '2', title: 'Advanced Tajweed Rules', level: 'Advanced', description: 'Master the rules of Tajweed with practical application.', price: 70, icon: '🎙️' },
    { _id: '3', title: 'Arabic for Non-Native Speakers', level: 'Intermediate', description: 'Learn to read and understand the language of the Quran.', price: 60, icon: '🗣️' }
  ]);
  const [newCourse, setNewCourse] = useState({ title: '', age: '', description: '', price: '', image: null });

  const handleImageUpload = (e) => {
    // In a real app, this file is sent to S3/Cloudinary to get a URL
    setNewCourse({...newCourse, image: e.target.files[0]});
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    const courseData = {
      title: newCourse.title,
      level: newCourse.age,
      description: newCourse.description,
      price: newCourse.price,
      icon: '📖', // Fallback for existing UI
    };

    // 1. Send data to Antigravity Webhook (Airtable / Supabase Automation)
    const WEBHOOK_URL = 'https://your-antigravity-webhook-url.com/catch';
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });
      console.log('Successfully sent course data to Antigravity Webhook!');
    } catch (err) {
      console.log('Webhook call simulated (or failed due to dummy URL)', err);
    }

    // 2. Add to local state (Frontend Only)
    const newId = Date.now().toString();
    setCourses([...courses, { _id: newId, ...courseData }]);
    setNewCourse({ title: '', age: '', description: '', price: '', image: null }); // Reset form
    alert('Course created successfully! (Frontend Only Mode)');
  };

  const handleDeleteCourse = (id) => {
    if(window.confirm('Are you sure you want to delete this course?')) {
      // Remove from local state (Frontend Only)
      setCourses(courses.filter(c => c._id !== id));
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Manage Courses</h2>
      </div>

      <div className="admin-table-container" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', textShadow: '0 0 10px rgba(250,204,21,0.3)' }}>✨ Add New Course</h3>
        <form onSubmit={handleAddCourse} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input type="text" className="form-control" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Target Age Group</label>
            <input type="text" className="form-control" placeholder="e.g. Children 7-12 years" value={newCourse.age} onChange={e => setNewCourse({...newCourse, age: e.target.value})} required />
          </div>
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Course Description</label>
            <textarea className="form-control" rows="3" placeholder="Brief description of what the student will learn..." value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label">Subscription Price ($)</label>
            <input type="number" className="form-control" placeholder="e.g. 50" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} required />
          </div>
          
          {/* Image Upload Button (Glassmorphic) */}
          <div className="form-group">
            <label className="form-label">Course Cover Image</label>
            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
              <button type="button" className="btn btn-outline" style={{ width: '100%', padding: '0.8rem', borderStyle: 'dashed', borderColor: 'var(--accent-color)' }}>
                 {newCourse.image ? '📸 Image Selected' : '📤 Upload Cover Image'}
              </button>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', textShadow: '0 0 10px rgba(56,189,248,0.5)', letterSpacing: '1px' }}>🚀 Create Course</button>
          </div>
        </form>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Course Title</th>
              <th>Age Group</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course._id}>
                <td style={{ fontSize: '1.5rem' }}>{course.icon}</td>
                <td style={{ fontWeight: '600' }}>{course.title}</td>
                <td>{course.level}</td>
                <td><span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.9rem' }}>Standard</span></td>
                <td>
                  <button onClick={() => handleDeleteCourse(course._id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No courses added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;
