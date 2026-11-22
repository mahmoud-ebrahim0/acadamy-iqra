import { useEffect, useState } from 'react';
import { API_URL } from './api';
import { useLang } from '../i18n/lang';

/**
 * Loads admin-edited content (a footer page or a home section) for the current language.
 * `defaults` is the built-in content per language ({ en, ar }), used until the admin saves their own.
 * Returns { ready, data } – `ready` is false while loading, so the default text doesn't flash first.
 */
export const useSiteContent = (slug, defaults) => {
  const { lang } = useLang();
  const [loaded, setLoaded] = useState({ slug: null, content: null });

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/client/pages/${slug}`)
      .then(res => (res.ok ? res.json() : null))
      .catch(() => null)
      .then(content => { if (!cancelled) setLoaded({ slug, content }); });
    return () => { cancelled = true; };
  }, [slug]);

  const ready = loaded.slug === slug;
  const data = (ready && loaded.content?.[lang]) || (defaults[lang] || defaults.en);
  return { ready, data };
};
