import { useEffect, useMemo, useState } from 'react';
import { LANG_KEY, LangContext, makeTranslator, readSavedLang } from './lang';

/**
 * Provides the website language (English / Arabic) to every page, remembers the choice,
 * and sets <html lang dir> so the whole layout flips to right-to-left in Arabic.
 */
const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(readSavedLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo(() => {
    const setLanguage = (next) => {
      setLang(next);
      try {
        localStorage.setItem(LANG_KEY, next);
      } catch {
        // Storage unavailable (private mode) – the choice just isn't remembered.
      }
    };
    return {
      lang,
      dir,
      t: makeTranslator(lang),
      tAdmin: makeTranslator(lang, 'admin.'),
      setLanguage,
      toggleLang: () => setLanguage(lang === 'ar' ? 'en' : 'ar'),
    };
  }, [lang, dir]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export default LangProvider;
