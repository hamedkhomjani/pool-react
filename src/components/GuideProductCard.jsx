import { Link } from 'react-router-dom'

function GuideProductCard({ product }) {
  return (
    <div className="guide-product-card">
      {product.badge && <span className="guide-product-badge">{product.badge}</span>}
      <div className="guide-product-image">{product.icon}</div>
      <h4 className="guide-product-title">{product.title}</h4>
      <p className="guide-product-desc">{product.desc}</p>
      <div className="guide-product-price">
        {product.price} <span>تومان</span>
      </div>
      <Link to={`/category/${product.category}`} className="btn btn-primary guide-product-cta">
        مشاهده قیمت روز و خرید
      </Link>
    </div>
  )
}

export default GuideProductCard
