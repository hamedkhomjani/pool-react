import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice } from '../utils/price'
import { translateChipLabel, translateSpecLabel } from '../i18n/product'
import { CONTACT_CONFIG } from '../config/contact'
import useSeo from '../hooks/useSeo'
import Reveal from '../components/Reveal'
import Breadcrumbs from '../components/Breadcrumbs'
import ProductCard from '../components/ProductCard'
import OrderModal from '../components/OrderModal'
import { useCart } from '../context/CartContext'
import { track } from '../utils/track'

function ProductPage() {
  const { key } = useParams()
  const { t, i18n } = useTranslation()
  const catalog = useCatalog()
  const cart = useCart()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const addedTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(addedTimer.current), [])

  function addToCart() {
    cart.add(product.key, qty)
    setAdded(true)
    window.clearTimeout(addedTimer.current)
    addedTimer.current = window.setTimeout(() => setAdded(false), 1800)
  }

  const product = catalog?.product(key)
  const category = product ? catalog.category(product.category) : null
  const categoryName = category ? t(`categories.${category.slug}`) : ''

  const related = product
    ? catalog
        .categoryProducts(product.category)
        .filter(p => p.key !== product.key)
    : []

  const canonical = `/product/${key}/`

  const jsonLd = useMemo(
    () =>
      product
        ? {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.desc,
            category: categoryName,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'IRR',
              price: product.price,
              availability: 'https://schema.org/InStock',
            },
          }
        : null,
    [product, categoryName],
  )

  useSeo({
    title: product ? `${product.title} | ${t('brand')}` : t('productPage.notFound'),
    description: product ? product.desc : t('meta.defaultDescription'),
    path: canonical,
    jsonLd,
  })

  useEffect(() => {
    if (product) track('product_view', { key: product.key, title: product.title })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.key])

  if (!product) {
    return (
      <section className="prod-page">
        <div className="container page-state">
          <h2>{t('productPage.notFound')}</h2>
          <Link to="/" className="btn btn-primary">{t('categoryPage.backHome')}</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="prod-page">
        <div className="container">
          <Reveal>
            <Breadcrumbs categorySlug={product.category} current={product.title} />
          </Reveal>

          <div className="prod-layout">
            <Reveal direction="right">
              <div className="prod-gallery">
                {product.badge && <span className="badge-top">{product.badge}</span>}
                <div className="prod-image">{product.icon}</div>
              </div>
            </Reveal>

            <Reveal direction="left">
              <div className="prod-info">
                <h1 className="prod-title">{product.title}</h1>
                <div className="prod-price">{formatPrice(product.price, i18n.language)} <span>{t('product.toman')}</span></div>
                <p className="prod-desc">{product.longDesc}</p>
                <div className="prod-specs-chips">
                  {Object.entries(product.specs).map(([specKey, value]) => (
                    <span className="prod-chip" key={specKey}>
                      <strong>{translateChipLabel(t, specKey)}:</strong> {value}
                    </span>
                  ))}
                </div>
                <div className="prod-actions">
                  <div className="cart-qty" role="group" aria-label={t('cart.qty')}>
                    <button type="button" onClick={() => setQty(q => q + 1)} aria-label={t('cart.inc')}>+</button>
                    <span className="cart-qty-value">{qty}</span>
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label={t('cart.dec')} disabled={qty <= 1}>−</button>
                  </div>
                  <button type="button" className={`btn btn-primary ${added ? 'added' : ''}`} onClick={addToCart}>
                    {added ? t('cart.added') : t('cart.addToCart')}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setOrderOpen(true)}>
                    {t('productPage.orderNow')}
                  </button>
                  <a href={CONTACT_CONFIG.phoneHref} className="btn btn-outline">
                    {t('productPage.callConsult')}
                  </a>
                </div>
                <ul className="prod-trust">
                  <li className="prod-trust-item">🛡️ <span>{t('productPage.trustOriginal')}</span></li>
                  <li className="prod-trust-item">📜 <span>{t('productPage.trustWarranty')}</span></li>
                  <li className="prod-trust-item">💬 <span>{t('productPage.trustSupport')}</span></li>
                </ul>
                <p className="prod-note">{t('productPage.authenticityNote')}</p>
              </div>
            </Reveal>
          </div>

          <div className="prod-details-grid">
            <Reveal>
              <div className="prod-card">
                <h3>{t('product.modalFeatures')}</h3>
                <div className="features-grid">
                  {product.features.map((feat, i) => (
                    <div className="feature-item" key={i}>✓ {feat}</div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="prod-card">
                <h3>{t('product.modalSpecs')}</h3>
                <div className="specs-table">
                  {Object.entries(product.detailSpecs).map(([specKey, value]) => (
                    <div className="spec-row" key={specKey}>
                      <span className="spec-label">{translateSpecLabel(t, specKey)}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {related.length > 0 && (
            <Reveal>
              <div className="prod-related">
                <h2>{t('productPage.relatedTitle')}</h2>
                <div className="product-grid">
                  {related.map(rel => (
                    <ProductCard
                      key={rel.key}
                      product={rel}
                      onSelect={() => navigate(`/product/${rel.key}`)}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <nav className="prod-mobile-cta" aria-label={t('productPage.mobileCtaLabel')}>
        <div className="cart-qty" role="group" aria-label={t('cart.qty')}>
          <button type="button" onClick={() => setQty(q => q + 1)} aria-label={t('cart.inc')}>+</button>
          <span className="cart-qty-value">{qty}</span>
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label={t('cart.dec')} disabled={qty <= 1}>−</button>
        </div>
        <button type="button" className={`btn btn-primary ${added ? 'added' : ''}`} onClick={addToCart}>
          {added ? t('cart.added') : t('cart.addToCart')}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => setOrderOpen(true)}>
          {t('productPage.orderNow')}
        </button>
      </nav>

      <OrderModal
        product={product}
        initialQty={qty}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
      />
    </>
  )
}

export default ProductPage