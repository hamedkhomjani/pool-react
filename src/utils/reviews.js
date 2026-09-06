// Pure review aggregation helpers. Reviews look like
// { id, author, rating, date, verified, text } and carry a seller-seeded
// set per product plus anything the visitor submits (stored locally). All
// math here is kept outside components so it stays unit-testable.

export const MAX_RATING = 5

// Clamps/rounds a rating into the integer star range 1..MAX_RATING.
export function clampRating(rating) {
  if (!Number.isFinite(rating)) return 1
  const clamped = Math.max(1, Math.min(MAX_RATING, Math.round(rating)))
  return clamped
}

// Builds the summary shown in product cards and the review widget.
// Returns null when there are no reviews.
export function buildRatingSummary(reviews) {
  const list = reviews || []
  if (list.length === 0) return null
  const total = list.reduce((sum, r) => sum + clampRating(r.rating), 0)
  const average = total / list.length
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: list.filter(r => clampRating(r.rating) === stars).length,
  }))
  return { count: list.length, average, distribution }
}

// Merges seller-seeded reviews with the visitor's submitted one, newest
// first, with the visitor review pinned on top. Both inputs are optional.
// Merges seller-seeded reviews with the visitor's submitted one. Visitor
// reviews stay pinned on top (newest-submitted first); seed reviews follow,
// newest by date first. Both inputs are optional.
export function mergeReviews(seed = [], user = []) {
  const cleanSeed = (seed || [])
    .filter(r => r && typeof r.text === 'string')
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  const cleanUser = (user || []).filter(r => r && typeof r.text === 'string')
  return [...cleanUser, ...cleanSeed]
}