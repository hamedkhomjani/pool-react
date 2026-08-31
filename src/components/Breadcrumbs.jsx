// Reusable breadcrumb trail. Renders a category hierarchy (Home › Department
// › Subcategory › …) plus an optional current leaf.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'

function Breadcrumbs({ categorySlug, current }) {
  const { t } = useTranslation()
  const catalog = useCatalog()

  const trail = catalog && categorySlug
    ? [...catalog.categoryAncestors(categorySlug), categorySlug]
    : []

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/">{t('nav.home')}</Link>
      {trail.map(slug => (
        <span className="breadcrumbs-item" key={slug}>
          <span className="breadcrumbs-sep" aria-hidden="true">/</span>
          <Link to={`/category/${slug}`}>{t(`categories.${slug}`)}</Link>
        </span>
      ))}
      {current && (
        <span className="breadcrumbs-item">
          <span className="breadcrumbs-sep" aria-hidden="true">/</span>
          <span className="breadcrumbs-current">{current}</span>
        </span>
      )}
    </nav>
  )
}

export default Breadcrumbs
