import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { translateSpecLabel } from '../i18n/product'
import { whatsappUrl } from '../config/contact'

function ProductModal({ product, onClose }) {
  const { t } = useTranslation()

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const orderUrl = whatsappUrl(
    t('productPage.orderTemplate', {
      name: product.title,
      model: product.detailSpecs.model || '',
      price: product.price,
    }),
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={product.title}>
        <button className="modal-close" onClick={onClose} aria-label={t('chatbot.close')} autoFocus>✕</button>
        <div className="modal-header">
          <div className="modal-icon">{product.icon}</div>
          <div>
            <h3 className="modal-title">{product.title}</h3>
            <span className="modal-price">{product.price} <span>{t('product.toman')}</span></span>
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
        <a
          href={orderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary modal-cta"
        >
          {t('productPage.orderNow')}
        </a>
      </div>
    </div>
  )
}

export default ProductModal
