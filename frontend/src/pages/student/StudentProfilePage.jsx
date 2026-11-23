import { useLang } from '../../i18n/lang';
import AccountProfileCard from '../../components/AccountProfileCard';
import SecurityCard from '../../components/SecurityCard';

/** Student portal: personal details and password. */
const StudentProfilePage = () => {
  const { t } = useLang();
  return (
    <div className="portal-page">
      <header className="welcome-hero">
        <div>
          <h1>{t('portal.nav.profile')}</h1>
          <p className="page-sub">{t('profile.subtitle')}</p>
        </div>
      </header>
      <div className="acc-layout">
        <AccountProfileCard />
        <SecurityCard />
      </div>
    </div>
  );
};

export default StudentProfilePage;
