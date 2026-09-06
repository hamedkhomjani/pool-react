import { useTranslation } from 'react-i18next'
import { formatPrice, discountPercent } from '../utils/price'

// Reusable price display that handles strikethrough / save badges for products
// on sale (where compareAt > price). Used by ProductCard, ProductPage,
// ProductModal, OrderModal, and the header featured slot.
function ProductPrice({ product, className = 'product-price' }) {
  const { t, i18n } = useTranslation()
  const pct = discountPercent(product.price, product.compareAt)
  return (
    <span className={`${className}${pct != null ? ' has-discount' : ''}`}>
      {pct != null && (
        <span className="price-strike">{formatPrice(product.compareAt, i18n.language)}</span>
      )}
      <span className="price-current">
        {formatPrice(product.price, i18n.language)} <span className="price-unit">{t('product.toman')}</span>
      </span>
      {pct != null && (
        <span className="price-save">{t('product.savePercent', { percent: pct })}</span>
      )}
    </span>
  )
}

export default ProductPrice