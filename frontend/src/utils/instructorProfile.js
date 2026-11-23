// Shared helpers for an instructor's public profile (photo + bio).

const FEMALE_HINTS = ['ustazah', 'ustadha', 'ustadhah', 'sheikha', 'female', 'أستاذة', 'الأستاذة', 'الشيخة', 'معلمة', 'المعلمة'];

/** The uploaded photo, or a default picture by gender (older records: guessed from the name/title). */
export const instructorImage = (inst) => {
  if (inst?.photoUrl) return inst.photoUrl;
  if (inst?.gender === 'female') return '/niqab.png';
  if (inst?.gender === 'male') return '/sheikh.png';
  const text = `${inst?.name || ''} ${inst?.rank || ''}`.toLowerCase();
  return FEMALE_HINTS.some(hint => text.includes(hint)) ? '/niqab.png' : '/sheikh.png';
};

/** Bio in the current language, falling back to the other language. */
export const instructorBio = (inst, lang) =>
  (lang === 'ar' ? inst?.bioAr || inst?.bioEn : inst?.bioEn || inst?.bioAr) || '';
