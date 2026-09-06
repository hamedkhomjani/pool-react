import { useCallback, useMemo, useState } from 'react'
import { buildRatingSummary, mergeReviews } from '../utils/reviews'
import { track } from '../utils/track'

// Visitor-submitted reviews are stored per product key in localStorage, so a
// review survives refreshes while the seed (seller) reviews come from the
// catalog. Prices/labels pattern is mirrored: nothing localized is persisted.
const STORAGE_KEY = 'aquapro.reviews.v1'

function readUserReviews(productKey) {
  if (typeof window === 'undefined') return []
  try {
    const all = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    const list = all ? all[productKey] : undefined
    return Array.isArray(list)
      ? list.filter(r => r && typeof r.author === 'string' && typeof r.text === 'string')
      : []
  } catch {
    return []
  }
}

function writeUserReviews(productKey, list) {
  try {
    const all = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    all[productKey] = list
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // storage full/blocked — the review still works for this session
  }
}

// Returns the merged review list (visitor + seed), its rating summary, and an
// `add` call that persists a new visitor review. `product` carries the seed
// reviews from the catalog; passing the whole product keeps the summary in
// sync when the language (and therefore the seed copy) changes.
export function useReviews(product) {
  const productKey = product.key
  const seed = useMemo(() => product.reviews || [], [product.reviews])
  const [userReviews, setUserReviews] = useState(() => readUserReviews(productKey))

  const add = useCallback(
    ({ author, rating, text }) => {
      const review = {
        id: `u${Date.now()}`,
        author: author.trim(),
        rating,
        date: new Date().toISOString().slice(0, 10),
        verified: false,
        text: text.trim(),
      }
      setUserReviews(current => {
        const next = [review, ...current]
        writeUserReviews(productKey, next)
        return next
      })
      track('review_submitted', { key: productKey, rating })
    },
    [productKey],
  )

  const reviews = useMemo(
    () => mergeReviews(seed, userReviews),
    [seed, userReviews],
  )

  const summary = useMemo(() => buildRatingSummary(reviews), [reviews])

  return { reviews, add, userCount: userReviews.length, summary }
}

export default useReviews