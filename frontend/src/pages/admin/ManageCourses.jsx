import React, { useState, useEffect } from 'react';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', age: '', category: '', icon: '📚' });

  const fetchCourses = () => {
    fetch('http://localhost:5000/api/admin/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse)
    })
    .then(res => res.json())
    .then(() => {
      fetchCourses(); // Refresh list
      setNewCourse({ title: '', age: '', category: '', icon: '📚' }); // Reset form
    });
  };

  const handleDeleteCourse = (id) => {
    if(window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      fetch(`http://localhost:5000/api/admin/courses/${id}`, {
        method: 'DELETE'
      })
      .then(() => fetchCourses());
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>إدارة الدورات</h2>
      </div>

      <div className="admin-table-container" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>إضافة دورة جديدة</h3>
        <form onSubmit={handleAddCourse} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">عنوان الدورة</label>
            <input type="text" className="form-control" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">الفئة العمرية</label>
            <input type="text" className="form-control" placeholder="مثال: للأطفال 5 سنوات" value={newCourse.age} onChange={e => setNewCourse({...newCourse, age: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">التصنيف</label>
            <select className="form-control" value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})}>
              <option value="">اختر التصنيف...</option>
              <option value="لغة عربية">لغة عربية</option>
              <option value="قرآن كريم">قرآن كريم</option>
              <option value="تربية إسلامية">تربية إسلامية</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">الأيقونة (ايموجي)</label>
            <input type="text" className="form-control" value={newCourse.icon} onChange={e => setNewCourse({...newCourse, icon: e.target.value})} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-accent">إضافة الدورة</button>
          </div>
        </form>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الأيقونة</th>
              <th>عنوان الدورة</th>
              <th>الفئة العمرية</th>
              <th>التصنيف</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td style={{ fontSize: '1.5rem' }}>{course.icon}</td>
                <td style={{ fontWeight: '600' }}>{course.title}</td>
                <td>{course.age}</td>
                <td><span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.9rem' }}>{course.category}</span></td>
                <td>
                  <button onClick={() => handleDeleteCourse(course.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>حذف</button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>لا توجد دورات مضافة حالياً.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;
