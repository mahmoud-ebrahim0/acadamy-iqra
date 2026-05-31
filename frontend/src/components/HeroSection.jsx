import React from 'react';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>أكاديمية اقرأ التعليمية</h1>
        <p>متخصصة في تعليم اللغة العربية وتلاوة القرآن الكريم بطريقة سريعة ومبتكرة تناسب جميع الأعمار.</p>
        <div className="hero-btns">
          <button className="btn btn-accent">حجز درس تجريبي مجاناً</button>
          <button className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>قائمة الدورات</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
