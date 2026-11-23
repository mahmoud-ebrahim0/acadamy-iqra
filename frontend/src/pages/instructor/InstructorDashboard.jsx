import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth, readJson } from '../../utils/api';
import { clearSession, getUserName } from '../../utils/auth';
import { useLang } from '../../i18n/lang';
import { cardStyle, lightInputStyle } from '../../utils/styles';
import LangToggle from '../../components/LangToggle';
import AccountProfileCard from '../../components/AccountProfileCard';
import SecurityCard from '../../components/SecurityCard';
import AttendancePage from './AttendancePage';
import PaymentBadge from '../../components/PaymentBadge';
import PublicProfileCard from './PublicProfileCard';
import StudentDetail from './StudentDetail';
import ReportsPage from './ReportsPage';
import { WEEK_ORDER, dayName, formatClock, formatSchedule, hasSchedule } from '../../utils/schedule';

// Sidebar sections and their pages.
const TAB_GROUPS = [
  { key: 'main', tabs: ['dashboard', 'schedule'] },
  { key: 'students', tabs: ['students', 'attendance', 'reports'] },
  { key: 'account', tabs: ['wallet', 'account'] },
];
const PAYOUT_METHODS = ['Vodafone Cash', 'InstaPay', 'PayPal', 'Bank Transfer'];
const EMPTY_PAYOUT = { amount: '', method: 'Vodafone Cash', details: '' };
const TITLES = new Set(['sheikh', 'shaykh', 'shaikh', 'ustadh', 'ustadha', 'ustaz', 'ustaza', 'dr', 'dr.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.',
  'الشيخ', 'شيخ', 'الأستاذ', 'الأستاذة', 'أستاذ', 'أستاذة', 'الاستاذ', 'الاستاذة', 'د.', 'دكتور', 'الدكتور']);
const CLASS_MINUTES = 60; // a class counts as "now" for this long after it starts

// "YYYY-MM-DD" in the instructor's own time zone.
const localToday = () => new Date().toLocaleDateString('en-CA');
const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;
const whatsappLink = (number) => `https://wa.me/${String(number).replace(/\D/g, '')}`;

const thStyle = { padding: '1rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'start', whiteSpace: 'nowrap' };
const tdStyle = { padding: '1rem', verticalAlign: 'middle' };

const SidebarLink = ({ id, label, activeTab, onSelect }) => (
  <button
    onClick={() => onSelect(id)}
    className={activeTab === id ? 'active' : ''}
    style={{
      display: 'block', width: '100%', textAlign: 'start', background: 'none', border: 'none',
      padding: '0.5rem 0.9rem', borderRadius: '0.55rem', fontFamily: 'inherit', lineHeight: 1.4,
      color: activeTab === id ? '#ffffff' : 'rgba(255,255,255,0.7)',
      backgroundColor: activeTab === id ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
      fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
    }}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, color }) => (
  <div style={{
    ...cardStyle,
    padding: '1.1rem 1.4rem',
    border: '1px solid rgba(0, 0, 0, 0.14)',
    borderTop: `3px solid ${color}`,
    borderInlineStart: `3px solid ${color}`, // side accent (right in Arabic, left in English)
    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
  }}>
    <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
    <div style={{ fontSize: '2.1rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
  </div>
);

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [students, setStudents] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [stats, setStats] = useState({ presentThisMonth: 0, absentThisMonth: 0 });
  const [wallet, setWallet] = useState({ pendingTotal: 0, paidTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [rowStatus, setRowStatus] = useState({}); // enrollmentId -> 'saved' | 'error'

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutReq, setPayoutReq] = useState(EMPTY_PAYOUT);
  const [payoutError, setPayoutError] = useState('');

  // Student to open on the Class Reports page (e.g. from "Today's classes").
  const [reportFor, setReportFor] = useState(null);
  const openReport = (enrollmentId) => { setReportFor(enrollmentId); setStudentViewId(null); setActiveTab('reports'); };

  // Student page (everything about one student). Opened by clicking a student's name.
  const [studentViewId, setStudentViewId] = useState(null);
  const openStudent = (enrollmentId) => { setStudentViewId(enrollmentId); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const viewButton = (enr) => (
    <button type="button" className="view-btn" onClick={() => openStudent(enr._id)} title={t('instructor.sd.open')} aria-label={`${t('instructor.sd.open')}: ${enr.student?.name || ''}`}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    </button>
  );

  // Schedule editor (days, time, Zoom link) for one student.
  const [scheduleEdit, setScheduleEdit] = useState(null); // { enrollment, days, time, zoomLink }
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Name to greet with: skip a leading title such as "Sheikh" or "الأستاذة" (e.g. "Sheikh Abdullah Al-Masri" -> "Abdullah").
  const nameWords = (getUserName() || t('instructor.defaultName')).trim().split(/\s+/);
  const firstName = (nameWords.length > 1 && TITLES.has(nameWords[0].toLowerCase()) ? nameWords[1] : nameWords[0]);

  // The server identifies the instructor from the login token.
  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/instructor/dashboard?date=${localToday()}`);
      const data = await readJson(res);
      if (!res.ok) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      setStudents(data.students || []);
      setPayouts(data.payouts || []);
      setAttendance(data.attendance || {});
      setStats(data.stats || { presentThisMonth: 0, absentThisMonth: 0 });
      setWallet(data.wallet || { pendingTotal: 0, paidTotal: 0 });
    } catch (err) {
      console.error(err);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API on mount
    fetchDashboardData();
  }, [fetchDashboardData]);

  const flashRow = (id, state) => {
    setRowStatus(prev => ({ ...prev, [id]: state }));
    setTimeout(() => setRowStatus(prev => ({ ...prev, [id]: undefined })), 2500);
  };

  const handleLogout = () => {
    clearSession();
    navigate('/home');
  };

  // Edit locally while typing; save when the field loses focus.
  const updateStudentField = (id, field, value) => {
    setStudents(prev => prev.map(s => (s._id === id ? { ...s, [field]: value } : s)));
  };

  const saveProgress = async (enrollment) => {
    const pct = Math.min(100, Math.max(0, Number(enrollment.progressPercentage) || 0));
    updateStudentField(enrollment._id, 'progressPercentage', pct);
    try {
      const res = await fetchWithAuth(`/api/instructor/progress/${enrollment._id}`, {
        method: 'PUT',
        body: JSON.stringify({ currentAyahOrLesson: enrollment.currentAyahOrLesson, progressPercentage: pct })
      });
      flashRow(enrollment._id, res.ok ? 'saved' : 'error');
    } catch {
      flashRow(enrollment._id, 'error');
    }
  };

  // Clicking the selected status again clears it.
  const handleAttendance = async (enrollmentId, status) => {
    const previous = attendance[enrollmentId];
    const next = previous === status ? null : status;
    setAttendance(prev => ({ ...prev, [enrollmentId]: next }));
    try {
      const res = await fetchWithAuth('/api/instructor/attendance', {
        method: 'POST',
        body: JSON.stringify({ enrollmentId, status: next, date: localToday() })
      });
      if (!res.ok) throw new Error('save failed');
      flashRow(enrollmentId, 'saved');
      setStats(prev => {
        const updated = { ...prev };
        if (previous === 'Present') updated.presentThisMonth -= 1;
        if (previous === 'Absent') updated.absentThisMonth -= 1;
        if (next === 'Present') updated.presentThisMonth += 1;
        if (next === 'Absent') updated.absentThisMonth += 1;
        return updated;
      });
    } catch {
      setAttendance(prev => ({ ...prev, [enrollmentId]: previous }));
      flashRow(enrollmentId, 'error');
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setPayoutError('');
    try {
      const res = await fetchWithAuth('/api/instructor/payouts', {
        method: 'POST',
        body: JSON.stringify(payoutReq)
      });
      const data = await readJson(res);
      if (!res.ok) {
        setPayoutError(t.server(data.message) || t('instructor.payout.failed'));
        return;
      }
      fetchDashboardData();
      setIsPayoutModalOpen(false);
      setPayoutReq(EMPTY_PAYOUT);
    } catch {
      setPayoutError(t('account.connection'));
    }
  };

  const openScheduleEditor = (enr) => {
    setScheduleError('');
    setScheduleEdit({ enrollment: enr, days: enr.scheduleDays || [], time: enr.scheduleClock || '', zoomLink: enr.zoomLink || '' });
  };

  const toggleDay = (day) => setScheduleEdit(prev => ({
    ...prev,
    days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
  }));

  const saveSchedule = async (e, clear = false) => {
    e?.preventDefault();
    if (!clear && scheduleEdit.days.length === 0) { setScheduleError(t('instructor.sched.chooseDays')); return; }
    if (!clear && !scheduleEdit.time) { setScheduleError(t('instructor.sched.chooseTime')); return; }
    setScheduleSaving(true);
    setScheduleError('');
    try {
      const body = clear
        ? { days: [], time: '', zoomLink: scheduleEdit.zoomLink }
        : { days: scheduleEdit.days, time: scheduleEdit.time, zoomLink: scheduleEdit.zoomLink.trim() };
      const res = await fetchWithAuth(`/api/instructor/schedule/${scheduleEdit.enrollment._id}`, { method: 'PUT', body: JSON.stringify(body) });
      const data = await readJson(res);
      if (!res.ok) { setScheduleError(t.server(data.message) || t('instructor.saveFailed')); return; }
      setStudents(prev => prev.map(s => (s._id === data._id ? { ...s, ...data } : s)));
      setScheduleEdit(null);
    } catch {
      setScheduleError(t('account.connection'));
    } finally {
      setScheduleSaving(false);
    }
  };

  const scheduled = students.filter(hasSchedule);
  const sidebarProps = { activeTab: studentViewId ? 'students' : activeTab, onSelect: (tab) => { setStudentViewId(null); setActiveTab(tab); } };

  // --- Today's classes (students whose class days include today), sorted by time ---
  const now = new Date();
  const todayLabel = now.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const todaysClasses = students
    .filter(s => s.scheduleDays?.includes(now.getDay()) && s.scheduleClock)
    .sort((a, b) => a.scheduleClock.localeCompare(b.scheduleClock));
  // Students with an old free-text time can't be placed on a day automatically.
  const unscheduledToday = students.filter(s => !s.scheduleDays?.length && s.scheduleTime).length;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (clock) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5));
  const nextClass = todaysClasses.find(s => toMinutes(s.scheduleClock) > nowMinutes);
  // 'now' = started within the last hour, 'next' = the next one today, 'done' = earlier today.
  const classState = (clock) => {
    const start = toMinutes(clock);
    if (nowMinutes >= start && nowMinutes < start + CLASS_MINUTES) return 'now';
    if (nextClass && clock === nextClass.scheduleClock) return 'next';
    return nowMinutes >= start + CLASS_MINUTES ? 'done' : '';
  };

  const attendanceButton = (enrollmentId, status, color) => {
    const active = attendance[enrollmentId] === status;
    return (
      <button
        onClick={() => handleAttendance(enrollmentId, status)}
        aria-pressed={active}
        style={{
          padding: '0.45rem 0.9rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit',
          border: `1px solid ${active ? color : 'rgba(0,0,0,0.12)'}`,
          background: active ? color : '#ffffff',
          color: active ? '#ffffff' : 'var(--text-muted)',
          transition: 'all 0.2s'
        }}
      >
        {t(status === 'Present' ? 'instructor.present' : 'instructor.absent')}
      </button>
    );
  };

  const renderContent = () => {
    if (loading) return <p style={{ color: 'var(--text-muted)' }}>{t('instructor.loading')}</p>;
    if (loadFailed) return <p style={{ color: '#b91c1c' }}>{t('instructor.loadError')}</p>;

    const viewed = studentViewId && students.find(s => s._id === studentViewId);
    if (viewed) {
      return (
        <StudentDetail
          key={viewed._id}
          enrollment={viewed}
          onBack={() => setStudentViewId(null)}
          onProgressSaved={(id, changes) => setStudents(prev => prev.map(s => (s._id === id ? { ...s, ...changes } : s)))}
          onEditSchedule={openScheduleEditor}
          onWriteReport={openReport}
          onAttendanceChanged={(id, date, status) => {
            if (date === localToday()) setAttendance(prev => ({ ...prev, [id]: status }));
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatCard label={t('instructor.stat.students')} value={students.length} color="var(--primary-color)" />
            <StatCard label={t('instructor.stat.scheduled')} value={scheduled.length} color="var(--accent-color)" />
            <StatCard label={t('instructor.stat.present')} value={stats.presentThisMonth} color="#059669" />
            <StatCard label={t('instructor.stat.absent')} value={stats.absentThisMonth} color="#dc2626" />
          </div>

          {/* Today's classes, in time order */}
          <section className="today-card">
            <div className="today-head">
              <div>
                <h2>{t('instructor.today.title')}</h2>
                <p>{todayLabel}</p>
              </div>
              {todaysClasses.length > 0 && (
                <span className="today-count">{t('instructor.today.count', { count: todaysClasses.length })}</span>
              )}
            </div>

            {todaysClasses.length === 0 ? (
              <div className="today-empty">
                <p>{t('instructor.today.empty')}</p>
                <button type="button" onClick={() => setActiveTab('schedule')} className="sched-btn sched-btn-ghost">{t('instructor.today.manage')}</button>
              </div>
            ) : (
              <ul className="today-list">
                {todaysClasses.map(enr => {
                  const state = classState(enr.scheduleClock);
                  const marked = attendance[enr._id];
                  return (
                    <li key={enr._id} className={`today-item ${state}`}>
                      <div className="today-time">
                        <strong>{formatClock(enr.scheduleClock, lang)}</strong>
                        {state === 'now' && <span className="today-badge now">{t('instructor.today.now')}</span>}
                        {state === 'next' && <span className="today-badge next">{t('instructor.today.next')}</span>}
                      </div>
                      <div className="today-info">
                        <div className="today-name">{enr.student?.name} <PaymentBadge status={enr.paymentStatus} /></div>
                        <div className="today-meta">
                          {enr.course?.title}
                          {enr.whatsapp && (
                            <> · <a href={whatsappLink(enr.whatsapp)} target="_blank" rel="noreferrer">{t('instructor.whatsapp')}</a></>
                          )}
                        </div>
                      </div>
                      <div className="today-actions">
                        {attendanceButton(enr._id, 'Present', '#059669')}
                        {attendanceButton(enr._id, 'Absent', '#dc2626')}
                        <button type="button" onClick={() => openReport(enr._id)} className="today-report">{t('instructor.rep.write')}</button>
                        {enr.zoomLink ? (
                          <a href={enr.zoomLink} target="_blank" rel="noreferrer" className="today-start">{t('instructor.startClass')}</a>
                        ) : (
                          <button type="button" onClick={() => openScheduleEditor(enr)} className="today-nolink">{t('instructor.today.addLink')}</button>
                        )}
                      </div>
                      {(rowStatus[enr._id] || marked) && (
                        <div className="today-status" style={{ color: rowStatus[enr._id] === 'error' ? '#dc2626' : '#059669' }}>
                          {rowStatus[enr._id] === 'error' ? t('instructor.saveFailed') : t(marked === 'Absent' ? 'instructor.today.markedAbsent' : 'instructor.today.markedPresent')}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {unscheduledToday > 0 && (
              <p className="today-note">{t('instructor.today.textNote', { count: unscheduledToday })}</p>
            )}
          </section>
          </>
        );

      case 'schedule':
        return students.length === 0 ? (
          <p style={{ ...cardStyle, color: 'var(--text-muted)' }}>{t('instructor.noStudents')}</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {students.map(enr => (
              <div key={enr._id} style={{ ...cardStyle, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', borderInlineStart: `4px solid ${hasSchedule(enr) ? 'var(--accent-color)' : 'rgba(0,0,0,0.12)'}` }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginBottom: '0.3rem' }}>{enr.student?.name} <PaymentBadge status={enr.paymentStatus} /></h4>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {enr.course?.title} •{' '}
                    {hasSchedule(enr)
                      ? <strong style={{ color: 'var(--text-color)' }}>🕒 {formatSchedule(enr, lang)}</strong>
                      : <span style={{ color: '#b45309', fontWeight: 600 }}>{t('instructor.sched.none')}</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button type="button" onClick={() => openScheduleEditor(enr)} className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', borderRadius: '999px', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                    {hasSchedule(enr) ? t('instructor.sched.edit') : t('instructor.sched.add')}
                  </button>
                  {enr.zoomLink ? (
                    <a href={enr.zoomLink} target="_blank" rel="noreferrer" className="btn" style={{ background: '#059669', color: '#fff', padding: '0.7rem 1.6rem', borderRadius: '999px', textDecoration: 'none' }}>
                      {t('instructor.startClass')}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', border: '1px dashed rgba(0,0,0,0.2)', padding: '0.6rem 1.2rem', borderRadius: '999px' }}>{t('instructor.noLink')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'students':
        return (
          <div style={{ ...cardStyle, padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(122, 27, 41, 0.15)' }}>
                  <th style={thStyle}>{t('instructor.col.student')}</th>
                  <th style={thStyle}>{t('instructor.col.course')}</th>
                  <th style={thStyle}>{t('instructor.col.lesson')}</th>
                  <th style={thStyle}>{t('instructor.col.progress')}</th>
                  <th style={thStyle}>{t('instructor.col.attendance')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>{t('instructor.col.view')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map(enr => (
                  <tr key={enr._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: 'var(--text-color)' }}>{enr.student?.name} <PaymentBadge status={enr.paymentStatus} /></div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        {enr.studentAge && <span>{t('instructor.age', { age: enr.studentAge })}</span>}
                        {enr.level && <span>{t(`instructor.level.${enr.level}`)}</span>}
                        {enr.whatsapp && (
                          <a href={whatsappLink(enr.whatsapp)} target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
                            {t('instructor.whatsapp')}: <bdi>{enr.whatsapp}</bdi>
                          </a>
                        )}
                      </div>
                      {rowStatus[enr._id] && (
                        <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: rowStatus[enr._id] === 'saved' ? '#059669' : '#dc2626' }}>
                          {t(rowStatus[enr._id] === 'saved' ? 'instructor.saved' : 'instructor.saveFailed')}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--primary-color)', fontWeight: 600 }}>{enr.course?.title}</td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={enr.currentAyahOrLesson || ''}
                        placeholder={t('instructor.lessonPlaceholder')}
                        onChange={(e) => updateStudentField(enr._id, 'currentAyahOrLesson', e.target.value)}
                        onBlur={() => saveProgress(enr)}
                        style={{ ...lightInputStyle, padding: '0.55rem 0.8rem' }}
                      />
                    </td>
                    <td style={{ ...tdStyle, minWidth: '170px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={enr.progressPercentage ?? 0}
                          onChange={(e) => updateStudentField(enr._id, 'progressPercentage', e.target.value)}
                          onBlur={() => saveProgress(enr)}
                          style={{ ...lightInputStyle, width: '5rem', padding: '0.55rem 0.6rem' }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.max(0, Number(enr.progressPercentage) || 0))}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))', transition: 'width 0.4s' }}></div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {attendanceButton(enr._id, 'Present', '#059669')}
                        {attendanceButton(enr._id, 'Absent', '#dc2626')}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{viewButton(enr)}</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="6" style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>{t('instructor.noStudents')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case 'wallet':
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem', alignItems: 'stretch' }}>
              <StatCard label={t('instructor.wallet.pending')} value={formatMoney(wallet.pendingTotal)} color="#d97706" />
              <StatCard label={t('instructor.wallet.paid')} value={formatMoney(wallet.paidTotal)} color="#059669" />
              <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={() => { setPayoutError(''); setIsPayoutModalOpen(true); }} className="btn" style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '999px', fontSize: '1.05rem' }}>
                  {t('instructor.wallet.request')}
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-color)', marginBottom: '1rem' }}>{t('instructor.wallet.history')}</h3>
            <div style={{ ...cardStyle, padding: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(122, 27, 41, 0.15)' }}>
                    <th style={thStyle}>{t('instructor.wallet.col.invoice')}</th>
                    <th style={thStyle}>{t('instructor.wallet.col.date')}</th>
                    <th style={thStyle}>{t('instructor.wallet.col.method')}</th>
                    <th style={thStyle}>{t('instructor.wallet.col.amount')}</th>
                    <th style={thStyle}>{t('instructor.wallet.col.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(payout => (
                    <tr key={payout._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)', fontWeight: 600 }}><bdi>{payout.invoiceId}</bdi></td>
                      <td style={tdStyle}><bdi>{payout.date}</bdi></td>
                      <td style={tdStyle}>{t(`instructor.method.${payout.method}`)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--primary-color)' }}><bdi>{payout.amount}</bdi></td>
                      <td style={tdStyle}>
                        <span style={{
                          background: payout.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: payout.status === 'Paid' ? '#047857' : '#b45309',
                          padding: '0.35rem 0.8rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700
                        }}>
                          {t(`instructor.payoutStatus.${payout.status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>{t('instructor.wallet.empty')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <AttendancePage
            students={students}
            onChanged={(enrollmentId, date, status) => {
              // Keep "Today's classes" and the monthly numbers on "My Dashboard" in sync.
              if (date === localToday()) setAttendance(prev => ({ ...prev, [enrollmentId]: status }));
              fetchDashboardData();
            }}
          />
        );

      case 'reports':
        return <ReportsPage key={reportFor || 'reports'} students={students} initialEnrollmentId={reportFor} />;

      case 'account':
        return (
          <div className="acc-layout">
            <PublicProfileCard />
            <AccountProfileCard />
            <SecurityCard />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-layout instructor-layout">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar" style={{ padding: '1.5rem 0.9rem' }}>
        <div className="admin-sidebar-logo" style={{ marginBottom: '1rem', paddingInlineStart: '1rem' }}>
          {lang === 'ar'
            ? <>{t('instructor.brandRest')} <span>{t('instructor.brandHighlight')}</span></>
            : <><span>{t('instructor.brandHighlight')}</span> {t('instructor.brandRest')}</>}
        </div>
        <LangToggle className="lang-switch-dark" style={{ marginBottom: '1.2rem', marginInlineStart: '1rem', alignSelf: 'flex-start' }} />
        <div className="instructor-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          {TAB_GROUPS.map(group => (
            <div key={group.key} className="sidebar-group">
              <div className="sidebar-group-title">{t(`instructor.navGroup.${group.key}`)}</div>
              {group.tabs.map(tab => (
                <SidebarLink key={tab} id={tab} label={t(`instructor.nav.${tab}`)} {...sidebarProps} />
              ))}
            </div>
          ))}
          <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'none', border: 'none', color: '#fca5a5', textAlign: 'start', fontWeight: 700, padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'inherit' }}>
            {t('instructor.nav.logout')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* Page header: same simple style on every page */}
        <header className="welcome-hero">
          <div>
            <h1>{studentViewId ? t('instructor.sd.title') : activeTab === 'dashboard' ? t('instructor.welcome.title', { name: firstName }) : t(`instructor.title.${activeTab}`)}</h1>
            <p className="page-sub">{studentViewId ? t('instructor.sd.subtitle') : t(`instructor.sub.${activeTab}`)}</p>
          </div>
          {activeTab === 'dashboard' && !studentViewId && (
            <div className="welcome-meta">
              <span>📅 {todayLabel}</span>
              <span>🕒 {t('instructor.welcome.classes', { count: todaysClasses.length })}</span>
              <span>👥 {t('instructor.welcome.students', { count: students.length })}</span>
            </div>
          )}
        </header>

        {renderContent()}
      </div>


      {scheduleEdit && (
        <div className="sched-overlay" onClick={e => { if (e.target === e.currentTarget) setScheduleEdit(null); }}>
          <form className="sched-modal" onSubmit={saveSchedule} role="dialog" aria-modal="true" aria-labelledby="sched-title">
            {/* Header */}
            <div className="sched-header">
              <div className="sched-header-icon" aria-hidden="true">📅</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 id="sched-title">{t('instructor.sched.title')}</h2>
                <p>{scheduleEdit.enrollment.student?.name} · {scheduleEdit.enrollment.course?.title}</p>
              </div>
              <button type="button" className="sched-close" onClick={() => setScheduleEdit(null)} aria-label="Close">✕</button>
            </div>

            {/* Body */}
            <div className="sched-body">
              <div className="sched-label">{t('instructor.sched.days')}</div>
              <div className="sched-days">
                {WEEK_ORDER.map(day => {
                  const on = scheduleEdit.days.includes(day);
                  return (
                    <button key={day} type="button" onClick={() => toggleDay(day)} aria-pressed={on} className={`sched-day ${on ? 'on' : ''}`}>
                      {dayName(day, lang)}
                    </button>
                  );
                })}
              </div>

              <div className="sched-row">
                <div>
                  <label htmlFor="sched-time" className="sched-label">{t('instructor.sched.time')}</label>
                  <input id="sched-time" type="time" value={scheduleEdit.time} onChange={e => setScheduleEdit({ ...scheduleEdit, time: e.target.value })} style={lightInputStyle} />
                  <small className="sched-hint">{t('instructor.sched.timeHint')}</small>
                </div>
                <div>
                  <label htmlFor="sched-link" className="sched-label">{t('instructor.sched.link')}</label>
                  <input id="sched-link" type="url" dir="ltr" value={scheduleEdit.zoomLink} onChange={e => setScheduleEdit({ ...scheduleEdit, zoomLink: e.target.value })} placeholder="https://zoom.us/j/..." style={lightInputStyle} />
                </div>
              </div>

              {scheduleError && <p className="sched-error">{scheduleError}</p>}
            </div>

            {/* Footer */}
            <div className="sched-footer">
              {hasSchedule(scheduleEdit.enrollment) && (
                <button type="button" disabled={scheduleSaving} onClick={() => { if (window.confirm(t('instructor.sched.clearConfirm'))) saveSchedule(null, true); }} className="sched-btn sched-btn-danger">
                  {t('instructor.sched.clear')}
                </button>
              )}
              <span style={{ flex: 1 }} />
              <button type="button" onClick={() => setScheduleEdit(null)} className="sched-btn sched-btn-ghost">{t('instructor.sched.cancel')}</button>
              <button type="submit" disabled={scheduleSaving} className="sched-btn sched-btn-primary">
                {scheduleSaving ? t('account.saving') : t('instructor.sched.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {isPayoutModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: '480px', padding: '2.5rem', position: 'relative' }}>
            <button
              onClick={() => setIsPayoutModalOpen(false)}
              aria-label="Close"
              style={{ position: 'absolute', top: '1.2rem', insetInlineEnd: '1.2rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>{t('instructor.payout.title')}</h2>

            <form onSubmit={handlePayoutSubmit}>
              {payoutError && <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{payoutError}</p>}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>{t('instructor.payout.amount')}</label>
                <input required type="number" min="1" step="0.01" style={lightInputStyle} value={payoutReq.amount} onChange={e => setPayoutReq({ ...payoutReq, amount: e.target.value })} placeholder="500" />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>{t('instructor.payout.method')}</label>
                <select style={lightInputStyle} value={payoutReq.method} onChange={e => setPayoutReq({ ...payoutReq, method: e.target.value })}>
                  {PAYOUT_METHODS.map(method => <option key={method} value={method}>{t(`instructor.method.${method}`)}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>{t('instructor.payout.details')}</label>
                <input required type="text" style={lightInputStyle} value={payoutReq.details} onChange={e => setPayoutReq({ ...payoutReq, details: e.target.value })} placeholder={t('instructor.payout.detailsPlaceholder')} />
              </div>
              <button type="submit" className="btn" style={{ width: '100%', padding: '0.9rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '1.05rem' }}>
                {t('instructor.payout.submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
