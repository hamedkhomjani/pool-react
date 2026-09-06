import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReviews } from '../hooks/useReviews'
import { clampRating } from '../utils/reviews'
import RatingStars from './RatingStars'
import Reveal from './Reveal'

// Locale-aware date string for seed reviews (ISO dates). Persian keeps the
// ASCII separator but uses the same Persian-digit convention as prices.
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

function formatDate(dateStr, lang) {
  if (!dateStr) return ''
  const [y, m, d] = String(dateStr).split('-')
  if (!y || !m || !d) return dateStr
  const raw = `${d}/${m}/${y}`
  if (lang === 'en') {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(y, m - 1, d))
  }
  return raw.replace(/\d/g, dg => PERSIAN_DIGITS[Number(dg)])
}

function Reviews({ product }) {
  const { t, i18n } = useTranslation()
  const { reviews, summary, add } = useReviews(product)
  const [form, setForm] = useState({ name: '', rating: 5, text: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSend(e) {
    e.preventDefault()
    const name = form.name.trim()
    const text = form.text.trim()
    if (!name || !text) return
    add({ author: name, rating: clampRating(form.rating), text })
    setSubmitted(true)
    setForm({ name: '', rating: 5, text: '' })
  }

  return (
    <section className="reviews" aria-labelledby="reviews-heading">
      <div className="reviews-header">
        <h2 id="reviews-heading">{t('reviews.title')}</h2>
        <p>{t('reviews.subtitle')}</p>
      </div>

      <div className="reviews-summary">
        <div className="reviews-score">
          <strong className="reviews-avg">{summary ? summary.average.toFixed(1) : '—'}</strong>
          {summary ? (
            <RatingStars
              value={summary.average}
              ariaLabel={t('reviews.ariaAverage', { count: summary.average.toFixed(1) })}
            />
          ) : null}
          {summary && (
            <span className="reviews-count">{t('reviews.count', { count: summary.count })}</span>
          )}
        </div>

        {summary && (
          <div className="reviews-distribution" role="list" aria-label={t('reviews.title')}>
            {summary.distribution.map(d => (
              <div className="reviews-bar-row" role="listitem" key={d.stars}>
                <span className="reviews-bar-label">
                  {d.stars}<span aria-hidden="true">★</span>
                </span>
                <span className="reviews-bar">
                  <span
                    className="reviews-bar-fill"
                    style={{ width: `${summary.count ? (d.count / summary.count) * 100 : 0}%` }}
                  />
                </span>
                <span className="reviews-bar-count">{d.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="review-list">
        {reviews.length === 0 ? (
          <p className="reviews-empty">{t('reviews.noReviews')}</p>
        ) : (
          <ul className="reviews-list">
            {reviews.map(r => (
              <li className="review-card" key={r.id}>
                <div className="review-top">
                  <span className="review-author">{r.author}</span>
                  <RatingStars value={r.rating} ariaLabel={t('reviews.ariaStars', { count: r.rating })} />
                </div>
                <div className="review-meta">
                  <span className="review-date">{formatDate(r.date, i18n.language)}</span>
                  {r.verified && <span className="review-verified">✓ {t('reviews.verified')}</span>}
                </div>
                <p className="review-text">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="review-form" onSubmit={handleSend} aria-label={t('reviews.writeTitle')}>
        <h3 className="review-form-title">{t('reviews.writeTitle')}</h3>
        {submitted && <p className="review-thanks" role="status">{t('reviews.thanks')}</p>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="review-name">{t('reviews.nameLabel')}</label>
            <input
              id="review-name"
              type="text"
              name="name"
              value={form.name}
              required
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={t('reviews.namePlaceholder')}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('reviews.ratingLabel')}</label>
          <RatingStars
            value={form.rating}
            onChange={rating => setForm({ ...form, rating })}
            ariaLabel={t('reviews.ratingLabel')}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="review-text">{t('reviews.commentLabel')}</label>
          <textarea
            id="review-text"
            name="text"
            rows={3}
            value={form.text}
            required
            onChange={e => setForm({ ...form, text: e.target.value })}
            placeholder={t('reviews.commentPlaceholder')}
          />
        </div>
        <button type="submit" className="btn btn-primary">{t('reviews.submit')}</button>
      </form>
    </section>
  )
}

export default function ProductReviews({ product }) {
  return (
    <Reveal>
      <div className="prod-card reviews-wrap">
        <Reviews product={product} />
      </div>
    </Reveal>
  )
}