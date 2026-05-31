// In-memory store for demonstration without requiring MongoDB setup
export const courses = [
  { id: 1, age: 'للأطفال 5 سنوات', title: 'دورة قراءة وكتابة الحروف العربية', category: 'لغة عربية', icon: '📝' },
  { id: 2, age: 'للأطفال 6 - 8 سنوات', title: 'دورة التهيئة الشاملة للعربية', category: 'لغة عربية', icon: '📚' },
  { id: 3, age: 'للأطفال 8 - 15 سنة', title: 'دورة تلاوة جزء عم', category: 'قرآن كريم', icon: '📖' },
];

export const instructors = [
  { id: 1, name: 'أ. علي قوجة', role: 'معلم قرآن كريم وعلوم شرعية', initial: 'ع' },
  { id: 2, name: 'آ. بنان صالح', role: 'معلمة قرآن كريم', initial: 'ب' },
];
