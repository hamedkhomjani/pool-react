import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import Reveal from './Reveal'
import ProductModal from './ProductModal'
import ProductCard from './ProductCard'

// Curated "featured" strip for the homepage: whichever products carry the
// `featured` flag in their base facts (a simple, data-driven upsell surface
// that can later be driven per-language or A/B tested).
function FeaturedProducts() {
  const { t } = useTranslation()
  const [selectedKey, setSelectedKey] = useState(null)
  const catalog = useCatalog()

  if (!catalog) return null

  const featured = catalog.products.filter(p => p.featured).slice(0, 3)
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
              <ProductCard product={product} onSelect={() => setSelectedKey(product.key)} />
            </Reveal>
          ))}
        </div>
      </div>
      {selected && <ProductModal product={selected} onClose={() => setSelectedKey(null)} />}
    </section>
  )
}

export default FeaturedProducts
