import { useState } from 'react';

import { homeContent } from '../i18n/homeContent';
import { useSiteContent } from '../utils/useSiteContent';

const DEFAULTS = { en: homeContent.en.faq, ar: homeContent.ar.faq };

/** Questions and answers are edited by the admin (Dashboard → Website Content → FAQ). */
const FAQSection = () => {
  const { ready, data } = useSiteContent('faq', DEFAULTS);
  const faqs = data.sections.map(s => ({ question: s.heading, answer: s.text }));
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (!ready || faqs.length === 0) return null;

  return (
    <section id="faq" className="section" style={{ background: 'var(--bg-color)' }}>
      <div className="container">
        <h2 className="section-title">{data.title}</h2>
        {data.intro && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.2rem' }}>
            {data.intro}
          </p>
        )}

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
                <p style={{ whiteSpace: 'pre-line' }}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
