import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth, readJson } from '../../utils/api';
import { clearSession, getUserName } from '../../utils/auth';
import { useLang } from '../../i18n/lang';
import { cardStyle, lightInputStyle } from '../../utils/styles';
import LangToggle from '../../components/LangToggle';
import ChangePasswordForm from '../../components/ChangePasswordForm';

const TABS = ['dashboard', 'schedule', 'students', 'wallet', 'account'];
const PAYOUT_METHODS = ['Vodafone Cash', 'InstaPay', 'PayPal', 'Bank Transfer'];
const EMPTY_PAYOUT = { amount: '', method: 'Vodafone Cash', details: '' };

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
      padding: '0.9rem 1.2rem', borderRadius: '0.6rem', fontFamily: 'inherit',
      color: activeTab === id ? '#ffffff' : 'rgba(255,255,255,0.7)',
      backgroundColor: activeTab === id ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
      fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
    }}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, color }) => (
  <div style={{ ...cardStyle, borderTop: `4px solid ${color}` }}>
    <div style={{ color: 'var(--text-muted)', marginBottom: '0.8rem', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: '2.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
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

  const firstName = (getUserName() || t('instructor.defaultName')).split(' ')[0];

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

  const scheduled = students.filter(s => s.scheduleTime);
  const sidebarProps = { activeTab, onSelect: setActiveTab };

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

    switch (activeTab) {
      case 'dashboard':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <StatCard label={t('instructor.stat.students')} value={students.length} color="var(--primary-color)" />
            <StatCard label={t('instructor.stat.scheduled')} value={scheduled.length} color="var(--accent-color)" />
            <StatCard label={t('instructor.stat.present')} value={stats.presentThisMonth} color="#059669" />
            <StatCard label={t('instructor.stat.absent')} value={stats.absentThisMonth} color="#dc2626" />
          </div>
        );

      case 'schedule':
        return scheduled.length === 0 ? (
          <p style={{ ...cardStyle, color: 'var(--text-muted)' }}>{t('instructor.noSchedule')}</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {scheduled.map(enr => (
              <div key={enr._id} style={{ ...cardStyle, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginBottom: '0.3rem' }}>{enr.student?.name}</h4>
                  <p style={{ color: 'var(--text-muted)' }}>{enr.course?.title} • <strong style={{ color: 'var(--text-color)' }}>{enr.scheduleTime}</strong></p>
                </div>
                {enr.zoomLink ? (
                  <a href={enr.zoomLink} target="_blank" rel="noreferrer" className="btn" style={{ background: '#059669', color: '#fff', padding: '0.7rem 1.6rem', borderRadius: '999px', textDecoration: 'none' }}>
                    {t('instructor.startClass')}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-muted)', border: '1px dashed rgba(0,0,0,0.2)', padding: '0.6rem 1.2rem', borderRadius: '999px' }}>{t('instructor.noLink')}</span>
                )}
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
                </tr>
              </thead>
              <tbody>
                {students.map(enr => (
                  <tr key={enr._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: 'var(--text-color)' }}>{enr.student?.name}</div>
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
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>{t('instructor.noStudents')}</td></tr>
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

      case 'account':
        return (
          <div style={cardStyle}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.4rem', fontSize: '1.4rem' }}>{t('account.title')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('account.subtitle')}</p>
            <ChangePasswordForm />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar" style={{ padding: '2rem 1rem' }}>
        <div className="admin-sidebar-logo" style={{ marginBottom: '1.5rem', paddingInlineStart: '1rem' }}>
          {lang === 'ar'
            ? <>{t('instructor.brandRest')} <span>{t('instructor.brandHighlight')}</span></>
            : <><span>{t('instructor.brandHighlight')}</span> {t('instructor.brandRest')}</>}
        </div>
        <LangToggle className="lang-switch-dark" style={{ marginBottom: '2rem', marginInlineStart: '1rem', alignSelf: 'flex-start' }} />
        <div className="instructor-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
          {TABS.map(tab => (
            <SidebarLink key={tab} id={tab} label={t(`instructor.nav.${tab}`)} {...sidebarProps} />
          ))}
          <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'none', border: 'none', color: '#fca5a5', textAlign: 'start', fontWeight: 700, padding: '0.9rem 1.2rem', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}>
            {t('instructor.nav.logout')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)', marginBottom: '0.3rem' }}>
            {t(`instructor.title.${activeTab}`, { name: firstName })}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t(`instructor.sub.${activeTab}`)}</p>
        </header>

        {renderContent()}
      </div>

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
