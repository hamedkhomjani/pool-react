import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import { track } from '../utils/track'

const MAX_RESULTS = 6

function SearchOverlay({ open, onClose }) {
  const { t } = useTranslation()
  const catalog = useCatalog()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q || !catalog) return []
    return catalog.search(q).slice(0, MAX_RESULTS)
  }, [query, catalog])

  function submit(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    track('search', { query: q, results: results.length })
    onClose()
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  function openProduct(key) {
    track('search_select', { query: query.trim(), key })
    onClose()
    navigate(`/product/${key}`)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = results[active]
      if (target) openProduct(target.key)
      else submit(e)
    }
  }

  if (!open) return null

  const trimmed = query.trim()

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label={t('search.label')}>
      <div className="search-backdrop" onClick={onClose} />
      <div className="search-panel">
        <form className="search-form" role="search" onSubmit={submit}>
          <svg className="search-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.ariaLabel')}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="button" className="search-close-btn" onClick={onClose} aria-label={t('chatbot.close')}>
            ✕
          </button>
        </form>

        <div className="search-results">
          {!trimmed ? (
            <p className="search-hint">{t('search.noQuery')}</p>
          ) : results.length === 0 ? (
            <p className="search-empty">{t('search.noResultsFor', { query: trimmed })}</p>
          ) : (
            <>
              <ul className="search-results-list">
                {results.map((p, i) => (
                  <li key={p.key}>
                    <button
                      type="button"
                      className={`search-result ${i === active ? 'active' : ''}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => openProduct(p.key)}
                    >
                      <span className="search-result-icon" aria-hidden="true">{p.icon}</span>
                      <span className="search-result-title">{p.title}</span>
                      {p.model && <span className="search-result-model">{p.model}</span>}
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="search-view-all" onClick={submit}>
                {t('search.viewAll', { query: trimmed })}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchOverlay