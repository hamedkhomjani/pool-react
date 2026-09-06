// Price display formatting. Prices are stored as numbers (IRR toman) in the
// catalog; this produces the grouped, locale-digit string shown in the UI.
// Persian keeps the ASCII thousands separator for visual parity with the
// previous hardcoded strings (e.g. «۱۲,۵۰۰,۰۰۰»).

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export function formatPrice(price, lang) {
  const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price)
  if (lang === 'en') return grouped
  return grouped.replace(/\d/g, d => PERSIAN_DIGITS[Number(d)])
}

// Returns the rounded discount percentage when compareAt is higher than the
// current price, or null when there is no active promotion.
export function discountPercent(price, compareAt) {
  if (compareAt == null || !Number.isFinite(compareAt) || compareAt <= price) return null
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export default formatPrice