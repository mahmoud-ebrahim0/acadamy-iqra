import { useEffect, useState } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useLang } from '../../i18n/lang';
import { lightInputStyle } from '../../utils/styles';
import { formatSchedule, hasSchedule } from '../../utils/schedule';
import { formatReportDate, ratingTrend, TREND_ICON } from '../../utils/reports';
import StarRating from '../../components/StarRating';
import PaymentBadge from '../../components/PaymentBadge';
import AttendanceRecord from './AttendanceRecord';

const whatsappLink = (number) => `https://wa.me/${String(number).replace(/\D/g, '')}`;

/**
 * Everything about one student in one place (instructor view): details, schedule,
 * progress, attendance calendar and class reports.
 */
const StudentDetail = ({ enrollment: enr, onBack, onProgressSaved, onEditSchedule, onWriteReport, onAttendanceChanged }) => {
  const { t, lang } = useLang();
  const [progress, setProgress] = useState({ lesson: enr.currentAyahOrLesson === 'Beginning' ? '' : enr.currentAyahOrLesson || '', pct: enr.progressPercentage ?? 0 });
  const [progressStatus, setProgressStatus] = useState('');
  const [reports, setReports] = useState(null);

  useEffect(() => {
    fetchWithAuth(`/api/instructor/reports/${enr._id}`)
      .then(async res => { const data = await readJson(res); setReports(res.ok ? data.reports || [] : []); })
      .catch(() => setReports([]));
  }, [enr._id]);

  const saveProgress = async (e) => {
    e.preventDefault();
    const pct = Math.min(100, Math.max(0, Number(progress.pct) || 0));
    setProgressStatus('saving');
    try {
      const res = await fetchWithAuth(`/api/instructor/progress/${enr._id}`, {
        method: 'PUT',
        body: JSON.stringify({ currentAyahOrLesson: progress.lesson, progressPercentage: pct }),
      });
      if (!res.ok) throw new Error();
      setProgress(p => ({ ...p, pct }));
      setProgressStatus('saved');
      onProgressSaved?.(enr._id, { currentAyahOrLesson: progress.lesson, progressPercentage: pct });
    } catch {
      setProgressStatus('error');
    }
  };

  const memTrend = ratingTrend(reports || [], 'memorization');
  const tajTrend = ratingTrend(reports || [], 'tajweed');
  const schedule = hasSchedule(enr) ? formatSchedule(enr, lang) : '';

  return (
    <div className="sd-page">
      <button type="button" className="activity-back sd-back" onClick={onBack}>{lang === 'ar' ? '→' : '←'} {t('instructor.sd.back')}</button>

      {/* Header */}
      <section className="sd-head">
        <div className="sd-avatar" aria-hidden="true">{(enr.student?.name || '?').trim().charAt(0).toUpperCase()}</div>
        <div className="sd-head-main">
          <h2>{enr.student?.name} <PaymentBadge status={enr.paymentStatus} /></h2>
          <p>{enr.course?.title}</p>
          <div className="sd-chips">
            {enr.studentAge && <span>🎂 {t('instructor.age', { age: enr.studentAge })}</span>}
            {enr.level && <span>📚 {t(`instructor.level.${enr.level}`)}</span>}
            {enr.whatsapp && (
              <a href={whatsappLink(enr.whatsapp)} target="_blank" rel="noreferrer" className="wa">💬 <bdi>{enr.whatsapp}</bdi></a>
            )}
          </div>
        </div>
        <div className="sd-head-side">
          <div className="sd-schedule">
            <span>{t('instructor.sd.classTime')}</span>
            <strong className={schedule ? '' : 'none'}>{schedule || t('instructor.sched.none')}</strong>
          </div>
          <div className="sd-actions">
            <button type="button" className="sched-btn sched-btn-ghost" onClick={() => onEditSchedule(enr)}>{hasSchedule(enr) ? t('instructor.sched.edit') : t('instructor.sched.add')}</button>
            {enr.zoomLink && <a href={enr.zoomLink} target="_blank" rel="noreferrer" className="today-start">{t('instructor.startClass')}</a>}
          </div>
        </div>
      </section>

      {/* Progress */}
      <form className="sd-card sd-progress" onSubmit={saveProgress}>
        <h3>📈 {t('instructor.sd.progress')}</h3>
        <div className="sd-progress-row">
          <div className="acc-field" style={{ flex: 2 }}>
            <label htmlFor="sd-lesson">{t('instructor.col.lesson')}</label>
            <input id="sd-lesson" type="text" maxLength={200} value={progress.lesson} onChange={e => { setProgress({ ...progress, lesson: e.target.value }); setProgressStatus(''); }} placeholder={t('instructor.lessonPlaceholder')} style={lightInputStyle} />
          </div>
          <div className="acc-field" style={{ flex: 1, minWidth: '160px' }}>
            <label htmlFor="sd-pct">{t('instructor.col.progress')} — <strong>{Math.min(100, Math.max(0, Number(progress.pct) || 0))}%</strong></label>
            <input id="sd-pct" type="range" min="0" max="100" step="5" value={progress.pct} onChange={e => { setProgress({ ...progress, pct: e.target.value }); setProgressStatus(''); }} className="sd-range" />
          </div>
          <button type="submit" className="sched-btn sched-btn-primary" disabled={progressStatus === 'saving'}>{progressStatus === 'saving' ? t('account.saving') : t('instructor.sd.saveProgress')}</button>
        </div>
        {progressStatus === 'saved' && <span className="acc-status success">{t('instructor.saved')}</span>}
        {progressStatus === 'error' && <span className="acc-status error">{t('instructor.saveFailed')}</span>}
      </form>

      {/* Attendance + reports */}
      <div className="sd-grid">
        <AttendanceRecord enrollment={enr} title={t('instructor.sd.attendance')} subtitle={enr.course?.title} onChanged={(date, status) => onAttendanceChanged?.(enr._id, date, status)} />

        <section className="rep-history">
          <div className="rep-history-head">
            <h3>📝 {t('instructor.nav.reports').replace(/^\S+\s/, '')}</h3>
            <button type="button" className="sched-btn sched-btn-primary" onClick={() => onWriteReport(enr._id)}>{t('instructor.sd.writeReport')}</button>
          </div>
          {(memTrend.avg !== null || tajTrend.avg !== null) && (
            <div className="rep-trends">
              {[['memorization', memTrend], ['tajweed', tajTrend]].map(([key, trend]) => trend.avg !== null && (
                <div key={key} className="rep-trend">
                  <span>{t(`instructor.rep.${key}`)} · {t('instructor.rep.avgLast5')}</span>
                  <strong>{trend.avg.toFixed(1)} / 5</strong>
                  {trend.direction && <em className={trend.direction}>{TREND_ICON[trend.direction]} {t(`instructor.rep.trend.${trend.direction}`)}</em>}
                </div>
              ))}
            </div>
          )}
          {reports === null ? (
            <p style={{ color: 'var(--text-muted)' }}>{t('instructor.loading')}</p>
          ) : reports.length === 0 ? (
            <p className="rep-empty">{t('instructor.rep.empty', { name: enr.student?.name || '' })}</p>
          ) : (
            <ul className="rep-list">
              {reports.map(r => (
                <li key={r.date}>
                  <div className="rep-item-head"><strong>{formatReportDate(r.date, lang)}</strong></div>
                  {r.recited && <p><b>{t('instructor.rep.recitedShort')}:</b> {r.recited}</p>}
                  {r.homework && <p className="rep-homework"><b>📌 {t('instructor.rep.homeworkShort')}:</b> {r.homework}</p>}
                  {(r.memorization || r.tajweed) && (
                    <div className="rep-item-stars">
                      {r.memorization && <span>{t('instructor.rep.memorization')} <StarRating value={r.memorization} size="0.95rem" /></span>}
                      {r.tajweed && <span>{t('instructor.rep.tajweed')} <StarRating value={r.tajweed} size="0.95rem" /></span>}
                    </div>
                  )}
                  {r.notes && <p className="rep-notes">💬 {r.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDetail;
