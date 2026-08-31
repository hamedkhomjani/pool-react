// Persistent bottom tray that appears whenever products are in the compare
// list. Lets the user see what's queued, jump to the comparison page, or clear.
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import { useCompare } from '../context/CompareContext'

function CompareTray() {
  const { t } = useTranslation()
  const catalog = useCatalog()
  const compare = useCompare()

  if (!catalog || compare.keys.length === 0) return null

  const products = compare.keys.map(k => catalog.product(k)).filter(Boolean)
  if (products.length === 0) return null

  return (
    <div className="compare-tray" role="region" aria-label={t('compare.title')}>
      <div className="compare-tray-inner">
        <div className="compare-tray-thumbs">
          {products.map(p => (
            <span key={p.key} className="compare-tray-thumb" aria-hidden="true">{p.icon}</span>
          ))}
          <span className="compare-tray-count">{products.length}/{compare.max}</span>
        </div>
        <div className="compare-tray-text">
          <strong>{t('compare.title')}</strong>
          <span>{t('compare.ready', { count: products.length })}</span>
        </div>
        <div className="compare-tray-actions">
          <button type="button" className="compare-tray-clear" onClick={compare.clear}>{t('compare.clear')}</button>
          <Link to="/compare" className="btn btn-primary">{t('compare.compare')}</Link>
        </div>
      </div>
    </div>
  )
}

export default CompareTray
