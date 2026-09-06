import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateSpecLabel } from '../i18n/product'
import OrderModal from './OrderModal'
import ProductPrice from './ProductPrice'
import { useCart } from '../context/CartContext'

function ProductModal({ product, onClose }) {
  const { t } = useTranslation()
  const cart = useCart()
  const [qty, setQty] = useState(1)
  const [orderOpen, setOrderOpen] = useState(false)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !orderOpen) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, orderOpen])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={product.title}>
          <button className="modal-close" onClick={onClose} aria-label={t('chatbot.close')} autoFocus>✕</button>
          <div className="modal-header">
            <div className="modal-icon">{product.icon}</div>
            <div>
              <h3 className="modal-title">{product.title}</h3>
              <ProductPrice product={product} className="modal-price" />
            </div>
          </div>
          <p className="modal-desc">{product.longDesc}</p>
          <div className="modal-features">
            <h4>{t('product.modalFeatures')}</h4>
            <div className="features-grid">
              {product.features.map((feat, i) => (
                <div className="feature-item" key={i}>✓ {feat}</div>
              ))}
            </div>
          </div>
          <div className="modal-specs">
            <h4>{t('product.modalSpecs')}</h4>
            <div className="specs-table">
              {Object.entries(product.detailSpecs).map(([key, value]) => (
                <div className="spec-row" key={key}>
                  <span className="spec-label">{translateSpecLabel(t, key)}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-cta-row">
            <div className="cart-qty" role="group" aria-label={t('cart.qty')}>
              <button type="button" onClick={() => setQty(q => q + 1)} aria-label={t('cart.inc')}>+</button>
              <span className="cart-qty-value">{qty}</span>
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label={t('cart.dec')} disabled={qty <= 1}>−</button>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => cart.add(product.key, qty)}>
              {t('cart.addToCart')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setOrderOpen(true)}>
              {t('productPage.orderNow')}
            </button>
          </div>
        </div>
      </div>

      <OrderModal
        product={product}
        initialQty={qty}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
      />
    </>
  )
}

export default ProductModal