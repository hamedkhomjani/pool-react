import { MAX_RATING } from '../utils/reviews'

// Star row used across product cards, the product page and the review widget.
//
// Read-only mode (no `onChange`): renders `value` as a fraction-filled row so
// an average like 4.3 visibly lights three stars fully and 30% of the fourth.
// Interactive mode: renders one button per star; the parent owns the value.
function StarGlyphs({ size }) {
  return (
    <span className={`stars-row stars-row--${size}`} aria-hidden="true">
      {Array.from({ length: MAX_RATING }, (_, i) => (
        <span key={i} className="star">★</span>
      ))}
    </span>
  )
}

function RatingStars({ value, onChange, size = 'md', ariaLabel }) {
  if (onChange) {
    const active = Math.max(1, Math.min(MAX_RATING, Math.round(value)))
    return (
      <span className={`rating-stars rating-stars--${size}`} role="group" aria-label={ariaLabel}>
        {Array.from({ length: MAX_RATING }, (_, i) => {
          const stars = i + 1
          const pressed = stars === active
          return (
            <button
              key={stars}
              type="button"
              className={`star-btn ${pressed ? 'active' : ''}`}
              onClick={() => onChange(stars)}
              aria-label={ariaLabel ? `${ariaLabel}: ${stars}` : `${stars}`}
              aria-pressed={pressed}
            >
              ★
            </button>
          )
        })}
      </span>
    )
  }

  const pct = Math.max(0, Math.min(100, (value / MAX_RATING) * 100))
  return (
    <span className={`rating-stars rating-stars--${size}`} role="img" aria-label={ariaLabel}>
      <StarGlyphs size={size} />
      <span className="rating-stars-fill" style={{ width: `${pct}%` }}>
        <StarGlyphs size={size} />
      </span>
    </span>
  )
}

export default RatingStars