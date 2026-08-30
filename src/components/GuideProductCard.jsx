import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/price'

// Renders an already-merged catalog product (see useCatalog). Receives a full
// catalog product — never a raw base record — so callers resolve the product
// through the catalog first.
function GuideProductCard({ product }) {
  const { t, i18n } = useTranslation()
  return (
    <div className="guide-product-card">
      {product.badge && <span className="guide-product-badge">{product.badge}</span>}
      <div className="guide-product-image">{product.icon}</div>
      <h4 className="guide-product-title">{product.title}</h4>
      <p className="guide-product-desc">{product.desc}</p>
      <div className="guide-product-price">
        {formatPrice(product.price, i18n.language)} <span>{t('guideProductCard.toman')}</span>
      </div>
      <Link to={`/product/${product.key}`} className="btn btn-primary guide-product-cta">
        {t('guideProductCard.cta')}
      </Link>
    </div>
  )
}

export default GuideProductCard