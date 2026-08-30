import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice } from '../utils/price'
import { whatsappUrl } from '../config/contact'
import { track } from '../utils/track'

function CartDrawer({ open, onClose }) {
  const { t, i18n } = useTranslation()
  const cart = useCart()
  const catalog = useCatalog()

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  const lines = cart.items
    .map(item => {
      const product = catalog?.product(item.key)
      if (!product) return null
      const lineTotal = product.price * item.qty
      return {
        ...item,
        product,
        lineTotal,
        label: `${product.title} ×${item.qty} — ${formatPrice(lineTotal, i18n.language)} ${t('product.toman')}`,
      }
    })
    .filter(Boolean)

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)

  function checkout() {
    const body = lines.map(l => l.label).join('\n')
    const message = t('cart.checkoutTemplate', {
      lines: body,
      subtotal: `${formatPrice(subtotal, i18n.language)} ${t('product.toman')}`,
    })
    track('cart_checkout', { count: cart.count, subtotal })
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="cart-root">
      <div className="cart-backdrop" onClick={onClose} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
        <div className="cart-head">
          <h3 className="cart-title">{t('cart.title')}</h3>
          <button className="cart-close" onClick={onClose} aria-label={t('chatbot.close')}>✕</button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon" aria-hidden="true">🛒</div>
            <p>{t('cart.empty')}</p>
            <Link to="/" className="btn btn-outline" onClick={onClose}>{t('cart.browse')}</Link>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {lines.map(({ key, product, qty, lineTotal }) => (
                <li className="cart-item" key={key}>
                  <div className="cart-item-icon" aria-hidden="true">{product.icon}</div>
                  <div className="cart-item-body">
                    <Link
                      to={`/product/${key}`}
                      className="cart-item-title"
                      onClick={onClose}
                    >
                      {product.title}
                    </Link>
                    <div className="cart-item-price">
                      {formatPrice(lineTotal, i18n.language)} <span>{t('product.toman')}</span>
                    </div>
                    <div className="cart-item-row">
                      <div className="cart-qty" role="group" aria-label={t('cart.qty')}>
                        <button
                          type="button"
                          onClick={() => cart.setQty(key, qty + 1)}
                          aria-label={t('cart.inc')}
                        >+</button>
                        <span className="cart-qty-value">{qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(key, qty - 1)}
                          aria-label={t('cart.dec')}
                          disabled={qty <= 1}
                        >−</button>
                      </div>
                      <button type="button" className="cart-item-remove" onClick={() => cart.remove(key)}>
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>{t('cart.subtotal')} ({cart.count})</span>
                <strong>{formatPrice(subtotal, i18n.language)} {t('product.toman')}</strong>
              </div>
              <button type="button" className="btn btn-primary cart-checkout" onClick={checkout}>
                {t('cart.checkout')}
              </button>
              <button type="button" className="cart-clear" onClick={cart.clear}>
                {t('cart.clearCart')}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer