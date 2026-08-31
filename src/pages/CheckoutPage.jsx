// Checkout flow: contact/shipping form → order summary → payment method →
// submission (currently compiled into a WhatsApp order message, consistent
// with the existing sales channel) → confirmation screen. No backend yet, so
// the completed order is stored locally to show a confirmation reference.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice } from '../utils/price'
import { whatsappUrl } from '../config/contact'
import { track } from '../utils/track'
import useSeo from '../hooks/useSeo'

const ORDER_STORAGE = 'aquapro.orders.v1'

function orderReference() {
  return 'AQ-' + Date.now().toString(36).toUpperCase().slice(-6)
}

function saveOrder(orderRef, summary, total, payment) {
  try {
    const existing = JSON.parse(window.localStorage.getItem(ORDER_STORAGE) || '[]')
    existing.unshift({ ref: orderRef, items: summary, total, payment, at: Date.now() })
    window.localStorage.setItem(ORDER_STORAGE, JSON.stringify(existing.slice(0, 20)))
  } catch {
    // storage unavailable — confirmation still works for this session
  }
}

function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const cart = useCart()
  const catalog = useCatalog()
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', email: '' })
  const [payment, setPayment] = useState('whatsapp')
  const [confirm, setConfirm] = useState(null)

  useSeo({ title: t('checkout.title'), description: t('checkout.description'), path: '/checkout/' })

  const lines = cart.items
    .map(item => {
      const product = catalog?.product(item.key)
      if (!product) return null
      const lineTotal = product.price * item.qty
      return {
        key: item.key,
        qty: item.qty,
        title: product.title,
        price: product.price,
        lineTotal,
      }
    })
    .filter(Boolean)

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const linesText = lines
      .map(l => `${l.title} ×${l.qty} — ${formatPrice(l.lineTotal, i18n.language)} ${t('product.toman')}`)
      .join('\n')

    const message = t('checkout.orderTemplate', {
      name: form.name,
      phone: form.phone,
      lines: linesText,
      subtotal: `${formatPrice(subtotal, i18n.language)} ${t('product.toman')}`,
      payment: t(`checkout.payment.${payment}`),
    })

    const ref = orderReference()
    track('checkout_submit', { count: cart.count, subtotal, payment, ref })
    saveOrder(ref, lines, subtotal, payment)
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer')
    cart.clear()
    setConfirm(ref)
  }

  if (confirm) {
    return (
      <section className="cat-page">
        <div className="container">
          <div className="checkout-confirm">
            <div className="checkout-confirm-icon" aria-hidden="true">✓</div>
            <h2>{t('checkout.doneTitle')}</h2>
            <p>{t('checkout.doneSubtitle')}</p>
            <div className="checkout-confirm-ref">{confirm}</div>
            <p className="checkout-confirm-note">{t('checkout.doneNote')}</p>
            <Link to="/" className="btn btn-primary">{t('checkout.backHome')}</Link>
          </div>
        </div>
      </section>
    )
  }

  if (lines.length === 0) {
    return (
      <section className="cat-page">
        <div className="container checkout-empty">
          <div className="cart-empty-icon" aria-hidden="true">🛒</div>
          <h2>{t('checkout.emptyTitle')}</h2>
          <p>{t('checkout.empty')}</p>
          <Link to="/" className="btn btn-primary">{t('checkout.browse')}</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="cat-page">
      <div className="container">
        <div className="cat-page-header">
          <h2>{t('checkout.title')}</h2>
          <p>{t('checkout.subtitle')}</p>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h3 className="checkout-section-title">{t('checkout.shipping')}</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('checkout.name')}</label>
                <input type="text" name="name" required value={form.name} onChange={handleChange}
                  placeholder={t('checkout.namePlaceholder')} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('checkout.phone')}</label>
                <input type="tel" name="phone" required pattern="[0-9۰-۹\+()\s-]+" value={form.phone}
                  onChange={handleChange} placeholder={t('checkout.phonePlaceholder')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('checkout.city')}</label>
              <input type="text" name="city" required value={form.city} onChange={handleChange}
                placeholder={t('checkout.cityPlaceholder')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('checkout.address')}</label>
              <textarea name="address" rows={3} required value={form.address} onChange={handleChange}
                placeholder={t('checkout.addressPlaceholder')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('checkout.email')} <span className="form-optional">({t('checkout.optional')})</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder={t('checkout.emailPlaceholder')} />
            </div>

            <h3 className="checkout-section-title">{t('checkout.paymentTitle')}</h3>
            <div className="payment-options">
              <label className={`payment-option ${payment === 'whatsapp' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="whatsapp" checked={payment === 'whatsapp'}
                  onChange={e => setPayment(e.target.value)} />
                <span className="payment-option-body">
                  <strong>{t('checkout.payment.whatsapp')}</strong>
                  <small>{t('checkout.payment.whatsappDesc')}</small>
                </span>
              </label>
              <label className={`payment-option ${payment === 'cod' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="cod" checked={payment === 'cod'}
                  onChange={e => setPayment(e.target.value)} />
                <span className="payment-option-body">
                  <strong>{t('checkout.payment.cod')}</strong>
                  <small>{t('checkout.payment.codDesc')}</small>
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary checkout-submit">
              {t('checkout.placeOrder')}
            </button>
            <p className="checkout-disclaimer">{t('checkout.disclaimer')}</p>
          </form>

          <aside className="checkout-summary">
            <h3 className="checkout-section-title">{t('checkout.summary')}</h3>
            <ul className="checkout-lines">
              {lines.map(l => (
                <li key={l.key} className="checkout-line">
                  <span className="checkout-line-name">{l.title} <em>×{l.qty}</em></span>
                  <span className="checkout-line-price">{formatPrice(l.lineTotal, i18n.language)} <small>{t('product.toman')}</small></span>
                </li>
              ))}
            </ul>
            <div className="checkout-total">
              <span>{t('checkout.total', { count: cart.count })}</span>
              <strong>{formatPrice(subtotal, i18n.language)} <small>{t('product.toman')}</small></strong>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default CheckoutPage
