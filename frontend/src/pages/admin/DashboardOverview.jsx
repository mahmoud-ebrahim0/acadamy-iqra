import React, { useEffect, useState } from 'react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({ totalCourses: 0, totalInstructors: 0, totalStudents: 0 });

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div className="admin-header">
        <h2>نظرة عامة على الأكاديمية</h2>
        <button className="btn btn-accent">تحميل التقرير</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">إجمالي الدورات</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalInstructors}</div>
          <div className="stat-label">عدد المعلمين</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">الطلاب المسجلين</div>
        </div>
      </div>

      <div className="admin-table-container">
        <h3 style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>أحدث النشاطات</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>النشاط</th>
              <th>التاريخ</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>تم تسجيل طالب جديد في دورة التهيئة</td>
              <td>منذ 10 دقائق</td>
              <td><span style={{ color: 'green' }}>مكتمل</span></td>
            </tr>
            <tr>
              <td>تم إضافة معلم جديد (أ. أحمد)</td>
              <td>منذ ساعتين</td>
              <td><span style={{ color: 'green' }}>مكتمل</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOverview;
