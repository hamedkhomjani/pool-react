import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import products, { categories } from '../data/products'
import { translateProduct, translateChipLabel, translateSpecLabel } from '../i18n/product'
import useSeo from '../hooks/useSeo'

function CategoryPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const [selected, setSelected] = useState(null)

  const category = categories.find(c => c.slug === slug)
  const categoryName = category ? t(`categories.${category.slug}`) : ''
  const categoryProducts = products
    .filter(p => p.category === slug)
    .map(p => translateProduct(t, p))

  useSeo({
    title: t('meta.categoryTitle', { name: categoryName }),
    description: t('meta.categoryDescription', { name: categoryName }),
  })

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

          {categoryProducts.length === 0 ? (
            <div className="cat-page-empty">
              <p>{t('categoryPage.empty')}</p>
              <Link to="/" className="btn btn-primary">{t('categoryPage.seeAll')}</Link>
            </div>
          ) : (
            <div className="product-grid">
              {categoryProducts.map((product, index) => (
                <div className="product-card" key={index} onClick={() => setSelected(product)}>
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
              ))}
            </div>
          )}
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

export default CategoryPage
