import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import Reveal from '../components/Reveal'
import useSeo from '../hooks/useSeo'
import GuideProductCard from '../components/GuideProductCard'
import MobileCtaBar from '../components/MobileCtaBar'
import products from '../data/products'

const siteUrl = 'https://aquapro.ir'

function CalculatorLink({ children }) {
  const navigate = useNavigate()
  return (
    <a
      href="/#calculator"
      className="guide-inline-link"
      onClick={e => {
        e.preventDefault()
        sessionStorage.setItem('scrollTo', 'calculator')
        navigate('/')
      }}
    >
      {children}
    </a>
  )
}

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div className={`guide-faq-item ${open ? 'open' : ''}`}>
      <button className="guide-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <span className="guide-faq-icon" aria-hidden="true">▾</span>
      </button>
      <div className="guide-faq-a">
        <p>{a}</p>
      </div>
    </div>
  )
}

function CategoryGuide() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const base = `fullGuides.${slug}`
  const data = useMemo(() => t(base, { returnObjects: true }) || {}, [t, base])
  const sections = data.sections || {}

  const types = sections.types || []
  const hiddenCosts = sections.hiddenCosts || []
  const specCards = sections.specCards || []
  const brands = sections.brands || []
  const sizingRows = sections.sizingRows || []
  const tableCols = sections.tableCols || []
  const faqs = sections.faqs || []
  const featuredKeys = sections.featuredKeys || []
  const featured = featuredKeys.map(key => products.find(p => p.key === key)).filter(Boolean)

  const combinedSchema = useMemo(() => {
    const dataFaqs = data.sections?.faqs || []
    const faqMainEntity = dataFaqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    }))
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: data.title,
          description: data.lead,
          image: `${siteUrl}/image.png`,
          datePublished: '2026-03-21T08:00:00+03:30',
          dateModified: '2026-07-31T08:00:00+03:30',
          inLanguage: i18n.language === 'en' ? 'en-US' : 'fa-IR',
          author: {
            '@type': 'Organization',
            name: t('brand'),
            url: siteUrl,
            telephone: '+982188888888',
            sameAs: [
              'https://www.instagram.com/aquapro.ir',
              'https://t.me/aquapro.ir',
              'https://www.linkedin.com/company/aquapro.ir',
            ],
          },
          publisher: {
            '@type': 'Organization',
            name: t('brand'),
            url: siteUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/favicon.svg`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteUrl}/guide/${slug}/`,
          },
        },
        ...(faqMainEntity.length
          ? [{ '@type': 'FAQPage', mainEntity: faqMainEntity }]
          : []),
      ],
    }
  }, [data, slug, t, i18n.language])

  useSeo({
    title: `${data.title} | ${t('brand')}`,
    description: data.lead,
    canonical: `${window.location.origin}/guide/${slug}/`,
    jsonLd: combinedSchema,
  })

  if (!data.title) {
    return (
      <section className="guide-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>{t('categoryPage.notFound')}</h2>
          <Link to="/guides" className="btn btn-primary" style={{ marginTop: '20px' }}>{t('categoryPage.backHome')}</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="guide-page">
      <div className="container">
        <Reveal>
          <header className="guide-header">
            <span className="guide-badge">{data.badge}</span>
            <h1>{data.title}</h1>
            <p className="guide-meta">{data.meta}</p>
          </header>
        </Reveal>

        <Reveal>
          <p className="guide-lead">{data.lead}</p>
        </Reveal>

        <Reveal>
          <aside className="guide-author">
            <div className="guide-author-avatar">💧</div>
            <div className="guide-author-body">
              <div className="guide-author-verify">
                <span className="guide-author-verify-icon">✓</span>
                {data.authorVerify}
              </div>
              <p className="guide-author-text">{data.authorText}</p>
              <div className="guide-author-meta">
                <span>{data.updated}</span>
                <span>{data.readTime}</span>
              </div>
            </div>
          </aside>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>{sections.whyTitle}</h2>
            <p className="guide-p">{sections.whyP1}</p>
            <h3>{sections.whyH3}</h3>
            <ul className="guide-list">
              {hiddenCosts.map((item, i) => (
                <li key={i}><Trans i18nKey={`fullGuides.${slug}.sections.hiddenCosts.${i}`} /></li>
              ))}
            </ul>
          </section>
        </Reveal>

        {types.length > 0 && (
          <Reveal>
            <section className="guide-section">
              <h2>{sections.typesTitle}</h2>
              <p className="guide-p">{sections.typesP}</p>
              <div className="guide-grid guide-grid-3">
                {types.map((tItem, i) => (
                  <div className="guide-card" key={i}>
                    <div className="guide-card-icon">{sections.typeIcons?.[i] || '⚙️'}</div>
                    <h3>{tItem.title}</h3>
                    <p>{tItem.desc}</p>
                  </div>
                ))}
              </div>
              {sections.tip && <div className="guide-tip"><Trans i18nKey={`fullGuides.${slug}.sections.tip`} /></div>}
              {sections.protip1 && (
                <div className="guide-protip">
                  <span className="guide-protip-icon">🛠️</span>
                  <div><Trans i18nKey={`fullGuides.${slug}.sections.protip1`} /></div>
                </div>
              )}
            </section>
          </Reveal>
        )}

        <Reveal>
          <section className="guide-section">
            <h2>{sections.sizingTitle}</h2>
            <p className="guide-p">
              <Trans
                i18nKey={`fullGuides.${slug}.sections.sizingP1`}
                components={{ calculatorLink: <CalculatorLink /> }}
              />
            </p>

            {tableCols.length > 0 && sizingRows.length > 0 && (
              <div className="guide-table-wrap">
                <table className="guide-table">
                  <thead>
                    <tr>
                      {tableCols.map((col, i) => (
                        <th key={i}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizingRows.map((row, i) => (
                      <tr key={i}>
                        {Object.keys(row).map(key => (
                          <td key={key}>{key === 'model' ? <span className="guide-model">{row[key]}</span> : row[key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {featured.length > 0 && (
              <div className="guide-products">
                <h3>{sections.featuredTitle}</h3>
                <div className="guide-product-grid">
                  {featured.map(product => (
                    <GuideProductCard product={product} key={product.key} />
                  ))}
                </div>
              </div>
            )}

            {sections.installTitle && (
              <>
                <h3>{sections.installTitle}</h3>
                <p className="guide-p">{sections.installP}</p>
              </>
            )}
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>{sections.specsTitle}</h2>
            <div className="guide-grid guide-grid-2">
              {specCards.map((card, i) => (
                <div className="guide-card" key={i}>
                  <h3>{card.title}</h3>
                  <p><Trans i18nKey={`fullGuides.${slug}.sections.specCards.${i}.desc`} /></p>
                </div>
              ))}
            </div>
            {sections.protip2 && (
              <div className="guide-protip">
                <span className="guide-protip-icon">❄️</span>
                <div><Trans i18nKey={`fullGuides.${slug}.sections.protip2`} /></div>
              </div>
            )}
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>{sections.brandsTitle}</h2>
            <div className="guide-brands">
              {brands.map((b, i) => (
                <div className="guide-brand" key={i}>
                  <span className="guide-brand-name">{b.name}</span>
                  <p>{b.desc}</p>
                </div>
              ))}
            </div>
            {sections.brandsLink && (
              <p className="guide-p">
                <Trans
                  i18nKey={`fullGuides.${slug}.sections.brandsLink`}
                  components={{ link: <Link to={`/category/${slug}`} className="guide-inline-link" /> }}
                />
              </p>
            )}
          </section>
        </Reveal>

        {faqs.length > 0 && (
          <Reveal>
            <section className="guide-section">
              <h2>{sections.faqTitle}</h2>
              <div className="guide-faq">
                {faqs.map((item, i) => (
                  <FAQItem
                    key={i}
                    q={item.q}
                    a={item.a}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal>
          <section className="guide-cta">
            <h2>{sections.ctaTitle}</h2>
            <p><Trans i18nKey={`fullGuides.${slug}.sections.ctaP`} /></p>
            <div className="guide-cta-btns">
              <Link to={`/category/${slug}`} className="btn btn-primary">{sections.ctaProducts}</Link>
              <Link to="/guides" className="btn btn-outline">{t('guides.backToGuides')}</Link>
            </div>
            <div className="guide-cta-contact">
              <span>{sections.ctaPhone}</span>
              <span>{sections.ctaMobile}</span>
            </div>
          </section>
        </Reveal>
      </div>
      <MobileCtaBar />
    </section>
  )
}

export default CategoryGuide
