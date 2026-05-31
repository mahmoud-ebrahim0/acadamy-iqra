import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>أكاديمية اقرأ</h3>
            <p style={{ opacity: 0.8 }}>نساعد الآباء والأمهات في تنشئة أطفالهم وتربيتهم على المنهاج الإسلامي واللغة العربية السليمة.</p>
          </div>
          <div className="footer-col">
            <h3>روابط سريعة</h3>
            <ul className="footer-links">
              <li><Link to="/courses">قائمة الدورات</Link></li>
              <li><Link to="/instructors">المعلمين</Link></li>
              <li><Link to="/about">عن الأكاديمية</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>السياسات</h3>
            <ul className="footer-links">
              <li><Link to="/terms">الشروط والأحكام</Link></li>
              <li><Link to="/privacy">سياسة الخصوصية</Link></li>
              <li><Link to="/refund">سياسة الاسترجاع</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>تواصل معنا</h3>
            <ul className="footer-links">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noreferrer">Youtube</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} أكاديمية اقرأ التعليمية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
