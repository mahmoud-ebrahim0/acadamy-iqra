import { siteTranslations } from './siteTranslations';

/**
 * Built-in text for the home page sections the admin can edit (FAQ, Stars of Tarteel, Testimonials).
 * Same shape as the footer pages: { title, intro, sections: [{ heading, text }] }.
 * Shown until the admin saves their own version from the dashboard.
 */
const build = (dict) => {
  const items = (count, heading, text) =>
    Array.from({ length: count }, (_, i) => ({ heading: dict[heading(i + 1)], text: dict[text(i + 1)] }));

  return {
    faq: {
      title: dict['faq.title'],
      intro: dict['faq.subtitle'],
      sections: items(5, n => `faq.q${n}`, n => `faq.a${n}`),
    },
    stars: {
      title: dict['stars.title'],
      intro: dict['stars.subtitle'],
      sections: items(5, n => `stars.s${n}.name`, n => `stars.s${n}.text`),
    },
    testimonials: {
      title: dict['testimonials.title'],
      intro: '',
      sections: items(3, n => `testimonials.t${n}.author`, n => `testimonials.t${n}.text`),
    },
  };
};

export const HOME_SECTIONS = ['faq', 'stars', 'testimonials'];

export const homeContent = {
  en: build(siteTranslations.en),
  ar: build(siteTranslations.ar),
};
