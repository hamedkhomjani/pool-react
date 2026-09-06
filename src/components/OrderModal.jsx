import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/price'
import { whatsappUrl } from '../config/contact'
import { track } from '../utils/track'

function buildFullMessage(t, lang, product, qty, name, phone) {
  return t('productPage.orderTemplateFull', {
    name: product.title,
    model: product.detailSpecs.model || '',
    qty: String(qty),
    price: formatPrice(product.price, lang),
    customerName: name.trim() || '-',
    customerPhone: phone.trim(),
  })
}

function OrderModal({ product, initialQty = 1, open, onClose }) {
  const { t, i18n } = useTranslation()
  const [qty, setQty] = useState(initialQty)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setQty(initialQty)
      setError('')
    }
  }, [open, initialQty])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !product) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError(t('contact.phoneRequired'))
      return
    }
    setError('')
    const url = whatsappUrl(buildFullMessage(t, i18n.language, product, qty, name, phone))
    track('order_now', { key: product.key, title: product.title, qty })
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="modal-overlay order-modal-overlay" onClick={onClose}>
      <div
        className="modal-content consultation-modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <button className="modal-close" onClick={onClose} aria-label={t('consultation.closeBtn')}>
          ✕
        </button>

        <div className="consultation-modal-header">
          <div className="consultation-badge-icon">🛒</div>
          <h3 id="order-modal-title">{t('productPage.orderModalTitle')}</h3>
          <p>{t('productPage.orderModalSubtitle')}</p>
        </div>

        <div className="order-product-summary">
          <div className="order-product-icon">{product.icon}</div>
          <div>
            <div className="order-product-title">{product.title}</div>
            <div className="order-product-price">
              {formatPrice(product.price, i18n.language)} <span>{t('product.toman')}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="consultation-form">
          {error && <div className="consultation-error-box">{error}</div>}

          <div className="consultation-field">
            <label htmlFor="order-qty">{t('productPage.orderQty')}</label>
            <div className="cart-qty order-qty" role="group" aria-label={t('cart.qty')}>
              <button type="button" onClick={() => setQty(q => q + 1)} aria-label={t('cart.inc')}>+</button>
              <span className="cart-qty-value">{qty}</span>
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label={t('cart.dec')} disabled={qty <= 1}>−</button>
            </div>
          </div>

          <div className="consultation-field">
            <label htmlFor="order-name">{t('productPage.orderName')}</label>
            <input
              id="order-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('productPage.orderNamePlaceholder')}
            />
          </div>

          <div className="consultation-field">
            <label htmlFor="order-phone">
              {t('productPage.orderPhone')} <span className="req-star">*</span>
            </label>
            <input
              id="order-phone"
              type="tel"
              required
              dir="ltr"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder={t('productPage.orderPhonePlaceholder')}
            />
          </div>

          <button type="submit" className="btn btn-primary consultation-submit-btn">
            {t('productPage.orderSubmit')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OrderModal
