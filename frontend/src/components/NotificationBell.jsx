import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth, readJson } from '../utils/api';
import { useLang } from '../i18n/lang';

const POLL_MS = 60 * 1000;
const PANEL_WIDTH = 360;

const ICONS = {
  newConsultation: '💬', newEnrollment: '🧾', newPayoutRequest: '💸',
  paymentApproved: '✅', instructorAssigned: '👨‍🏫', scheduleUpdated: '📅', newReport: '📝',
  newStudent: '🎓', payoutPaid: '💰', payoutRejected: '⛔',
};

/** "5 minutes ago" in the reader's language. */
const timeAgo = (date, lang) => {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang === 'ar' ? 'ar-EG' : 'en', { numeric: 'auto' });
  const steps = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, 'minute');
};

/** Bell with the number of unread notifications; opens the latest notifications. */
const NotificationBell = ({ dark = true }) => {
  const { t, lang, dir } = useLang();
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/account/notifications');
      if (!res.ok) return;
      const body = await readJson(res);
      setData({ items: body.items || [], unread: body.unread || 0 });
    } catch {
      // Offline: keep the last list.
    }
  }, []);

  // Load now, then every minute while the tab is visible.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads notifications from the API
    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [load]);

  // Close on outside click / Escape / resize.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onResize = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const toggle = () => {
    if (open) { setOpen(false); return; }
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const width = Math.min(PANEL_WIDTH, vw - 16);
    const top = Math.min(rect.bottom + 8, window.innerHeight - 200);
    // Open towards the page content, staying inside the screen.
    const side = dir === 'rtl'
      ? { right: Math.max(8, Math.min(vw - rect.right, vw - width - 8)) }
      : { left: Math.max(8, Math.min(rect.left, vw - width - 8)) };
    setPos({ top, width, ...side });
    setOpen(true);
    load();
  };

  const markAll = async () => {
    setData(d => ({ items: d.items.map(i => ({ ...i, read: true })), unread: 0 }));
    await fetchWithAuth('/api/account/notifications/read-all', { method: 'PUT' }).catch(() => {});
  };

  const openItem = async (item) => {
    setOpen(false);
    if (!item.read) {
      setData(d => ({ items: d.items.map(i => (i._id === item._id ? { ...i, read: true } : i)), unread: Math.max(0, d.unread - 1) }));
      fetchWithAuth(`/api/account/notifications/${item._id}/read`, { method: 'PUT' }).catch(() => {});
    }
    if (item.link) navigate(item.link);
  };

  const count = data.unread > 9 ? '9+' : data.unread;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`notif-btn ${dark ? 'dark' : ''} ${open ? 'open' : ''}`}
        onClick={toggle}
        aria-label={data.unread ? t('notif.titleUnread', { count: data.unread }) : t('notif.title')}
        aria-expanded={open}
        title={t('notif.title')}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {data.unread > 0 && <span className="notif-count">{count}</span>}
      </button>

      {open && pos && createPortal(
        <div ref={panelRef} className="notif-panel" style={pos} role="dialog" aria-label={t('notif.title')} dir={dir}>
          <div className="notif-head">
            <strong>{t('notif.title')}</strong>
            {data.unread > 0 && (
              <button type="button" onClick={markAll} className="notif-markall">{t('notif.markAll')}</button>
            )}
          </div>
          {data.items.length === 0 ? (
            <div className="notif-empty">
              <span aria-hidden="true">🔔</span>
              <p>{t('notif.empty')}</p>
            </div>
          ) : (
            <ul className="notif-list">
              {data.items.map(item => (
                <li key={item._id}>
                  <button type="button" className={`notif-item ${item.read ? '' : 'unread'}`} onClick={() => openItem(item)}>
                    <span className="notif-icon" aria-hidden="true">{ICONS[item.type] || '🔔'}</span>
                    <span className="notif-text">
                      <span>{t(`notif.${item.type}`, item.data || {})}</span>
                      <small>{timeAgo(item.createdAt, lang)}</small>
                    </span>
                    {!item.read && <span className="notif-dot" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default NotificationBell;
