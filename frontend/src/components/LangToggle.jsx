import { useLang } from '../i18n/lang';

const OPTIONS = [
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'ar', label: 'عربي', title: 'العربية' },
];

/** Segmented "EN | عربي" language switch used in the navbar and on pages without a navbar. */
const LangToggle = ({ className = '', style }) => {
  const { lang, setLanguage } = useLang();

  return (
    <div className={`lang-switch ${className}`} style={style} role="group" aria-label="Language / اللغة">
      {OPTIONS.map(option => {
        const active = lang === option.code;
        return (
          <button
            key={option.code}
            type="button"
            lang={option.code}
            title={option.title}
            aria-pressed={active}
            className={active ? 'active' : ''}
            onClick={() => !active && setLanguage(option.code)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default LangToggle;
