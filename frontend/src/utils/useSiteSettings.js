import { useEffect, useState } from 'react';
import { API_URL } from './api';
import { WHATSAPP_NUMBER } from '../i18n/pagesContent';

// Contact numbers, payment accounts and social links – edited from the admin "Settings" page.
const EMPTY = {
  whatsapp: '', phone: '', email: '', vodafoneCash: '', instapay: '',
  facebook: '', instagram: '', youtube: '', tiktok: '',
};

let cache = null;
let pending = null;
const listeners = new Set();

const load = () => {
  if (!pending) {
    pending = fetch(`${API_URL}/api/client/settings`)
      .then(res => (res.ok ? res.json() : {}))
      .catch(() => ({}))
      .then(data => {
        cache = { ...EMPTY, ...data };
        listeners.forEach(fn => fn(cache));
        return cache;
      });
  }
  return pending;
};

/** Call after the admin saves the settings so every page shows the new values. */
export const refreshSiteSettings = (data) => {
  cache = { ...EMPTY, ...data };
  pending = Promise.resolve(cache);
  listeners.forEach(fn => fn(cache));
};

/** Digits only, for wa.me links (falls back to the academy's main number). */
export const whatsappDigits = (settings) => (settings?.whatsapp || WHATSAPP_NUMBER).replace(/\D/g, '');

/** Site settings (loaded once and shared by every component). Values are '' until loaded / when not set. */
export const useSiteSettings = () => {
  const [settings, setSettings] = useState(cache || EMPTY);
  useEffect(() => {
    listeners.add(setSettings);
    if (!cache) load();
    return () => listeners.delete(setSettings);
  }, []);
  return settings;
};
