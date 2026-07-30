import { Link } from 'react-router-dom'
import { categories } from '../data/products'

function Categories() {
  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="cat-grid">
          {categories.map((cat, index) => (
            <Link to={`/category/${cat.slug}`} className="cat-card" key={index} style={{ textDecoration: 'none' }}>
              <div className="cat-icon">{cat.icon}</div>
              <h4>{cat.name}</h4>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories
