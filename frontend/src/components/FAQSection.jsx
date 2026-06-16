import React, { useState } from 'react';

const faqs = [
  {
    question: 'How do I start my learning journey?',
    answer: 'The first step is to enroll and fill out a quick form. We will then schedule a Free Evaluation Session to assess your exact level and find the right customized class and schedule for you.'
  },
  {
    question: 'Are the lessons recorded?',
    answer: 'Yes! All lessons are recorded and uploaded securely to your private student dashboard. You can review them anytime to reinforce your academic progress.'
  },
  {
    question: 'Who will be my teachers?',
    answer: 'We carefully select our teachers to maintain the highest quality. All our instructors are highly qualified scholars from Al-Azhar Al-Sharif with long experience in teaching Quran, Qiraat, Tajweed & Arabic. They are also Ijazah holders.'
  },
  {
    question: 'Do the classes fit my schedule?',
    answer: 'Absolutely. We offer flexible scheduling depending on the student’s preferences. Since many of our courses are Private 1-to-1, you can choose the time that works best for you and your family.'
  },
  {
    question: 'Can I choose to have a female teacher?',
    answer: 'Yes, you can. We have a dedicated Women\'s Academy with qualified female teachers from Al-Azhar who are more than happy to teach sisters and children with absolute privacy.'
  }
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section" style={{ background: 'var(--bg-color)' }}>
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.2rem' }}>
          You Ask, We Answer
        </p>

        <div className="faq-accordion">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <button 
                className="faq-question" 
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
              >
                {faq.question}
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
