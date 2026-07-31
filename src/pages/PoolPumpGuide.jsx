import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import Reveal from '../components/Reveal'
import useSeo from '../hooks/useSeo'
import GuideSizer from '../components/GuideSizer'
import GuideProductCard from '../components/GuideProductCard'
import MobileCtaBar from '../components/MobileCtaBar'
import products from '../data/products'

const siteUrl = 'https://aquapro.ir'

const staticSizingRows = [
  { hp: '0.5 HP', flow: '8 m³/h', model: 'HW-0500' },
  { hp: '0.75 HP', flow: '12 m³/h', model: 'HW-0750' },
  { hp: '1 HP', flow: '16 m³/h', model: 'HW-1000' },
  { hp: '1.5 HP', flow: '21 m³/h', model: 'HW-1500' },
  { hp: '2 HP', flow: '28 m³/h', model: 'HW-2000' },
  { hp: '3 HP', flow: '35 m³/h', model: 'HW-3000' },
]

const clusterSlugs = ['pump', 'filter', 'heater']
const clusterIcons = ['⚙️', '🌪️', '🔥']

const featuredPump = products.find(p => p.category === 'pump')
const featuredFilter = products.find(p => p.category === 'filter')
const featuredDisinfection = products.find(p => p.category === 'disinfection')

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

function PoolPumpGuide() {
  const { t, i18n } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)

  const sizingRows = useMemo(() => {
    const volumes = t('guide.sections.sizingRows', { returnObjects: true }) || []
    return volumes.map((v, i) => ({ ...staticSizingRows[i], volume: v.volume }))
  }, [t])

  const pumpTypes = useMemo(
    () => t('guide.sections.pumpTypes', { returnObjects: true }) || [],
    [t],
  )

  const faqs = useMemo(
    () => t('guide.sections.faqs', { returnObjects: true }) || [],
    [t],
  )

  const cluster = useMemo(
    () => t('guide.sections.cluster', { returnObjects: true }) || [],
    [t],
  )

  const specCards = useMemo(
    () => t('guide.sections.specCards', { returnObjects: true }) || [],
    [t],
  )

  const brands = useMemo(
    () => t('guide.sections.brands', { returnObjects: true }) || [],
    [t],
  )

  const hiddenCosts = useMemo(
    () => t('guide.sections.hiddenCosts', { returnObjects: true }) || [],
    [t],
  )

  const combinedSchema = useMemo(() => {
    const faqMainEntity = faqs.map(({ q, a }) => ({
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
          headline: t('guide.title'),
          description: t('meta.guideDescription'),
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
            '@id': `${siteUrl}/pool-pump-guide/`,
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqMainEntity,
        },
      ],
    }
  }, [t, i18n.language, faqs])

  useSeo({
    title: t('meta.guideTitle'),
    description: t('meta.guideDescription'),
    canonical: `${window.location.origin}/pool-pump-guide/`,
    jsonLd: combinedSchema,
  })

  const sections = t('guide.sections', { returnObjects: true })

  return (
    <section className="guide-page">
      <div className="container">
        <Reveal>
          <header className="guide-header">
            <span className="guide-badge">{t('guide.badge')}</span>
            <h1>{t('guide.title')}</h1>
            <p className="guide-meta">{t('guide.meta')}</p>
          </header>
        </Reveal>

        <Reveal>
          <p className="guide-lead">{t('guide.lead')}</p>
        </Reveal>

        <Reveal>
          <aside className="guide-author">
            <div className="guide-author-avatar">💧</div>
            <div className="guide-author-body">
              <div className="guide-author-verify">
                <span className="guide-author-verify-icon">✓</span>
                {t('guide.authorVerify')}
              </div>
              <p className="guide-author-text">{t('guide.authorText')}</p>
              <div className="guide-author-meta">
                <span>{t('guide.updated')}</span>
                <span>{t('guide.readTime')}</span>
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
                <li key={i}><Trans i18nKey={`guide.sections.hiddenCosts.${i}`} /></li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>{sections.typesTitle}</h2>
            <p className="guide-p">{sections.typesP}</p>
            <div className="guide-grid guide-grid-3">
              {pumpTypes.map((tItem, i) => (
                <div className="guide-card" key={i}>
                  <div className="guide-card-icon">{['⚡', '🔁', '🎛️'][i]}</div>
                  <h3>{tItem.title}</h3>
                  <p>{tItem.desc}</p>
                </div>
              ))}
            </div>
            <div className="guide-tip"><Trans i18nKey="guide.sections.tip" /></div>
            <div className="guide-protip">
              <span className="guide-protip-icon">🛠️</span>
              <div><Trans i18nKey="guide.sections.protip1" /></div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>{sections.sizingTitle}</h2>
            <p className="guide-p">
              <Trans i18nKey="guide.sections.sizingP1" components={{ calculatorLink: <CalculatorLink /> }} />
            </p>

            <div className="guide-table-wrap">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>{sections.tableVolume}</th>
                    <th>{sections.tableHp}</th>
                    <th>{sections.tableFlow}</th>
                    <th>{sections.tableModel}</th>
                  </tr>
                </thead>
                <tbody>
                  {sizingRows.map((row, i) => (
                    <tr key={i}>
                      <td>{row.volume}</td>
                      <td>{row.hp}</td>
                      <td>{row.flow}</td>
                      <td><span className="guide-model">{row.model}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <GuideSizer />

            {featuredPump && featuredFilter && (
              <div className="guide-products">
                <h3>{sections.featuredTitle}</h3>
                <div className="guide-product-grid">
                  <GuideProductCard product={featuredPump} />
                  <GuideProductCard product={featuredFilter} />
                </div>
              </div>
            )}

            <h3>{sections.pipingTitle}</h3>
            <p className="guide-p">{sections.pipingP}</p>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>{sections.specsTitle}</h2>
            <div className="guide-grid guide-grid-2">
              {specCards.map((card, i) => (
                <div className="guide-card" key={i}>
                  <h3>{card.title}</h3>
                  <p><Trans i18nKey={`guide.sections.specCards.${i}.desc`} /></p>
                </div>
              ))}
            </div>
            <div className="guide-protip">
              <span className="guide-protip-icon">❄️</span>
              <div><Trans i18nKey="guide.sections.protip2" /></div>
            </div>
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
            <p className="guide-p">
              <Trans
                i18nKey="guide.sections.brandsLink"
                components={{ link: <Link to="/category/pump" className="guide-inline-link" /> }}
              />
            </p>
            {featuredDisinfection && (
              <div className="guide-products">
                <h3>{sections.disinfectionTitle}</h3>
                <div className="guide-product-grid">
                  <GuideProductCard product={featuredDisinfection} />
                </div>
              </div>
            )}
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>{sections.diffTitle}</h2>
            <p className="guide-p"><Trans i18nKey="guide.sections.diffP" /></p>
            <div className="guide-cluster">
              {cluster.map((c, i) => (
                <Link to={`/category/${clusterSlugs[i]}`} className="guide-cluster-link" key={i}>
                  <span className="guide-cluster-icon">{clusterIcons[i]}</span>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                  <span className="guide-cluster-arrow">←</span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

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

        <Reveal>
          <section className="guide-cta">
            <h2>{sections.ctaTitle}</h2>
            <p><Trans i18nKey="guide.sections.ctaP" /></p>
            <div className="guide-cta-btns">
              <Link to="/category/pump" className="btn btn-primary">{sections.ctaProducts}</Link>
              <Link to="/" className="btn btn-outline">{sections.ctaCalculator}</Link>
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

export default PoolPumpGuide
