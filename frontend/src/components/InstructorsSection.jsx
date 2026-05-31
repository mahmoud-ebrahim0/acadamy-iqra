import React from 'react';

const instructorsData = [
  { id: 1, name: 'أ. علي قوجة', role: 'معلم قرآن كريم وعلوم شرعية', initial: 'ع' },
  { id: 2, name: 'أ. عبدالرحمن خليل', role: 'معلم قرآن كريم وعلوم شرعية', initial: 'ع' },
  { id: 3, name: 'أ. أحمد سينو', role: 'معلم لغة عربية', initial: 'أ' },
  { id: 4, name: 'آ. ريعان دندش', role: 'معلمة قرآن كريم', initial: 'ر' },
  { id: 5, name: 'آ. بنان صالح', role: 'معلمة قرآن كريم', initial: 'ب' },
  { id: 6, name: 'آ. جمانة قبلان', role: 'معلمة لغة عربية', initial: 'ج' },
];

const InstructorsSection = () => {
  return (
    <section className="section instructors">
      <div className="container">
        <h2 className="section-title">نخبة من المعلمين والمعلمات</h2>
        <div className="instructors-grid">
          {instructorsData.map(inst => (
            <div key={inst.id} className="instructor-card">
              <div className="instructor-avatar">{inst.initial}</div>
              <h3 className="instructor-name">{inst.name}</h3>
              <p className="instructor-role">{inst.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorsSection;
