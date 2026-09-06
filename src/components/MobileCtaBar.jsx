import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'

function MobileCtaBar() {
  const { t } = useTranslation()
  const cart = useCart()
  const { openCart, openSearch, openConsultation } = useUI()

  return (
    <nav className="mobile-cta-bar" aria-label={t('mobileCta.navLabel')}>
      {/* Call / Consultation */}
      <button
        className="mobile-cta-btn mobile-cta-call"
        onClick={openConsultation}
        aria-label={t('mobileCta.call')}
      >
        <svg className="mobile-cta-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.1a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16.5l.42.42z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{t('mobileCta.call')}</span>
      </button>

      {/* Search */}
      <button
        className="mobile-cta-btn mobile-cta-search"
        onClick={openSearch}
        aria-label={t('search.ariaLabel')}
      >
        <svg className="mobile-cta-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span>{t('mobileCta.search')}</span>
      </button>

      {/* Cart — rightmost accessible thumb zone in RTL */}
      <button
        className="mobile-cta-btn mobile-cta-cart"
        onClick={openCart}
        aria-label={t('cart.openAria', { count: cart.count })}
      >
        <span className="mobile-cta-icon-wrap">
          <svg className="mobile-cta-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="9" cy="20" r="1.6" />
            <circle cx="17" cy="20" r="1.6" />
            <path d="M3 3h2l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20 7H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {cart.count > 0 && (
            <span key={cart.count} className="mobile-cta-badge">
              {cart.count > 99 ? '99+' : cart.count}
            </span>
          )}
        </span>
        <span>{t('mobileCta.cart')}</span>
      </button>

      {/* Calculator */}
      <a
        href="#guide-sizer"
        className="mobile-cta-btn mobile-cta-calc"
        aria-label={t('mobileCta.calc')}
      >
        <svg className="mobile-cta-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" strokeLinecap="round" />
        </svg>
        <span>{t('mobileCta.calc')}</span>
      </a>
    </nav>
  )
}

export default MobileCtaBar
