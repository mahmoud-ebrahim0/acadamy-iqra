// Class schedule helpers shared by the student, instructor and admin pages.
// An enrollment has either a structured schedule (scheduleDays + scheduleClock, set by the instructor)
// or an older free-text scheduleTime (set by the admin).

// Week order shown in the day picker: Saturday first (common in Egypt / the Arab world).
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

const DAY_NAMES = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

export const dayName = (day, lang) => (DAY_NAMES[lang] || DAY_NAMES.en)[day];

/** "19:30" -> "7:30 PM" / "7:30 م" */
export const formatClock = (clock, lang) => {
  const match = /^(\d{2}):(\d{2})$/.exec(clock || '');
  if (!match) return '';
  const hours = Number(match[1]);
  const suffix = lang === 'ar' ? (hours < 12 ? 'ص' : 'م') : (hours < 12 ? 'AM' : 'PM');
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
};

/** Date of the next class (today later than now, or a coming day), or null without a day/time schedule. */
export const nextClassDate = (enr, now = new Date()) => {
  if (!enr?.scheduleDays?.length || !/^\d{2}:\d{2}$/.test(enr.scheduleClock || '')) return null;
  const [h, m] = enr.scheduleClock.split(':').map(Number);
  for (let offset = 0; offset <= 7; offset += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    d.setHours(h, m, 0, 0);
    if (enr.scheduleDays.includes(d.getDay()) && d > now) return d;
  }
  return null;
};

export const hasSchedule = (enr) => Boolean(enr?.scheduleDays?.length || enr?.scheduleTime);

/** Human-readable schedule in the current language, e.g. "Sun & Wed – 7:00 PM" / "الأحد و الأربعاء – 7:00 م". */
export const formatSchedule = (enr, lang) => {
  if (enr?.scheduleDays?.length) {
    const days = WEEK_ORDER.filter(d => enr.scheduleDays.includes(d)).map(d => dayName(d, lang));
    return `${days.join(lang === 'ar' ? ' و ' : ' & ')} – ${formatClock(enr.scheduleClock, lang)}`;
  }
  return enr?.scheduleTime || '';
};
