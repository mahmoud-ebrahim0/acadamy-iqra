/**
 * 1–5 star rating. With `onChange` it is clickable (clicking the current value clears it);
 * without it, it only displays the value.
 */
const StarRating = ({ value, onChange, label, size = '1.4rem' }) => {
  const interactive = typeof onChange === 'function';
  return (
    <div className="star-rating" role={interactive ? 'radiogroup' : 'img'} aria-label={label ? `${label}: ${value || 0}/5` : undefined}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = value >= n;
        if (!interactive) {
          return <span key={n} className={`star ${filled ? 'on' : ''}`} style={{ fontSize: size }} aria-hidden="true">★</span>;
        }
        return (
          <button
            key={n}
            type="button"
            className={`star ${filled ? 'on' : ''}`}
            style={{ fontSize: size }}
            onClick={() => onChange(value === n ? null : n)}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}/5`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
