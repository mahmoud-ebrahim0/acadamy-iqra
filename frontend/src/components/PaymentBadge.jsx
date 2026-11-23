import { useLang } from '../i18n/lang';

/**
 * Small badge for the instructor: shows when a student hasn't paid yet (or the payment failed).
 * Nothing is shown for paid students. Only the status is visible to instructors, never payment details.
 */
// Turned off for now at the owner's request. Set to true to show the badge again.
const SHOW_PAYMENT_BADGE = false;

const PaymentBadge = ({ status }) => {
  const { t } = useLang();
  if (!SHOW_PAYMENT_BADGE) return null;
  if (status !== 'Pending' && status !== 'Failed') return null;
  return (
    <span className={`pay-badge ${status === 'Failed' ? 'failed' : 'pending'}`} title={t(`instructor.pay.${status}Hint`)}>
      {t(`instructor.pay.${status}`)}
    </span>
  );
};

export default PaymentBadge;
