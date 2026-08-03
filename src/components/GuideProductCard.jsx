import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { translateProduct } from '../i18n/product'

function GuideProductCard({ product }) {
  const { t } = useTranslation()
  const p = translateProduct(t, product)
  return (
    <div className="guide-product-card">
      {p.badge && <span className="guide-product-badge">{p.badge}</span>}
      <div className="guide-product-image">{p.icon}</div>
      <h4 className="guide-product-title">{p.title}</h4>
      <p className="guide-product-desc">{p.desc}</p>
      <div className="guide-product-price">
        {p.price} <span>{t('guideProductCard.toman')}</span>
      </div>
      <Link to={`/product/${p.key}`} className="btn btn-primary guide-product-cta">
        {t('guideProductCard.cta')}
      </Link>
    </div>
  )
}

export default GuideProductCard
