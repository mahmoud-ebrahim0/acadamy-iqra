import { useLang } from '../i18n/lang';
import ChangePasswordForm from './ChangePasswordForm';

/** "Security" card: change password. Shown next to the profile card on account pages. */
const SecurityCard = () => {
  const { t } = useLang();
  return (
    <section className="acc-card">
      <div className="acc-section-title">
        <span aria-hidden="true">🔒</span>
        <div>
          <h4>{t('account.securityTitle')}</h4>
          <p>{t('account.subtitle')}</p>
        </div>
      </div>
      <ChangePasswordForm />
    </section>
  );
};

export default SecurityCard;
