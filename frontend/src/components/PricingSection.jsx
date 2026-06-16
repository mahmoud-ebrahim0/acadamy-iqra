import React from 'react';

const PricingSection = ({ openModal }) => {
  return (
    <section id="pricing" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">Investment in Your Hereafter</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem' }}>
            Choose the right study track designed to elevate your Quranic journey from foundation to mastery.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Plan 1 */}
          <div className="pricing-card">
            <h3 style={{ fontSize: '1.8rem', color: 'var(--text-color)' }}>Al-Bara'im</h3>
            <p style={{ color: 'var(--text-muted)' }}>For kids & beginners</p>
            <div className="pricing-price">$35<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <ul className="pricing-features">
              <li>Noorani Qaida & Foundation</li>
              <li>Short Surahs Memorization</li>
              <li>Basic Islamic Ethics</li>
              <li>Interactive Games & Stories</li>
              <li>2 Live Classes / Week</li>
            </ul>
            <button className="btn btn-outline" onClick={openModal} style={{ width: '100%' }}>Book Free Trial</button>
          </div>

          {/* Plan 2 */}
          <div className="pricing-card premium">
            <div style={{ position: 'absolute', top: '15px', right: '-35px', background: 'var(--primary-color)', color: 'white', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '0.8rem', fontWeight: 'bold' }}>POPULAR</div>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>Al-Murattilin</h3>
            <p style={{ color: 'var(--text-muted)' }}>For intermediate reciters</p>
            <div className="pricing-price">$60<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <ul className="pricing-features">
              <li>Intensive Tajweed Rules</li>
              <li>Structured Memorization Plan</li>
              <li>Tafseer of Memorized Surahs</li>
              <li>Makharij Correction</li>
              <li>3 Live Classes / Week</li>
            </ul>
            <button className="btn btn-accent" onClick={openModal} style={{ width: '100%', boxShadow: '0 5px 15px rgba(250, 204, 21, 0.3)' }}>Book Free Trial</button>
          </div>

          {/* Plan 3 */}
          <div className="pricing-card">
            <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-color)' }}>Al-Huffadh</h3>
            <p style={{ color: 'var(--text-muted)' }}>Advanced mastery & Sanad</p>
            <div className="pricing-price">$90<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <ul className="pricing-features">
              <li>10 Qira'at Foundations</li>
              <li>Talaqqi & Mushafahah</li>
              <li>Ijazah with Sanad Muttasil</li>
              <li>Direct 1-on-1 with Elite Azhar Scholars</li>
              <li>Flexible Premium Scheduling</li>
            </ul>
            <button className="btn btn-outline" onClick={openModal} style={{ width: '100%' }}>Book Free Trial</button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;
