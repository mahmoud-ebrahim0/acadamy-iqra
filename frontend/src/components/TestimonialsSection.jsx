import React from 'react';

const TestimonialsSection = () => {
  return (
    <section className="section testimonials" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Cosmic Elements */}
      <div className="cosmic-swirl swirl-1" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(250, 204, 21, 0.08)', width: '600px', height: '600px' }}></div>
      <div className="asteroid" style={{ top: '20%', left: '20%', width: '18px', height: '18px', animationDelay: '4s' }}></div>
      <div className="asteroid" style={{ top: '80%', right: '20%', width: '14px', height: '14px', animationDelay: '9s' }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Parents' Testimonials</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="testimonial-card" style={{ borderLeft: '4px solid var(--accent-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(56, 189, 248, 0.05)' }}>
            <p className="testimonial-text" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              "Peace be upon you Brother Saher, congratulations to you, I consider this a continuous charity for you and your parents... Your patience and kindness with Tayseer and Elias won their trust and they loved the lessons with you. Reaching this level is thanks to Allah and your patience with them..."
            </p>
            <h4 style={{ color: 'var(--accent-color)', textShadow: '0 0 10px rgba(56, 189, 248, 0.4)' }}>- Parent of (Tayseer and Elias)</h4>
          </div>
          
          <div className="testimonial-card" style={{ borderLeft: '4px solid var(--primary-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(250, 204, 21, 0.05)' }}>
            <p className="testimonial-text" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              "May Allah bless your efforts and reward you... My daughter has been in the Arabic language course for a month and she loves it and wants to stay in this training course because of the kindness and care she found from the teacher."
            </p>
            <h4 style={{ color: 'var(--primary-color)', textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>- A Student's Mother</h4>
          </div>

          <div className="testimonial-card" style={{ borderLeft: '4px solid var(--accent-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(56, 189, 248, 0.05)' }}>
            <p className="testimonial-text" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              "We live in France, and I found it difficult to teach them Arabic, but thanks to Allah and the efforts of her teacher Ms. Banan Saleh, Asiya started learning the letters, mastering their writing and pronunciation. Especially since Asiya did not master the letters before she started learning with Tarteel Academy. May Allah reward you."
            </p>
            <h4 style={{ color: 'var(--accent-color)', textShadow: '0 0 10px rgba(56, 189, 248, 0.4)' }}>- Father of Asiya (France)</h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
