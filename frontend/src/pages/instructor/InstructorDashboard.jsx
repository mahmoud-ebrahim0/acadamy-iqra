import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const dummyClasses = [
  { id: 1, studentName: 'Ahmad M.', time: '10:00 AM', course: 'Tajweed Foundation', status: 'upcoming' },
  { id: 2, studentName: 'Sara Y.', time: '11:30 AM', course: 'Memorization (Hifz)', status: 'live' },
  { id: 3, studentName: 'Omar K.', time: '02:00 PM', course: 'Arabic Language', status: 'upcoming' },
];

const initialStudents = [
  { id: 1, name: 'Ahmad M.', level: 'Beginner', progress: 'Surah Al-Mulk, Ayah 15', attendance: 'Present' },
  { id: 2, name: 'Sara Y.', level: 'Advanced', progress: 'Juz Amma Revision', attendance: 'Present' },
  { id: 3, name: 'Omar K.', level: 'Intermediate', progress: 'Surah Al-Kahf, Ayah 1', attendance: 'Absent' },
];

const initialPayouts = [
  { id: '#INV-001', date: '2026-05-01', amount: '$450.00', status: 'Paid', method: 'PayPal' },
  { id: '#INV-002', date: '2026-06-01', amount: '$520.00', status: 'Pending', method: 'Vodafone Cash' }
];

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, schedule, students, wallet
  
  const [students, setStudents] = useState(initialStudents);
  const [payouts, setPayouts] = useState(initialPayouts);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  
  // Payout Form State
  const [payoutReq, setPayoutReq] = useState({ amount: '', method: 'Vodafone Cash', details: '' });

  const handleLogout = () => {
    navigate('/home');
  };

  const handleProgressChange = (id, newProgress) => {
    setStudents(students.map(s => s.id === id ? { ...s, progress: newProgress } : s));
  };

  const handleAttendanceChange = (id, status) => {
    setStudents(students.map(s => s.id === id ? { ...s, attendance: status } : s));
  };

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    const newId = `#INV-00${payouts.length + 1}`;
    const date = new Date().toISOString().split('T')[0];
    setPayouts([{ id: newId, date, amount: `$${payoutReq.amount}.00`, status: 'Pending', method: payoutReq.method }, ...payouts]);
    setIsPayoutModalOpen(false);
    setPayoutReq({ amount: '', method: 'Vodafone Cash', details: '' });
  };

  const SidebarLink = ({ id, icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={activeTab === id ? 'active' : ''}
      style={{
        display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', 
        padding: '1rem 1.5rem', margin: '0.2rem 0', borderRadius: '0.5rem',
        color: activeTab === id ? 'var(--primary-color)' : 'rgba(255,255,255,0.7)',
        backgroundColor: activeTab === id ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
        fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar" style={{ padding: '2rem 1rem' }}>
        <div className="admin-sidebar-logo" style={{ marginBottom: '3rem', paddingLeft: '1.5rem' }}>
          <span>Iqra</span> Academy
        </div>
        <div className="admin-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
          <SidebarLink id="dashboard" icon="👨‍🏫" label="My Dashboard" />
          <SidebarLink id="schedule" icon="📅" label="Schedule" />
          <SidebarLink id="students" icon="👥" label="My Students" />
          <SidebarLink id="wallet" icon="💰" label="Wallet & Balance" />
          
          <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'none', border: 'none', color: '#ef4444', textAlign: 'left', fontWeight: '600', padding: '1rem 1.5rem', cursor: 'pointer', fontSize: '1rem' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>
            {activeTab === 'dashboard' && 'Welcome back, Sheikh Ali'}
            {activeTab === 'schedule' && "Today's Schedule"}
            {activeTab === 'students' && 'Student Progress Tracker'}
            {activeTab === 'wallet' && 'Wallet & Balance'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            {activeTab === 'dashboard' && 'Here is your overview for today.'}
            {activeTab === 'schedule' && 'Manage your live and upcoming sessions.'}
            {activeTab === 'students' && 'Track and evaluate your assigned students.'}
            {activeTab === 'wallet' && 'Manage your earnings and request payouts.'}
          </p>
        </header>

        {/* --- VIEW: DASHBOARD STATS --- */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1.1rem' }}>Total Teaching Hours</h3>
              <div style={{ fontSize: '3.5rem', color: 'var(--primary-color)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>45h</div>
              <p style={{ color: 'var(--accent-color)', marginTop: '0.5rem', fontSize: '0.9rem' }}>+5h this week</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1.1rem' }}>Active Students</h3>
              <div style={{ fontSize: '3.5rem', color: 'var(--accent-color)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>12</div>
              <p style={{ color: 'var(--primary-color)', marginTop: '0.5rem', fontSize: '0.9rem' }}>2 new students assigned</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1.1rem' }}>Upcoming Classes</h3>
              <div style={{ fontSize: '3.5rem', color: '#10b981', fontWeight: 'bold', fontFamily: 'var(--font-heading)', lineHeight: '1' }}>3</div>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Next class in 15 mins</p>
            </div>
          </div>
        )}

        {/* --- VIEW: SCHEDULE --- */}
        {activeTab === 'schedule' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {dummyClasses.map(cls => (
              <div key={cls.id} style={{ 
                background: 'var(--card-bg)', padding: '1.5rem 2rem', borderRadius: '1rem', 
                border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
              }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginBottom: '0.3rem' }}>{cls.studentName}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cls.course} • <strong style={{ color: 'var(--text-color)' }}>{cls.time}</strong></p>
                </div>
                <div>
                  {cls.status === 'live' ? (
                    <button className="btn" style={{ 
                      background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: '#10b981', 
                      animation: 'pulse-glow-green 2s infinite', padding: '0.8rem 2rem' 
                    }}>
                      🔴 Join Class
                    </button>
                  ) : (
                    <button className="btn btn-outline" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)', padding: '0.8rem 2rem', cursor: 'not-allowed' }}>
                      Wait for Time
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW: STUDENTS --- */}
        {activeTab === 'students' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(250, 204, 21, 0.3)' }}>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Student Name</th>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Level</th>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Current Progress (Ayah/Lesson)</th>
                  <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1.5rem 1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{student.name}</td>
                    <td style={{ padding: '1.5rem 1rem', color: 'var(--accent-color)' }}>{student.level}</td>
                    <td style={{ padding: '1.5rem 1rem' }}>
                      <input 
                        type="text" 
                        value={student.progress} 
                        onChange={(e) => handleProgressChange(student.id, e.target.value)}
                        style={{ 
                          width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(56, 189, 248, 0.3)', 
                          color: 'white', padding: '0.6rem 1rem', borderRadius: '0.5rem' 
                        }}
                      />
                    </td>
                    <td style={{ padding: '1.5rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleAttendanceChange(student.id, 'Present')}
                          style={{ 
                            padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', border: 'none',
                            background: student.attendance === 'Present' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: student.attendance === 'Present' ? '#10b981' : 'var(--text-muted)'
                          }}>
                          Present
                        </button>
                        <button 
                          onClick={() => handleAttendanceChange(student.id, 'Absent')}
                          style={{ 
                            padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', border: 'none',
                            background: student.attendance === 'Absent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: student.attendance === 'Absent' ? '#ef4444' : 'var(--text-muted)'
                          }}>
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- VIEW: WALLET & BALANCE --- */}
        {activeTab === 'wallet' && (
          <div>
            {/* Balance Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(56, 189, 248, 0.1))', 
              padding: '3rem', borderRadius: '1.5rem', border: '1px solid rgba(250, 204, 21, 0.3)', 
              boxShadow: '0 10px 40px rgba(250, 204, 21, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' 
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Current Unpaid Balance</p>
                <div style={{ fontSize: '4rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)', fontWeight: 'bold', lineHeight: '1' }}>$680.00</div>
              </div>
              <button onClick={() => setIsPayoutModalOpen(true)} className="btn btn-accent" style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(56,189,248,0.4)' }}>
                Request Payout
              </button>
            </div>

            {/* Payout History Table */}
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-color)', fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>Payout History</h3>
            <div style={{ background: 'var(--card-bg)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(250, 204, 21, 0.3)' }}>
                    <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Invoice ID</th>
                    <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Method</th>
                    <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Amount</th>
                    <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1.5rem 1rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{payout.id}</td>
                      <td style={{ padding: '1.5rem 1rem', color: 'var(--text-color)' }}>{payout.date}</td>
                      <td style={{ padding: '1.5rem 1rem', color: 'var(--text-color)' }}>{payout.method}</td>
                      <td style={{ padding: '1.5rem 1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{payout.amount}</td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <span style={{ 
                          background: payout.status === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                          color: payout.status === 'Paid' ? '#10b981' : '#f59e0b', 
                          padding: '0.4rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' 
                        }}>
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Request Payout Modal */}
      {isPayoutModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(3, 8, 17, 0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '100%', maxWidth: '500px', padding: '3rem',
            borderRadius: '2rem', border: '1px solid rgba(250, 204, 21, 0.2)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative'
          }}>
            <button 
              onClick={() => setIsPayoutModalOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '2rem', fontSize: '2rem' }}>Request Payout</h2>
            
            <form onSubmit={handlePayoutSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Amount ($)</label>
                <input required type="number" max="680" className="form-control" value={payoutReq.amount} onChange={e => setPayoutReq({...payoutReq, amount: e.target.value})} placeholder="e.g. 500" />
                <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>Max available: $680.00</small>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Payout Method</label>
                <select className="form-control" value={payoutReq.method} onChange={e => setPayoutReq({...payoutReq, method: e.target.value})} style={{ background: '#0B1930' }}>
                  <option>Vodafone Cash</option>
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label">Account Details (Number/Email)</label>
                <input required type="text" className="form-control" value={payoutReq.details} onChange={e => setPayoutReq({...payoutReq, details: e.target.value})} placeholder="Enter account details..." />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '1rem' }}>Submit Request</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-glow-green {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
};

export default InstructorDashboard;
