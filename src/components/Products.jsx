import { useState } from 'react'
import products from '../data/products'
import Reveal from './Reveal'

function Products() {
  const [selected, setSelected] = useState(null)

  return (
    <>
      <section className="products-section" id="products">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <h2>محبوب‌ترین تجهیزات تصفیه و گرمایش</h2>
              <p>انتخاب شده از برترین برندهای بین‌المللی با بالاترین بازدهی انرژی</p>
            </div>
          </Reveal>
          <div className="product-grid">
            {products.map((product, index) => (
              <Reveal key={index} delay={index * 80}>
                <div className="product-card" onClick={() => setSelected(product)}>
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

export default Products
