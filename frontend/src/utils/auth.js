// Single place that knows how the login session is stored in the browser.
// Note: the role stored here only decides which page to show. Every API call is
// checked again by the server, so editing localStorage gives no extra access.

const KEYS = { token: 'authToken', id: 'userId', name: 'userName', role: 'userRole' };
const LEGACY_KEYS = ['adminToken', 'userToken'];

export const saveSession = (token, user) => {
  localStorage.setItem(KEYS.token, token);
  localStorage.setItem(KEYS.id, user?._id || '');
  localStorage.setItem(KEYS.name, user?.name || '');
  localStorage.setItem(KEYS.role, user?.role || 'student');
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
};

export const clearSession = () => {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
};

export const SESSION_EVENT = 'session-updated';

/** Updates the stored display name (after editing the profile) and tells the navbar to refresh. */
export const updateSessionName = (name) => {
  localStorage.setItem(KEYS.name, name || '');
  window.dispatchEvent(new Event(SESSION_EVENT));
};

export const getToken = () => localStorage.getItem(KEYS.token);
export const getUserName = () => localStorage.getItem(KEYS.name) || '';
export const getRole = () => localStorage.getItem(KEYS.role) || '';

export const dashboardPathFor = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'instructor') return '/instructor';
  return '/dashboard';
};

/** Only allow same-site relative redirects (prevents open-redirect tricks like ?redirect=//evil.com). */
export const safeRedirect = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') ? path : null;
