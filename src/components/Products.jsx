import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import products from '../data/products'
import { translateProduct, translateChipLabel, translateSpecLabel } from '../i18n/product'
import Reveal from './Reveal'

function Products() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(null)

  const items = products.map(p => translateProduct(t, p))

  return (
    <>
      <section className="products-section" id="products">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <h2>{t('productsSection.title')}</h2>
              <p>{t('productsSection.subtitle')}</p>
            </div>
          </Reveal>
          <div className="product-grid">
            {items.map((product, index) => (
              <Reveal key={index} delay={index * 80}>
                <div className="product-card" onClick={() => setSelected(product)}>
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
                    <div className="product-price">{product.price} <span>{t('product.toman')}</span></div>
                    <span className="btn btn-primary">{t('product.details')}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="modal-header">
              <div className="modal-icon">{selected.icon}</div>
              <div>
                <h3 className="modal-title">{selected.title}</h3>
                <span className="modal-price">{selected.price} <span>{t('product.toman')}</span></span>
              </div>
            </div>
            <p className="modal-desc">{selected.longDesc}</p>
            <div className="modal-features">
              <h4>{t('product.modalFeatures')}</h4>
              <div className="features-grid">
                {selected.features.map((feat, i) => (
                  <div className="feature-item" key={i}>✓ {feat}</div>
                ))}
              </div>
            </div>
            <div className="modal-specs">
              <h4>{t('product.modalSpecs')}</h4>
              <div className="specs-table">
                {Object.entries(selected.detailSpecs).map(([key, value]) => (
                  <div className="spec-row" key={key}>
                    <span className="spec-label">{translateSpecLabel(t, key)}</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary modal-cta">{t('product.addToCart')}</button>
          </div>
        </div>
      )}
    </>
  )
}

export default Products
