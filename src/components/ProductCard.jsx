// Reusable product listing card with integrated add-to-cart and compare
// toggles. Used by the home grids, category page, and search page so the
// purchase affordances stay consistent everywhere products are listed.
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import { useCart } from '../context/CartContext'
import { useCompare } from '../context/CompareContext'
import { formatPrice } from '../utils/price'
import { translateChipLabel } from '../i18n/product'
import { track } from '../utils/track'

function ProductCard({ product, onSelect }) {
  const { t, i18n } = useTranslation()
  const cart = useCart()
  const compare = useCompare()
  const catalog = useCatalog()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addedTimer = useRef(null)

  const inCompare = compare.contains(product.key)

  useEffect(() => () => window.clearTimeout(addedTimer.current), [])

  function addToCart(e) {
    e.stopPropagation()
    cart.add(product.key, qty)
    setQty(1)
    setAdded(true)
    window.clearTimeout(addedTimer.current)
    addedTimer.current = window.setTimeout(() => setAdded(false), 1800)
  }

  function toggleCompare(e) {
    e.stopPropagation()
    if (!inCompare && compare.isFull) {
      track('compare_full', { key: product.key })
      return
    }
    compare.toggle(product.key)
  }

  const compareDisabled = !inCompare && compare.isFull

  // Only render compare controls when a related product exists in the same
  // category (a compare set must share attributes to be meaningful).
  const hasComparable = catalog
    ? catalog.products.some(p => p.key !== product.key && p.category === product.category)
    : false

  return (
    <div className="product-card" onClick={onSelect}>
      <div className="card-top-actions">
        {product.badge
          ? <span className="badge-top">{product.badge}</span>
          : <span className="badge-top badge-placeholder" />}
        {hasComparable && (
          <button
            type="button"
            className={`compare-btn ${inCompare ? 'active' : ''}`}
            onClick={toggleCompare}
            aria-pressed={inCompare}
            aria-label={inCompare ? t('compare.remove') : t('compare.add')}
            title={inCompare ? t('compare.remove') : (compareDisabled ? t('compare.full') : t('compare.add'))}
            disabled={compareDisabled}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" width="16" height="16">
              <rect x="3" y="5" width="7" height="14" rx="1.5" />
              <rect x="14" y="3" width="7" height="16" rx="1.5" />
            </svg>
          </button>
        )}
      </div>

      <div className="product-image"><span className="product-image-inner">{product.icon}</span></div>
      <h3 className="product-title">{product.title}</h3>
      <p className="product-desc">{product.desc}</p>
      <div className="product-specs">
        {Object.entries(product.specs).map(([key, value]) => (
          <span key={key}><strong>{translateChipLabel(t, key)}:</strong> {value}</span>
        ))}
      </div>

      <div className="product-card-actions">
        <div className="card-qty" role="group" aria-label={t('cart.qty')}>
          <button type="button" onClick={e => { e.stopPropagation(); setQty(q => q + 1) }} aria-label={t('cart.inc')}>+</button>
          <span className="card-qty-value">{qty}</span>
          <button type="button" onClick={e => { e.stopPropagation(); setQty(q => Math.max(1, q - 1)) }} aria-label={t('cart.dec')} disabled={qty <= 1}>−</button>
        </div>
        <button type="button" className={`btn btn-primary card-add-btn ${added ? 'added' : ''}`} onClick={addToCart}>
          {added ? t('cart.added') : t('cart.addToCart')}
        </button>
      </div>

      <div className="product-footer">
        <div className="product-price">{formatPrice(product.price, i18n.language)} <span>{t('product.toman')}</span></div>
        <Link to={`/product/${product.key}`} className="btn btn-outline card-details-btn" onClick={e => e.stopPropagation()}>
          {t('product.details')}
        </Link>
      </div>
    </div>
  )
}

export default ProductCard
