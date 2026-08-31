// Side-by-side product comparison page. Compares a capped set of products
// from the same intent (shareable attributes) across price and specs.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import { useCompare } from '../context/CompareContext'
import { formatPrice } from '../utils/price'
import { translateSpecLabel } from '../i18n/product'
import useSeo from '../hooks/useSeo'

function ComparePage() {
  const { t, i18n } = useTranslation()
  const catalog = useCatalog()
  const compare = useCompare()

  useSeo({ title: t('compare.title'), description: t('compare.description'), path: '/compare/' })

  const products = useMemo(
    () => (catalog ? compare.keys.map(k => catalog.product(k)).filter(Boolean) : []),
    [catalog, compare.keys],
  )

  // Union of all spec keys shown across the compared set.
  const specKeys = useMemo(() => {
    const set = new Set()
    products.forEach(p => Object.keys(p.detailSpecs).forEach(k => set.add(k)))
    return Array.from(set)
  }, [products])

  if (!catalog) {
    return (
      <section className="cat-page"><div className="container">
        <section className="page-loading" aria-hidden="true"><div className="page-loading-spinner" /></section>
      </div></section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="cat-page">
        <div className="container compare-empty">
          <div className="cart-empty-icon" aria-hidden="true">⚖️</div>
          <h2>{t('compare.emptyTitle')}</h2>
          <p>{t('compare.empty')}</p>
          <Link to="/" className="btn btn-primary">{t('compare.browse')}</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="cat-page">
      <div className="container">
        <div className="cat-page-header">
          <h2>{t('compare.title')}</h2>
          <p>{t('compare.subtitle', { count: products.length, max: compare.max })}</p>
        </div>

        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-empty-cell" aria-hidden="true" />
                {products.map(p => (
                  <th key={p.key}>
                    <button type="button" className="compare-remove" onClick={() => compare.remove(p.key)} aria-label={t('compare.remove')}>✕</button>
                    <div className="compare-product-icon" aria-hidden="true">{p.icon}</div>
                    <Link to={`/product/${p.key}`} className="compare-product-title">{p.title}</Link>
                    {p.badge && <span className="compare-badge">{p.badge}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="compare-label">{t('product.price')}</th>
                {products.map(p => (
                  <td key={p.key} className="compare-price">{formatPrice(p.price, i18n.language)} <span>{t('product.toman')}</span></td>
                ))}
              </tr>
              {specKeys.map(key => (
                <tr key={key}>
                  <th className="compare-label">{translateSpecLabel(t, key)}</th>
                  {products.map(p => (
                    <td key={p.key}>{p.detailSpecs[key] != null ? p.detailSpecs[key] : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="compare-actions">
          <button type="button" className="btn btn-outline" onClick={compare.clear}>{t('compare.clear')}</button>
        </div>
      </div>
    </section>
  )
}

export default ComparePage
