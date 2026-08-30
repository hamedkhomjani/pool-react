import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice } from '../utils/price'
import { filterProducts, hasActiveFilters, PAGE_SIZE } from '../utils/productFilters'
import { translateChipLabel } from '../i18n/product'
import useSeo from '../hooks/useSeo'
import ProductModal from '../components/ProductModal'
import { track } from '../utils/track'

function CategoryPage() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const [selectedKey, setSelectedKey] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState('featured')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const catalog = useCatalog()

  const category = catalog?.category(slug)
  const categoryName = category ? t(`categories.${category.slug}`) : ''

  const baseProducts = useMemo(
    () => (catalog ? catalog.categoryProducts(slug) : []),
    [catalog, slug],
  )

  const categoryBrands = useMemo(() => {
    if (!catalog) return []
    const present = new Set(baseProducts.map(p => p.brandId))
    return catalog.brands.filter(b => present.has(b.slug))
  }, [catalog, baseProducts])

  const filtered = useMemo(
    () =>
      filterProducts(baseProducts, {
        brands: selectedBrands,
        min: priceMin,
        max: priceMax,
        sort,
        sortLang: i18n.language,
      }),
    [baseProducts, selectedBrands, priceMin, priceMax, sort, i18n.language],
  )

  const visibleProducts = filtered.slice(0, visible)
  const hasMore = filtered.length > visible
  const activeFilters = hasActiveFilters({ brands: selectedBrands, min: priceMin, max: priceMax })

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

  useEffect(() => {
    setSelectedBrands([])
    setPriceMin('')
    setPriceMax('')
    setSort('featured')
  }, [slug])

  const selected = baseProducts.find(p => p.key === selectedKey)

  function resetFilters() {
    setSelectedBrands([])
    setPriceMin('')
    setPriceMax('')
    setSort('featured')
  }

  function toggleBrand(brandSlug) {
    setSelectedBrands(current =>
      current.includes(brandSlug)
        ? current.filter(b => b !== brandSlug)
        : [...current, brandSlug],
    )
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
          <div className="cat-page-header">
            <Link to="/" className="cat-page-back">{t('categoryPage.back')}</Link>
            <div className="cat-page-icon">{category.icon}</div>
            <h2>{categoryName}</h2>
            <p>{t('categoryPage.subtitle', { name: categoryName })}</p>
          </div>

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
              <div className="filter-group">
                <span className="filter-label">{t('filters.brand')}</span>
                <div className="filter-chips">
                  {categoryBrands.map(brand => (
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

              <div className="filter-group">
                <span className="filter-label">{t('filters.price')}</span>
                <div className="filter-price">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder={t('filters.from')}
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    aria-label={t('filters.from')}
                  />
                  <span className="filter-price-sep">–</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder={t('filters.to')}
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    aria-label={t('filters.to')}
                  />
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">{t('filters.sort')}</span>
                <select
                  className="filter-sort"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
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
                  <div className="product-card" key={product.key} onClick={() => setSelectedKey(product.key)}>
                    {product.badge && <span className="badge-top">{product.badge}</span>}
                    <div className="product-image">{product.icon}</div>
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-desc">{product.desc}</p>
                    <div className="product-specs">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <span key={key}><strong>{translateChipLabel(t, key)}:</strong> {value}</span>
                      ))}
                    </div>
                    <div className="product-footer">
                      <div className="product-price">{formatPrice(product.price, i18n.language)} <span>{t('product.toman')}</span></div>
                      <Link to={`/product/${product.key}`} className="btn btn-primary" onClick={e => e.stopPropagation()}>
                        {t('product.details')}
                      </Link>
                    </div>
                  </div>
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