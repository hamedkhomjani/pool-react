import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import { filterProducts, hasActiveFilters, buildFacets, PAGE_SIZE } from '../utils/productFilters'
import useSeo from '../hooks/useSeo'
import ProductModal from '../components/ProductModal'
import ProductCard from '../components/ProductCard'
import Breadcrumbs from '../components/Breadcrumbs'
import { track } from '../utils/track'

// Attribute keys that drive the faceted filter UI. Values selected for these
// are persisted in the URL; presence here sets a stable display order.
const FACET_ORDER = ['type', 'brand', 'size', 'material', 'horsePower', 'power', 'capacity', 'flowRate', 'diameter', 'lampLife']

function parseMulti(searchParams, key) {
  const raw = searchParams.get(key)
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

function CategoryPage() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedKey, setSelectedKey] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const catalog = useCatalog()

  const category = catalog?.category(slug)
  const categoryName = category ? t(`categories.${category.slug}`) : ''

  const selectedBrands = parseMulti(searchParams, 'brand')
  const priceMin = searchParams.get('min') || ''
  const priceMax = searchParams.get('max') || ''
  const sort = searchParams.get('sort') || 'featured'

  // Build facet selections from URL: any param key registered in FACET_ORDER.
  const selectedFacets = useMemo(() => {
    const out = {}
    for (const key of FACET_ORDER) {
      const values = parseMulti(searchParams, key)
      if (values.length) out[key] = values
    }
    return out
  }, [searchParams])

  const baseProducts = useMemo(
    () => (catalog ? catalog.categoryProducts(slug) : []),
    [catalog, slug],
  )

  const facetGroups = useMemo(() => buildFacets(baseProducts, FACET_ORDER), [baseProducts])

  const filtered = useMemo(
    () =>
      filterProducts(baseProducts, {
        brands: selectedBrands,
        min: priceMin,
        max: priceMax,
        facets: selectedFacets,
        sort,
        sortLang: i18n.language,
      }),
    [baseProducts, selectedBrands, priceMin, priceMax, selectedFacets, sort, i18n.language],
  )

  const visibleProducts = filtered.slice(0, visible)
  const hasMore = filtered.length > visible
  const activeFilters = hasActiveFilters({ brands: selectedBrands, min: priceMin, max: priceMax, facets: selectedFacets })

  const selected = baseProducts.find(p => p.key === selectedKey)

  // Subcategories to show when browsing a department.
  const subCategories = useMemo(
    () => (category ? catalog.categoryChildren(slug) : []),
    [catalog, category, slug],
  )

  useSeo({
    title: t('meta.categoryTitle', { name: categoryName }),
    description: t('meta.categoryDescription', { name: categoryName }),
    path: `/category/${slug}/`,
  })

  useEffect(() => {
    if (categoryName) track('category_view', { slug })
  }, [slug, categoryName])

  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [filtered])

  function updateParams(next) {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(next)) {
      if (value === '' || value == null) params.delete(key)
      else params.set(key, value)
    }
    setSearchParams(params, { replace: true })
    setVisible(PAGE_SIZE)
  }

  function toggleBrand(brandSlug) {
    const next = selectedBrands.includes(brandSlug)
      ? selectedBrands.filter(b => b !== brandSlug)
      : [...selectedBrands, brandSlug]
    updateParams({ brand: next.join(',') })
  }

  function toggleFacet(key, value) {
    const current = selectedFacets[key] || []
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    updateParams({ [key]: next.join(',') })
  }

  function resetFilters() {
    const params = new URLSearchParams()
    const s = searchParams.get('sort')
    if (s) params.set('sort', s)
    setSearchParams(params, { replace: true })
    setVisible(PAGE_SIZE)
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

  if (!category) {
    return (
      <section className="cat-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>{t('categoryPage.notFound')}</h2>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>{t('categoryPage.backHome')}</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="cat-page">
        <div className="container">
          <Breadcrumbs categorySlug={slug} />

          <div className="cat-page-header">
            <div className="cat-page-icon">{category.icon}</div>
            <h2>{categoryName}</h2>
            <p>{t('categoryPage.subtitle', { name: categoryName })}</p>
          </div>

          {subCategories.length > 0 && (
            <nav className="subcat-nav" aria-label={t('filters.subcategories')}>
              {subCategories.map(sub => (
                <Link key={sub.slug} to={`/category/${sub.slug}`} className="subcat-chip">
                  <span aria-hidden="true">{sub.icon}</span>
                  {t(`categories.${sub.slug}`)}
                </Link>
              ))}
            </nav>
          )}

          <div className="filter-bar">
            <div className="filter-bar-head">
              <span className="filter-bar-count">{t('search.resultsCount', { count: filtered.length })}</span>
              <button
                className="filter-bar-toggle"
                onClick={() => setFiltersOpen(o => !o)}
                aria-expanded={filtersOpen}
              >
                {t('filters.showFilters')}
                <svg className="filter-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className={`filter-panel ${filtersOpen ? 'open' : ''}`}>

              {facetGroups.map(group => (
                <div className="filter-group" key={group.key}>
                  <span className="filter-label">{t(`product.attributeLabels.${group.key}`, { defaultValue: group.key })}</span>
                  <div className="filter-chips">
                    {group.values.map(value => (
                      <button
                        key={value}
                        type="button"
                        className={`chip ${(selectedFacets[group.key] || []).includes(value) ? 'active' : ''}`}
                        onClick={() => toggleFacet(group.key, value)}
                        aria-pressed={(selectedFacets[group.key] || []).includes(value)}
                      >
                        {value}
                        {group.counts[value] != null && group.counts[value] > 1 && (
                          <span className="chip-count">({group.counts[value]})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {!facetGroups.some(g => g.key === 'brand') && (
                <div className="filter-group">
                  <span className="filter-label">{t('filters.brand')}</span>
                  <div className="filter-chips">
                    {catalog
                      .categoryProducts(slug)
                      .map(p => p.brandId)
                      .filter((v, i, a) => v && a.indexOf(v) === i)
                      .map(brandId => catalog.brand(brandId))
                      .filter(Boolean)
                      .map(brand => (
                        <button
                          key={brand.slug}
                          type="button"
                          className={`chip ${selectedBrands.includes(brand.slug) ? 'active' : ''}`}
                          onClick={() => toggleBrand(brand.slug)}
                          aria-pressed={selectedBrands.includes(brand.slug)}
                        >
                          {brand.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="filter-group">
                <span className="filter-label">{t('filters.price')}</span>
                <div className="filter-price">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder={t('filters.from')}
                    value={priceMin}
                    onChange={e => updateParams({ min: e.target.value })}
                    aria-label={t('filters.from')}
                  />
                  <span className="filter-price-sep">–</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder={t('filters.to')}
                    value={priceMax}
                    onChange={e => updateParams({ max: e.target.value })}
                    aria-label={t('filters.to')}
                  />
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">{t('filters.sort')}</span>
                <select
                  className="filter-sort"
                  value={sort}
                  onChange={e => updateParams({ sort: e.target.value })}
                  aria-label={t('filters.sort')}
                >
                  <option value="featured">{t('filters.sortFeatured')}</option>
                  <option value="price-asc">{t('filters.sortPriceAsc')}</option>
                  <option value="price-desc">{t('filters.sortPriceDesc')}</option>
                  <option value="name">{t('filters.sortName')}</option>
                </select>
              </div>

              {activeFilters && (
                <button type="button" className="filter-clear" onClick={resetFilters}>
                  {t('filters.clear')}
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="cat-page-empty">
              <p>{t('categoryPage.empty')}</p>
              {activeFilters && (
                <button type="button" className="btn btn-primary" onClick={resetFilters}>
                  {t('filters.clear')}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="product-grid">
                {visibleProducts.map(product => (
                  <ProductCard key={product.key} product={product} onSelect={() => setSelectedKey(product.key)} />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-wrap">
                  <button type="button" className="btn btn-outline load-more" onClick={() => setVisible(v => v + PAGE_SIZE)}>
                    {t('filters.loadMore')}
                    <span className="load-more-count">({filtered.length - visible})</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selected && <ProductModal product={selected} onClose={() => setSelectedKey(null)} />}
    </>
  )
}

export default CategoryPage
