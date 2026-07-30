import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import products, { categories } from '../data/products'

function CategoryPage() {
  const { slug } = useParams()
  const [selected, setSelected] = useState(null)

  const category = categories.find(c => c.slug === slug)
  const categoryProducts = products.filter(p => p.category === slug)

  if (!category) {
    return (
      <section className="cat-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>دسته‌بندی یافت نشد</h2>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>بازگشت به صفحه اصلی</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="cat-page">
        <div className="container">
          <div className="cat-page-header">
            <Link to="/" className="cat-page-back">← بازگشت</Link>
            <div className="cat-page-icon">{category.icon}</div>
            <h2>{category.name}</h2>
            <p>مجموعه کاملی از {category.name} با بهترین برندها و قیمت</p>
          </div>

          {categoryProducts.length === 0 ? (
            <div className="cat-page-empty">
              <p>محصولی در این دسته‌بندی موجود نیست.</p>
              <Link to="/" className="btn btn-primary">مشاهده سایر محصولات</Link>
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
                      <span key={key}><strong>{key}:</strong> {value}</span>
                    ))}
                  </div>
                  <div className="product-footer">
                    <div className="product-price">{product.price} <span>تومان</span></div>
                    <span className="btn btn-primary">جزئیات بیشتر</span>
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
                <span className="modal-price">{selected.price} <span>تومان</span></span>
              </div>
            </div>
            <p className="modal-desc">{selected.longDesc}</p>
            <div className="modal-features">
              <h4>ویژگی‌های کلیدی</h4>
              <div className="features-grid">
                {selected.features.map((feat, i) => (
                  <div className="feature-item" key={i}>✓ {feat}</div>
                ))}
              </div>
            </div>
            <div className="modal-specs">
              <h4>مشخصات فنی</h4>
              <div className="specs-table">
                {selected.detailSpecs.map((spec, i) => (
                  <div className="spec-row" key={i}>
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary modal-cta">افزودن به سبد خرید</button>
          </div>
        </div>
      )}
    </>
  )
}

export default CategoryPage
