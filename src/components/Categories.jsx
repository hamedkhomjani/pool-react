import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { categories } from '../data/products'
import Reveal from './Reveal'

function Categories() {
  const { t } = useTranslation()
  return (
    <section className="categories" id="categories">
      <div className="container">
        <Reveal>
          <div className="cat-grid">
            {categories.map(cat => (
              <Link to={`/category/${cat.slug}`} className="cat-card" key={cat.slug} style={{ textDecoration: 'none' }}>
                <div className="cat-icon">{cat.icon}</div>
                <h4>{t(`categories.${cat.slug}`)}</h4>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Categories
