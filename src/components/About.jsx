import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'

const statKeys = ['projects', 'years', 'cities', 'satisfaction']

const valueKeys = [
  { icon: '✅', key: 'authenticity' },
  { icon: '🔧', key: 'install' },
  { icon: '📞', key: 'support' },
  { icon: '🧾', key: 'price' },
]

function About() {
  const { t } = useTranslation()
  return (
    <section className="about-section" id="about">
      <div className="container">
        <Reveal>
          <div className="section-header">
            <h2>{t('about.title')}</h2>
            <p>{t('about.subtitle')}</p>
          </div>
        </Reveal>

        <div className="about-content">
          <Reveal direction="right">
            <div className="about-text">
              <p>{t('about.text1')}</p>
              <p>{t('about.text2')}</p>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className="about-stats">
              {statKeys.map((key, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-number">{t(`about.statsValues.${key}`)}</div>
                  <div className="stat-label">{t(`about.stats.${key}`)}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="about-values">
          {valueKeys.map((v, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h4>{t(`about.values.${v.key}Title`)}</h4>
                <p>{t(`about.values.${v.key}Desc`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
