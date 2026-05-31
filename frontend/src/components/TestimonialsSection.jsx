import React from 'react';

const TestimonialsSection = () => {
  return (
    <section className="section testimonials">
      <div className="container">
        <h2 className="section-title">آراء أولياء الأمور</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "السلام عليكم أخ ساهر، مبارك عليك أحسبها صدقة جارية لك و لوالديك إلى يوم الدين، وشكر الله لك هذا بفضل مجهوداتك و صبرك و طيبتك مع تيسير و إلياس، كسبت ثقتهم و أحبا الدرس معك فإذا وصلا لهذا المستوى فهذا بفضل الله و سعة صدرك معهما..."
            </p>
            <h4 style={{ color: 'var(--primary-color)' }}>- ولي أمر (تيسير وإلياس)</h4>
          </div>
          
          <div className="testimonial-card">
            <p className="testimonial-text">
              "بارك الله في جهودكم وجزاكم الله عنا خير الجزاء.. بنتي لها شهر في دورة اللغه العربيه وهي تحب وتريد البقاء في هذه الدورة التدريبية لما وجدت فيها من لطف وعنايه المعلمه"
            </p>
            <h4 style={{ color: 'var(--primary-color)' }}>- والدة طالبة</h4>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-text">
              "نحن نقطن بفرنسا، وجدت صعوبة لتعليمهم اللغة العربية، لكن بفضل الله وبفضل جهود معلمتها الأستاذة بنان صالح، بدأت آسية في تعلم الحروف وإتقان كتابتها ولفظها. خاصة وان آسية لم تكن تتقن الحروف قبل بداية التعليم مع اكاديمية اقرأ. جزاكم الله خيرا"
            </p>
            <h4 style={{ color: 'var(--primary-color)' }}>- والد الطالبة آسية (فرنسا)</h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
