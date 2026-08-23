import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import products, { categories } from '../data/products'
import { translateProduct, translateChipLabel } from '../i18n/product'
import useSeo from '../hooks/useSeo'
import ProductModal from '../components/ProductModal'

function CategoryPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const [selectedKey, setSelectedKey] = useState(null)

  const category = categories.find(c => c.slug === slug)
  const categoryName = category ? t(`categories.${category.slug}`) : ''
  const categoryProducts = products
    .filter(p => p.category === slug)
    .map(p => translateProduct(t, p))
  const selected = selectedKey ? categoryProducts.find(p => p.key === selectedKey) : null

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
              {categoryProducts.map(product => (
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

      {selected && <ProductModal product={selected} onClose={() => setSelectedKey(null)} />}
    </>
  )
}

export default CategoryPage
