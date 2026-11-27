import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';

const STATUSES = ['New', 'Contacted', 'Enrolled', 'Closed'];
const FILTERS = ['all', ...STATUSES];

const formatDateTime = (value, lang) => new Date(value).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
  day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
});

/** Admin: free trial / consultation requests sent from the website. */
const ManageConsultations = () => {
  const { t, lang } = useAdminLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('New');
  const [search, setSearch] = useState('');
  const [notesFor, setNotesFor] = useState(null); // { _id, notes }
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/admin/consultations');
      const data = await readJson(res);
      if (!res.ok) { setLoadError(t.server(data.message) || t('leads.loadError')); return; }
      setLoadError('');
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setLoadError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads data from the API on mount
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(i => (filter === 'all' || i.status === filter)
      && (!q || i.name.toLowerCase().includes(q) || i.whatsapp.replace(/\s/g, '').includes(q.replace(/\s/g, ''))));
  }, [items, filter, search]);

  const patch = async (item, body) => {
    setBusyId(item._id);
    setError('');
    try {
      const res = await fetchWithAuth(`/api/admin/consultations/${item._id}`, { method: 'PUT', body: JSON.stringify(body) });
      const data = await readJson(res);
      if (!res.ok) { setError(t.server(data.message) || t('leads.saveError')); return false; }
      setItems(list => list.map(i => (i._id === data._id ? data : i)));
      return true;
    } catch {
      setError(t('common.networkError'));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(t('leads.confirmDelete', { name: item.name }))) return;
    setBusyId(item._id);
    try {
      const res = await fetchWithAuth(`/api/admin/consultations/${item._id}`, { method: 'DELETE' });
      if (res.ok) setItems(list => list.filter(i => i._id !== item._id));
      else setError(t('leads.saveError'));
    } catch {
      setError(t('common.networkError'));
    } finally {
      setBusyId(null);
    }
  };

  const saveNotes = async (e) => {
    e.preventDefault();
    const item = items.find(i => i._id === notesFor._id);
    if (await patch(item, { notes: notesFor.notes })) setNotesFor(null);
  };

  const countFor = (f) => (f === 'all' ? items.length : items.filter(i => i.status === f).length);
  const waLink = (item) => {
    const text = encodeURIComponent(t('leads.waMessage', { name: item.name }));
    return `https://wa.me/${item.whatsapp.replace(/\D/g, '')}?text=${text}`;
  };

  return (
    <div className="ov-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('leads.title')}</h1>
          <p className="page-sub">{t('leads.subtitle')}</p>
        </div>
        {countFor('New') > 0 && (
          <div className="welcome-meta"><span>🆕 {t('leads.newCount', { count: countFor('New') })}</span></div>
        )}
      </header>

      {error && <div className="crs-flash error">{error}</div>}

      <section className="ov-table-card">
        <div className="ov-table-head">
          <h3>{t('leads.tableTitle')}</h3>
          <input type="search" className="form-control ov-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('leads.search')} aria-label={t('leads.search')} />
        </div>
        <div className="ov-filters" role="tablist">
          {FILTERS.map(f => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {t(`leads.filter.${f}`)} <span>{countFor(f)}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="ov-empty">{t('leads.loading')}</p>
        ) : loadError ? (
          <div className="ov-empty">
            <p className="acc-error" style={{ marginBottom: '0.8rem' }}>{loadError}</p>
            <button type="button" className="sched-btn sched-btn-ghost" onClick={() => { setLoading(true); load(); }}>{t('common.retry')}</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="ov-empty lead-empty">
            <span aria-hidden="true">📭</span>
            <p>{items.length === 0 ? t('leads.empty') : t('leads.noMatch')}</p>
          </div>
        ) : (
          <ul className="lead-list">
            {visible.map(item => (
              <li key={item._id} className={`lead-card status-${item.status}`}>
                <div className="lead-main">
                  <span className="ov-avatar" aria-hidden="true">{item.name.trim().charAt(0).toUpperCase()}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong>{item.name}</strong>
                    <div className="ov-sub">
                      {item.age ? t('overview.age', { value: item.age }) : ''}{item.age ? ' · ' : ''}
                      🕒 {formatDateTime(item.createdAt, lang)}
                    </div>
                    {item.notes && <p className="lead-notes">📝 {item.notes}</p>}
                  </div>
                </div>
                <div className="lead-actions">
                  <a href={waLink(item)} target="_blank" rel="noreferrer" className="sched-btn lead-wa">
                    💬 <bdi dir="ltr">{item.whatsapp}</bdi>
                  </a>
                  <select
                    className="form-control lead-status"
                    value={item.status}
                    disabled={busyId === item._id}
                    onChange={e => patch(item, { status: e.target.value })}
                    aria-label={t('leads.status')}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{t(`leads.filter.${s}`)}</option>)}
                  </select>
                  <button type="button" className="ov-icon-btn" onClick={() => setNotesFor({ _id: item._id, notes: item.notes || '' })} title={t('leads.notes')} aria-label={t('leads.notes')}>📝</button>
                  <button type="button" className="ov-icon-btn danger" disabled={busyId === item._id} onClick={() => remove(item)} title={t('common.delete')} aria-label={t('common.delete')}>🗑</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {notesFor && (
        <div className="sched-overlay" onClick={e => { if (e.target === e.currentTarget) setNotesFor(null); }}>
          <form className="sched-modal" style={{ maxWidth: '520px' }} onSubmit={saveNotes} role="dialog" aria-modal="true" aria-labelledby="lead-notes-title">
            <div className="sched-header">
              <div className="sched-header-icon" aria-hidden="true">📝</div>
              <div style={{ flex: 1 }}>
                <h3 id="lead-notes-title">{t('leads.notes')}</h3>
                <p>{items.find(i => i._id === notesFor._id)?.name}</p>
              </div>
              <button type="button" className="sched-close" onClick={() => setNotesFor(null)} aria-label={t('common.cancel')}>✕</button>
            </div>
            <div className="sched-body">
              <textarea className="form-control" rows={5} maxLength={1000} value={notesFor.notes} onChange={e => setNotesFor(n => ({ ...n, notes: e.target.value }))} placeholder={t('leads.notesPlaceholder')} autoFocus />
            </div>
            <div className="sched-footer">
              <button type="button" onClick={() => setNotesFor(null)} className="sched-btn sched-btn-ghost">{t('common.cancel')}</button>
              <button type="submit" disabled={busyId === notesFor._id} className="sched-btn sched-btn-primary">{t('common.save')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageConsultations;
