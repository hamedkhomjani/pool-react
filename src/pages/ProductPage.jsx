import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import products, { categories } from '../data/products'
import { translateProduct, translateChipLabel, translateSpecLabel } from '../i18n/product'
import useSeo from '../hooks/useSeo'
import Reveal from '../components/Reveal'

const CONTACT_CONFIG = {
  whatsappNumber: '989123456789',
  phone: '+982188888888',
}

function buildOrderMessage(t, product) {
  return t('productPage.orderTemplate', {
    name: product.title,
    model: product.detailSpecs.model || '',
    price: product.price,
  })
}

function ProductPage() {
  const { key } = useParams()
  const { t } = useTranslation()

  const product = translateProduct(t, products.find(p => p.key === key))
  const category = product ? categories.find(c => c.slug === product.category) : null
  const categoryName = category ? t(`categories.${category.slug}`) : ''

  const related = product
    ? products
        .filter(p => p.category === product.category && p.key !== product.key)
        .map(p => translateProduct(t, p))
    : []

  const canonical = `${window.location.origin}/product/${key}/`

  useSeo({
    title: product ? `${product.title} | ${t('brand')}` : t('productPage.notFound'),
    description: product ? product.desc : t('meta.defaultDescription'),
    canonical,
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.desc,
          category: categoryName,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'IRR',
            price: product.price.replace(/[^\d]/g, ''),
            availability: 'https://schema.org/InStock',
          },
        }
      : null,
  })

  if (!product) {
    return (
      <section className="prod-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>{t('productPage.notFound')}</h2>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>{t('categoryPage.backHome')}</Link>
        </div>
      </section>
    )
  }

  const orderUrl = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(buildOrderMessage(t, product))}`

  return (
    <>
      <section className="prod-page">
        <div className="container">
          <Reveal>
            <nav className="prod-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">{t('nav.home')}</Link>
              <span className="prod-breadcrumb-sep">/</span>
              <Link to={`/category/${product.category}`}>{categoryName}</Link>
              <span className="prod-breadcrumb-sep">/</span>
              <span className="prod-breadcrumb-current">{product.title}</span>
            </nav>
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
                <div className="prod-price">{product.price} <span>{t('product.toman')}</span></div>
                <p className="prod-desc">{product.longDesc}</p>
                <div className="prod-specs-chips">
                  {Object.entries(product.specs).map(([specKey, value]) => (
                    <span className="prod-chip" key={specKey}>
                      <strong>{translateChipLabel(t, specKey)}:</strong> {value}
                    </span>
                  ))}
                </div>
                <div className="prod-actions">
                  <a href={orderUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    {t('productPage.orderNow')}
                  </a>
                  <a href={`tel:${CONTACT_CONFIG.phone}`} className="btn btn-outline">
                    {t('productPage.callConsult')}
                  </a>
                </div>
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
                  {related.map((rel, index) => (
                    <Link to={`/product/${rel.key}`} className="product-card" key={index} style={{ textDecoration: 'none' }}>
                      {rel.badge && <span className="badge-top">{rel.badge}</span>}
                      <div className="product-image">{rel.icon}</div>
                      <h3 className="product-title">{rel.title}</h3>
                      <p className="product-desc">{rel.desc}</p>
                      <div className="product-specs">
                        {Object.entries(rel.specs).map(([specKey, value]) => (
                          <span key={specKey}><strong>{translateChipLabel(t, specKey)}:</strong> {value}</span>
                        ))}
                      </div>
                      <div className="product-footer">
                        <div className="product-price">{rel.price} <span>{t('product.toman')}</span></div>
                        <span className="btn btn-primary">{t('product.details')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  )
}

export default ProductPage
