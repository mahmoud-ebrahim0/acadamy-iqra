import { clearSession, getToken } from './auth';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

/**
 * fetch() wrapper that adds the login token.
 * - JSON bodies get a JSON Content-Type; FormData is left alone so the browser can set the multipart boundary.
 * - A 401 means the session is gone: clear it and send the user to the login page.
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { ...options.headers };

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 && token) {
    clearSession();
    window.location.href = `/login?expired=1&redirect=${encodeURIComponent(window.location.pathname)}`;
  }

  return response;
};

/** Reads a JSON response safely, returning {} when the body is not JSON. */
export const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};
