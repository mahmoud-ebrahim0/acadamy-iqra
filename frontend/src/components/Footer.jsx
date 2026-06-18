import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>Tarteel Academy</h3>
            <p style={{ opacity: 0.8 }}>We help parents raise their children on the Islamic curriculum and proper Arabic language.</p>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/courses">Courses List</Link></li>
              <li><Link to="/instructors">Instructors</Link></li>
              <li><Link to="/about">About Academy</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Policies</h3>
            <ul className="footer-links">
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Contact Us</h3>
            <ul className="footer-links">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noreferrer">Youtube</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Tarteel Educational Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
