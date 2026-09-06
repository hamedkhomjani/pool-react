import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import useSeo from '../hooks/useSeo'
import ProductModal from '../components/ProductModal'
import ProductCard from '../components/ProductCard'
import { filterProducts, PAGE_SIZE } from '../utils/productFilters'
import { track } from '../utils/track'
import { SITE_URL } from '../config/site'

function BrandPage() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const [selectedKey, setSelectedKey] = useState(null)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const catalog = useCatalog()

  const brand = catalog?.brand(slug)
  const products = useMemo(
    () => (catalog && slug ? catalog.brandProducts(slug) : []),
    [catalog, slug],
  )
  const sorted = useMemo(
    () =>
      filterProducts(products, { sort: 'featured', sortLang: i18n.language }),
    [products, i18n.language],
  )

  const visibleProducts = sorted.slice(0, visible)
  const hasMore = sorted.length > visible
  const selected = sorted.find(p => p.key === selectedKey)

  const jsonLd = useMemo(
    () =>
      brand
        ? {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: brand.name,
            url: `${SITE_URL}/brand/${brand.slug}/`,
            description: t(`brands.${brand.slug}.bio`),
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: sorted.map((p, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: p.title,
                url: `${SITE_URL}/product/${p.key}/`,
              })),
            },
          }
        : null,
    [brand, sorted, t],
  )

  useSeo({
    title: brand ? t('meta.brandTitle', { name: brand.name }) : t('brandPage.notFound'),
    description: brand ? t('meta.brandDescription', { name: brand.name }) : t('meta.defaultDescription'),
    path: `/brand/${slug}/`,
    jsonLd,
  })

  useEffect(() => {
    if (brand) track('brand_view', { slug })
  }, [brand, slug])

  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [sorted])

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

  if (!brand) {
    return (
      <section className="cat-page">
        <div className="container page-state">
          <h2>{t('brandPage.notFound')}</h2>
          <Link to="/" className="btn btn-primary">{t('categoryPage.backHome')}</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="cat-page">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <span className="breadcrumbs-item">
              <span className="breadcrumbs-sep" aria-hidden="true">/</span>
              <span className="breadcrumbs-current">{brand.name}</span>
            </span>
          </nav>

          <div className="cat-page-header brand-page-header">
            <div className="cat-page-icon" aria-hidden="true">{brand.icon}</div>
            <h2>{brand.name}</h2>
            <p>{t('brandPage.subtitle', { name: brand.name, count: sorted.length })}</p>
          </div>

          <p className="brand-bio">{t(`brands.${brand.slug}.bio`)}</p>

          {sorted.length === 0 ? (
            <div className="cat-page-empty">
              <p>{t('brandPage.empty', { name: brand.name })}</p>
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
                    <span className="load-more-count">({sorted.length - visible})</span>
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

export default BrandPage