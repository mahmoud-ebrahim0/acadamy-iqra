import { useCallback, useEffect, useState } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useLang } from '../../i18n/lang';
import AttendanceRecord from './AttendanceRecord';
import PaymentBadge from '../../components/PaymentBadge';

const EMPTY = { present: 0, absent: 0, monthPresent: 0, monthAbsent: 0, lastDate: null };
const percent = (present, absent) => (present + absent ? Math.round((present / (present + absent)) * 100) : null);
const rateClass = (rate) => (rate === null ? '' : rate >= 80 ? 'good' : rate >= 50 ? 'ok' : 'low');

/**
 * Instructor "Attendance" page: a table of all students with their attendance numbers,
 * and the monthly calendar of the selected student underneath.
 */
const AttendancePage = ({ students, onChanged }) => {
  const { t, lang } = useLang();
  const [summary, setSummary] = useState({});
  const [selectedId, setSelectedId] = useState(students[0]?._id || null);
  const selected = students.find(s => s._id === selectedId);

  const loadSummary = useCallback(async () => {
    try {
      const month = new Date().toLocaleDateString('en-CA').slice(0, 7);
      const res = await fetchWithAuth(`/api/instructor/attendance-summary?month=${month}`);
      const data = await readJson(res);
      if (res.ok) setSummary(data.summary || {});
    } catch (err) {
      console.error('Failed to load attendance summary:', err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API
    loadSummary();
  }, [loadSummary]);

  const formatDate = (date) =>
    date ? new Date(`${date}T00:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' }) : '—';

  if (students.length === 0) {
    return <p className="today-empty">{t('instructor.noStudents')}</p>;
  }

  return (
    <div className="att-page">
      <div className="att-table-card">
        <div className="att-table-scroll">
          <table className="att-table">
            <thead>
              <tr>
                <th>{t('instructor.col.student')}</th>
                <th>{t('instructor.att.col.monthPresent')}</th>
                <th>{t('instructor.att.col.monthAbsent')}</th>
                <th>{t('instructor.att.col.monthRate')}</th>
                <th>{t('instructor.att.col.allRate')}</th>
                <th>{t('instructor.att.col.last')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map(enr => {
                const s = summary[enr._id] || EMPTY;
                const monthRate = percent(s.monthPresent, s.monthAbsent);
                const allRate = percent(s.present, s.absent);
                const isSelected = enr._id === selectedId;
                return (
                  <tr
                    key={enr._id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => setSelectedId(enr._id)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(enr._id); } }}
                    aria-selected={isSelected}
                  >
                    <td>
                      <div className="att-student">{enr.student?.name} <PaymentBadge status={enr.paymentStatus} /></div>
                      <div className="att-course">{enr.course?.title}</div>
                    </td>
                    <td className="num present">{s.monthPresent}</td>
                    <td className="num absent">{s.monthAbsent}</td>
                    <td><span className={`att-rate ${rateClass(monthRate)}`}>{monthRate === null ? '—' : `${monthRate}%`}</span></td>
                    <td><span className={`att-rate ${rateClass(allRate)}`}>{allRate === null ? '—' : `${allRate}%`}</span></td>
                    <td className="muted">{formatDate(s.lastDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="att-table-hint">{t('instructor.att.pick')}</p>
      </div>

      {selected && (
        <AttendanceRecord
          key={selected._id}
          enrollment={selected}
          onChanged={(date, status) => { loadSummary(); onChanged?.(selected._id, date, status); }}
        />
      )}
    </div>
  );
};

export default AttendancePage;
