import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice } from '../utils/price'
import { translateChipLabel } from '../i18n/product'
import Reveal from './Reveal'
import ProductModal from './ProductModal'

// Curated "featured" strip for the homepage: whichever products carry the
// `featured` flag in their base facts (a simple, data-driven upsell surface
// that can later be driven per-language or A/B tested).
function FeaturedProducts() {
  const { t, i18n } = useTranslation()
  const [selectedKey, setSelectedKey] = useState(null)
  const catalog = useCatalog()

  if (!catalog) return null

  const featured = catalog.products.filter(p => p.featured)
  if (featured.length === 0) return null

  const selected = selectedKey ? featured.find(p => p.key === selectedKey) : null

  return (
    <section className="featured-section">
      <div className="container">
        <Reveal>
          <div className="section-header">
            <span className="section-tag">{t('featured.tag')}</span>
            <h2>{t('featured.title')}</h2>
            <p>{t('featured.subtitle')}</p>
          </div>
        </Reveal>
        <div className="product-grid">
          {featured.map((product, index) => (
            <Reveal key={product.key} delay={index * 80}>
              <div className="product-card" onClick={() => setSelectedKey(product.key)}>
                {product.badge
                  ? <span className="badge-top">{product.badge}</span>
                  : <span className="badge-top badge-featured">{t('featured.star')}</span>}
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
            </Reveal>
          ))}
        </div>
      </div>
      {selected && <ProductModal product={selected} onClose={() => setSelectedKey(null)} />}
    </section>
  )
}

export default FeaturedProducts