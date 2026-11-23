// Helpers for class reports (ratings 1–5 for memorization and tajweed).

const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

/**
 * Average of the latest `window` ratings and the trend against the `window` before them.
 * `reports` must be sorted newest first. Returns { avg, direction: 'up' | 'down' | 'same' | null }.
 */
export const ratingTrend = (reports, key, window = 5) => {
  const values = reports.map(r => r[key]).filter(v => typeof v === 'number');
  const recent = average(values.slice(0, window));
  const previous = average(values.slice(window, window * 2));
  let direction = null;
  if (recent !== null && previous !== null) {
    direction = recent - previous > 0.2 ? 'up' : previous - recent > 0.2 ? 'down' : 'same';
  }
  return { avg: recent, direction };
};

export const TREND_ICON = { up: '▲', down: '▼', same: '●' };

/** "2026-11-22" -> "Sun, 22 Nov" / "الأحد، ٢٢ نوفمبر" */
export const formatReportDate = (date, lang) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
