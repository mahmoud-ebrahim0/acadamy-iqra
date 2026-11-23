import { useCallback, useEffect, useState } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useLang } from '../../i18n/lang';
import { WEEK_ORDER, dayName } from '../../utils/schedule';

const MAX_DAYS_BACK = 90; // same limit as the server

// Dates are "YYYY-MM-DD" strings in the instructor's local time.
const toDateString = (date) => date.toLocaleDateString('en-CA');
const pad = (n) => String(n).padStart(2, '0');
const shiftMonth = (month, delta) => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const NEXT_STATUS = { undefined: 'Present', Present: 'Absent', Absent: null };

/**
 * Monthly attendance calendar for one student. Click a day to cycle:
 * not recorded → present → absent → not recorded. Future days and days older than MAX_DAYS_BACK are locked.
 * readOnly: view only (admin follow-up page, student dashboard). `endpoint` picks the API (instructor or student).
 */
const AttendanceRecord = ({ enrollment, onChanged, readOnly = false, endpoint = '/api/instructor/attendance/', title, subtitle }) => {
  const { t, lang } = useLang();
  const today = toDateString(new Date());
  const minDate = (() => { const d = new Date(); d.setDate(d.getDate() - MAX_DAYS_BACK); return toDateString(d); })();

  const [month, setMonth] = useState(today.slice(0, 7));
  const [records, setRecords] = useState({}); // date -> status
  const [allTime, setAllTime] = useState({ present: 0, absent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingDate, setSavingDate] = useState(null);

  const load = useCallback(async (m) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`${endpoint}${enrollment._id}?month=${m}`);
      const data = await readJson(res);
      if (!res.ok) { setError(t.server(data.message) || t('instructor.att.loadError')); return; }
      setRecords(Object.fromEntries(data.records.map(r => [r.date, r.status])));
      setAllTime(data.allTime);
    } catch {
      setError(t('account.connection'));
    } finally {
      setLoading(false);
    }
  }, [enrollment._id, endpoint, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the month from the API
    load(month);
  }, [month, load]);

  const toggleDay = async (date) => {
    const previous = records[date];
    const next = NEXT_STATUS[previous];
    setSavingDate(date);
    setError('');
    setRecords(prev => ({ ...prev, [date]: next || undefined }));
    try {
      const res = await fetchWithAuth('/api/instructor/attendance', {
        method: 'POST',
        body: JSON.stringify({ enrollmentId: enrollment._id, status: next, date }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(t.server(data.message));
      setAllTime(prev => {
        const updated = { ...prev };
        if (previous === 'Present') updated.present -= 1;
        if (previous === 'Absent') updated.absent -= 1;
        if (next === 'Present') updated.present += 1;
        if (next === 'Absent') updated.absent += 1;
        return updated;
      });
      onChanged?.(date, next);
    } catch (err) {
      setRecords(prev => ({ ...prev, [date]: previous }));
      setError(err.message || t('instructor.saveFailed'));
    } finally {
      setSavingDate(null);
    }
  };

  // --- calendar grid ---
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
  const leadingBlanks = WEEK_ORDER.indexOf(firstWeekday);
  const classDays = enrollment.scheduleDays || [];
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { day, date: `${month}-${pad(day)}`, weekday: new Date(year, monthNumber - 1, day).getDay() };
    }),
  ];

  const monthValues = Object.entries(records).filter(([d, s]) => d.startsWith(month) && s);
  const presentCount = monthValues.filter(([, s]) => s === 'Present').length;
  const absentCount = monthValues.filter(([, s]) => s === 'Absent').length;
  const rate = presentCount + absentCount ? Math.round((presentCount / (presentCount + absentCount)) * 100) : null;
  const allTimeTotal = allTime.present + allTime.absent;
  const monthTitle = new Date(year, monthNumber - 1, 1).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { month: 'long', year: 'numeric' });

  return (
    <section className="att-record">
      <div className="att-record-head">
        <div>
          <h3>{title ?? enrollment.student?.name}</h3>
          <p>{subtitle ?? enrollment.course?.title}</p>
        </div>
      </div>

      <div className="att-summary">
        <div className="att-stat present"><strong>{presentCount}</strong><span>{t('instructor.att.present')}</span></div>
        <div className="att-stat absent"><strong>{absentCount}</strong><span>{t('instructor.att.absent')}</span></div>
        <div className="att-stat rate"><strong>{rate === null ? '—' : `${rate}%`}</strong><span>{t('instructor.att.rate')}</span></div>
        <div className="att-stat total">
          <strong>{allTimeTotal ? `${Math.round((allTime.present / allTimeTotal) * 100)}%` : '—'}</strong>
          <span>{t('instructor.att.allTime', { present: allTime.present, total: allTimeTotal })}</span>
        </div>
      </div>

      <div className="att-nav">
        <button type="button" onClick={() => setMonth(m => shiftMonth(m, -1))} aria-label={t('instructor.att.prev')}>{lang === 'ar' ? '›' : '‹'}</button>
        <strong>{monthTitle}</strong>
        <button type="button" onClick={() => setMonth(m => shiftMonth(m, 1))} disabled={month >= today.slice(0, 7)} aria-label={t('instructor.att.next')}>{lang === 'ar' ? '‹' : '›'}</button>
      </div>

      <div className={`att-grid ${loading ? 'loading' : ''}`}>
        {WEEK_ORDER.map(d => <div key={`h${d}`} className="att-weekday">{dayName(d, lang)}</div>)}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`b${i}`} />;
          const status = records[cell.date];
          const locked = cell.date > today || cell.date < minDate;
          const classes = [
            'att-day',
            readOnly ? 'readonly' : '',
            status ? status.toLowerCase() : '',
            classDays.includes(cell.weekday) ? 'class-day' : '',
            cell.date === today ? 'today' : '',
            locked ? 'locked' : '',
          ].join(' ');
          return (
            <button
              key={cell.date}
              type="button"
              className={classes}
              disabled={readOnly || locked || loading || savingDate === cell.date}
              onClick={() => toggleDay(cell.date)}
              title={status ? t(`instructor.att.${status === 'Present' ? 'present' : 'absent'}`) : t('instructor.att.notRecorded')}
            >
              <span className="att-num">{cell.day}</span>
              <span className="att-mark" aria-hidden="true">{status === 'Present' ? '✓' : status === 'Absent' ? '✕' : ''}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="sched-error">{error}</p>}

      <div className="att-legend">
        <span><i className="dot present" />{t('instructor.att.present')}</span>
        <span><i className="dot absent" />{t('instructor.att.absent')}</span>
        {classDays.length > 0 && <span><i className="dot class" />{t('instructor.att.classDay')}</span>}
        {!readOnly && <span className="hint">{t('instructor.att.hint', { days: MAX_DAYS_BACK })}</span>}
      </div>
    </section>
  );
};

export default AttendanceRecord;
