import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <div className="header">
        <h1>لوحة تحكم الأكاديمية</h1>
        <p>إدارة الطلاب، المعلمين، والحلقات القرآنية</p>
      </div>

      <div className="card-container">
        <div className="card">
          <h2>إدارة المعلمين</h2>
          <p>إضافة أو تعديل بيانات المعلمين وجداولهم.</p>
          <button className="btn">دخول</button>
        </div>
        
        <div className="card">
          <h2>إدارة الطلاب</h2>
          <p>متابعة تقدم الطلاب والمستويات الدراسية.</p>
          <button className="btn">دخول</button>
        </div>

        <div className="card">
          <h2>إدارة الحلقات</h2>
          <p>إنشاء وتعيين حلقات التحفيظ ومواعيدها.</p>
          <button className="btn">دخول</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
