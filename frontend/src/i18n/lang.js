import { createContext, useContext } from 'react';
import { adminTranslations } from './adminTranslations';
import { siteTranslations } from './siteTranslations';

export const LANG_KEY = 'siteLang';
export const LANGS = ['en', 'ar'];

// Admin keys are prefixed with "admin." so they never clash with the website keys.
const prefix = (dict, p) => Object.fromEntries(Object.entries(dict).map(([k, v]) => [`${p}${k}`, v]));
const DICTIONARY = {
  en: { ...siteTranslations.en, ...prefix(adminTranslations.en, 'admin.') },
  ar: { ...siteTranslations.ar, ...prefix(adminTranslations.ar, 'admin.') },
};

export const readSavedLang = () => {
  try {
    const saved = localStorage.getItem(LANG_KEY) || localStorage.getItem('adminLang');
    return LANGS.includes(saved) ? saved : 'en';
  } catch {
    return 'en';
  }
};

/**
 * Builds the translate function for a language. Falls back to English, then to the key itself.
 * `scope` prefixes every key (e.g. 'admin.' for the admin dashboard).
 */
export const makeTranslator = (lang, scope = '') => {
  const t = (rawKey, vars) => {
    const key = scope + rawKey;
    let text = DICTIONARY[lang]?.[key] ?? DICTIONARY.en[key] ?? rawKey;
    if (vars) {
      Object.entries(vars).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, value);
      });
    }
    return text;
  };
  // Translates a message sent by the server when we know it; otherwise shows it unchanged.
  t.server = (message) => (message ? DICTIONARY[lang]?.[`server.${message}`] ?? message : message);
  return t;
};

export const LangContext = createContext({
  lang: 'en',
  dir: 'ltr',
  t: makeTranslator('en'),
  tAdmin: makeTranslator('en', 'admin.'),
  toggleLang: () => {},
});

export const useLang = () => useContext(LangContext);

/** Same as useLang, but t('overview.title') reads the admin dashboard text 'admin.overview.title'. */
export const useAdminLang = () => {
  const ctx = useContext(LangContext);
  return { ...ctx, t: ctx.tAdmin };
};
