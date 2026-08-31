import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import useSeo from '../hooks/useSeo'
import ProductCard from '../components/ProductCard'
import { track } from '../utils/track'

function SearchPage() {
  const { t } = useTranslation()
  const catalog = useCatalog()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('q') || '')
  const query = (searchParams.get('q') || '').trim()

  useEffect(() => {
    setInput(searchParams.get('q') || '')
  }, [searchParams])

  useSeo({
    title: t('search.pageTitle'),
    description: t('search.pageDescription'),
    path: '/search/',
    noindex: true,
  })

  const results = query && catalog ? catalog.search(query) : []

  useEffect(() => {
    if (query) track('search', { query, results: results.length })
  }, [query, results.length])

  function submit(e) {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() }, { replace: true })
  }

  if (!catalog) {
    return (
      <section className="cat-page">
        <div className="container">
          <section className="page-loading" aria-hidden="true">
            <div className="page-loading-spinner" />
          </section>
        </div>
      </section>
    )
  }

  return (
    <section className="cat-page search-page">
      <div className="container">
        <div className="cat-page-header">
          <h2>{t('search.pageHeading')}</h2>
          <p>{t('search.hint')}</p>
        </div>

        <form className="search-page-form" role="search" onSubmit={submit}>
          <svg className="search-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.ariaLabel')}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit" className="btn btn-primary">{t('search.submit')}</button>
        </form>

        {!query ? (
          <div className="search-state">
            <p>{t('search.noQuery')}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="search-state">
            <p>{t('search.noResultsFor', { query })}</p>
            <Link to="/" className="btn btn-primary">{t('categoryPage.seeAll')}</Link>
          </div>
        ) : (
          <>
            <div className="search-count">{t('search.resultsCount', { count: results.length })}</div>
            <div className="product-grid">
              {results.map(product => (
                <ProductCard
                  key={product.key}
                  product={product}
                  onSelect={() => navigate(`/product/${product.key}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default SearchPage