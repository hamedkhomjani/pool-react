import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import Reveal from '../components/Reveal'
import useSeo from '../hooks/useSeo'
import GuideProductCard from '../components/GuideProductCard'
import MobileCtaBar from '../components/MobileCtaBar'
import products, { categories } from '../data/products'

function GuidesPage() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(0)

  const items = useMemo(
    () =>
      categories
        .map((cat, index) => {
          const data = t(`guides.items.${cat.slug}`, { returnObjects: true }) || {}
          return {
            ...cat,
            ...data,
            name: t(`categories.${cat.slug}`),
            featured: products.find(p => p.category === cat.slug),
            index,
          }
        })
        .filter(item => item.intro && item.points),
    [t],
  )

  useSeo({
    title: t('meta.guidesTitle'),
    description: t('meta.guidesDescription'),
    canonical: `${window.location.origin}/guides/`,
  })

  return (
    <section className="guide-page">
      <div className="container">
        <Reveal>
          <header className="guide-header">
            <span className="guide-badge">{t('guides.badge')}</span>
            <h1>{t('guides.title')}</h1>
            <p className="guide-meta">{t('guides.subtitle')}</p>
            <p className="guide-lead">{t('guides.meta')}</p>
          </header>
        </Reveal>

        <div className="guides-list">
          {items.map(item => {
            const isOpen = openIndex === item.index
            return (
              <Reveal key={item.slug}>
                <article className={`guides-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="guides-head"
                    onClick={() => setOpenIndex(isOpen ? null : item.index)}
                    aria-expanded={isOpen}
                  >
                    <span className="guides-head-icon">{item.icon}</span>
                    <span className="guides-head-text">
                      <span className="guides-head-name">{item.name}</span>
                      <span className="guides-head-summary">{item.summary}</span>
                    </span>
                    <span className="guides-head-arrow" aria-hidden="true">▾</span>
                  </button>

                  {isOpen && (
                    <div className="guides-body">
                      <p className="guide-p">{item.intro}</p>

                      <h3>{t('guides.whatToCheck')}</h3>
                      <ul className="guide-list">
                        {item.points.map((point, i) => (
                          <li key={i}>
                            <Trans i18nKey={`guides.items.${item.slug}.points.${i}`} />
                          </li>
                        ))}
                      </ul>

                      <div className="guide-protip">
                        <span className="guide-protip-icon">🛠️</span>
                        <div>
                          <strong>{t('guides.quickTip')}:</strong> {item.tip}
                        </div>
                      </div>

                      {item.featured && (
                        <div className="guide-products">
                          <h3>{t('guides.featuredTitle')}</h3>
                          <div className="guide-product-grid">
                            <GuideProductCard product={item.featured} />
                          </div>
                        </div>
                      )}

                      <div className="guides-actions">
                        <Link to={`/category/${item.slug}`} className="btn btn-primary">
                          {t('guides.viewProducts', { name: item.name })}
                        </Link>
                        <Link to={`/guide/${item.slug}`} className="btn btn-outline">
                          {t('guides.readFull')}
                        </Link>
                      </div>
                    </div>
                  )}
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
      <MobileCtaBar />
    </section>
  )
}

export default GuidesPage
