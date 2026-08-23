import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import products from '../data/products'
import { translateProduct, translateChipLabel } from '../i18n/product'
import Reveal from './Reveal'
import ProductModal from './ProductModal'

function Products() {
  const { t } = useTranslation()
  const [selectedKey, setSelectedKey] = useState(null)

  const items = products.map(p => translateProduct(t, p))
  const selected = selectedKey ? items.find(p => p.key === selectedKey) : null

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
              <Reveal key={product.key} delay={index * 80}>
                <div className="product-card" onClick={() => setSelectedKey(product.key)}>
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
                    <Link to={`/product/${product.key}`} className="btn btn-primary" onClick={e => e.stopPropagation()}>
                      {t('product.details')}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {selected && <ProductModal product={selected} onClose={() => setSelectedKey(null)} />}
    </>
  )
}

export default Products
