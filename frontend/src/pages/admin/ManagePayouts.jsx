import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';

const amountOf = (payout) => Number(String(payout.amount).replace(/[^0-9.]/g, '')) || 0;

const STATUS_STYLE = {
  Pending: { background: 'rgba(245, 158, 11, 0.15)', color: '#b45309' },
  Paid: { background: 'rgba(16, 185, 129, 0.15)', color: '#047857' },
  Rejected: { background: 'rgba(239, 68, 68, 0.12)', color: '#b91c1c' },
};

/** Admin page to approve (mark as paid) or reject instructor payout requests. */
const ManagePayouts = () => {
  const { t } = useAdminLang();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [busyId, setBusyId] = useState(null);

  const fetchPayouts = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/admin/payouts');
      const data = await readJson(res);
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API on mount
    fetchPayouts();
  }, [fetchPayouts]);

  const updateStatus = async (payout, status) => {
    const name = payout.instructor?.name || t('payouts.deletedInstructor');
    const question = status === 'Paid'
      ? t('payouts.confirmPaid', { amount: payout.amount, name })
      : t('payouts.confirmReject', { name });
    if (!window.confirm(question)) return;

    setBusyId(payout._id);
    try {
      const res = await fetchWithAuth(`/api/admin/payouts/${payout._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      const data = await readJson(res);
      if (!res.ok) alert(t.server(data.message) || t('payouts.failed'));
      fetchPayouts();
    } catch {
      alert(t('common.networkError'));
    } finally {
      setBusyId(null);
    }
  };

  const visible = filter === 'all' ? payouts : payouts.filter(p => p.status === filter);
  const pendingTotal = payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + amountOf(p), 0);

  const filterButton = (value) => (
    <button
      key={value}
      onClick={() => setFilter(value)}
      className="btn"
      style={{
        padding: '0.5rem 1.2rem', borderRadius: '999px', fontFamily: 'inherit',
        border: '1px solid var(--primary-color)',
        background: filter === value ? 'var(--primary-color)' : 'transparent',
        color: filter === value ? '#fff' : 'var(--primary-color)',
      }}
    >
      {t(`payouts.filter.${value}`)}
    </button>
  );

  return (
    <div>
      <div className="admin-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>{t('payouts.title')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '640px' }}>{t('payouts.subtitle')}</p>
        </div>
        <div style={{ textAlign: 'end' }}>
          <div style={{ fontWeight: 700, color: '#b45309', marginBottom: '0.6rem' }}>
            {t('payouts.pendingTotal', { amount: `$${pendingTotal.toFixed(2)}` })}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            {filterButton('Pending')}
            {filterButton('all')}
          </div>
        </div>
      </div>

      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('payouts.loading')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('payouts.col.instructor')}</th>
                <th>{t('payouts.col.amount')}</th>
                <th>{t('payouts.col.method')}</th>
                <th>{t('payouts.col.date')}</th>
                <th>{t('payouts.col.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(payout => (
                <tr key={payout._id}>
                  <td style={{ fontWeight: 700 }}>
                    {payout.instructor?.name || t('payouts.deletedInstructor')}
                    <div style={{ fontWeight: 'normal', fontSize: '0.8rem', color: 'var(--text-muted)' }}><bdi>{payout.invoiceId}</bdi></div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}><bdi>{payout.amount}</bdi></td>
                  <td>
                    {t(`payouts.method.${payout.method}`)}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><bdi>{payout.details}</bdi></div>
                  </td>
                  <td><bdi>{payout.date}</bdi></td>
                  <td>
                    <span style={{ ...STATUS_STYLE[payout.status], padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700 }}>
                      {t(`payouts.status.${payout.status}`)}
                    </span>
                  </td>
                  <td>
                    {payout.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button disabled={busyId === payout._id} onClick={() => updateStatus(payout, 'Paid')} className="btn" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem', background: '#059669', color: '#fff', border: 'none', whiteSpace: 'nowrap' }}>
                          {t('payouts.markPaid')}
                        </button>
                        <button disabled={busyId === payout._id} onClick={() => updateStatus(payout, 'Rejected')} className="btn btn-outline" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}>
                          {t('payouts.reject')}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>{t('payouts.empty')}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagePayouts;
