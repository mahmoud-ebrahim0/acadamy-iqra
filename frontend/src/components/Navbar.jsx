import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/home" className="nav-logo">
          <span>أكاديمية</span> اقرأ
        </Link>
        <ul className="nav-links">
          <li><Link to="/home">الرئيسية</Link></li>
          <li><Link to="/courses">قائمة الدورات</Link></li>
          <li><Link to="/instructors">المعلمين</Link></li>
          <li><Link to="/about">عن الأكاديمية</Link></li>
          <li><Link to="/contact">تواصل معنا</Link></li>
        </ul>
        <Link to="/login" className="btn btn-accent">تسجيل الدخول</Link>
      </div>
    </nav>
  );
};

export default Navbar;
