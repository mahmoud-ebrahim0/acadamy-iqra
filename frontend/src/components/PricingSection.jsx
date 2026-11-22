import { useLang } from '../i18n/lang';

const PLANS = [
  { key: 'p1', price: 35, nameColor: 'var(--text-color)', premium: false },
  { key: 'p2', price: 60, nameColor: 'var(--primary-color)', premium: true },
  { key: 'p3', price: 90, nameColor: 'var(--accent-color)', premium: false },
];

const PricingSection = ({ openModal }) => {
  const { t } = useLang();

  return (
    <section id="pricing" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">{t('pricing.title')}</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem' }}>
            {t('pricing.subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '2rem' }}>
          {PLANS.map(plan => (
            <div key={plan.key} className={`pricing-card ${plan.premium ? 'premium' : ''}`}>
              {plan.premium && (
                <div style={{ position: 'absolute', top: '15px', right: '-35px', background: 'var(--primary-color)', color: 'white', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('pricing.popular')}</div>
              )}
              <h3 style={{ fontSize: '1.8rem', color: plan.nameColor }}>{t(`pricing.${plan.key}.name`)}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{t(`pricing.${plan.key}.for`)}</p>
              <div className="pricing-price">${plan.price}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{t('pricing.perMonth')}</span></div>
              <ul className="pricing-features">
                {[1, 2, 3, 4, 5].map(n => <li key={n}>{t(`pricing.${plan.key}.f${n}`)}</li>)}
              </ul>
              <button
                className={`btn ${plan.premium ? 'btn-accent' : 'btn-outline'}`}
                onClick={openModal}
                style={{ width: '100%', boxShadow: plan.premium ? '0 5px 15px rgba(250, 204, 21, 0.3)' : undefined }}
              >
                {t('pricing.cta')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
