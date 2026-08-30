import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'

function Hero() {
  const { t } = useTranslation()
  return (
    <section className="hero">
      <div className="container">
        <Reveal>
          <span className="hero-badge">{t('hero.badge')}</span>
        </Reveal>
        <Reveal delay={120}>
          <h1>{t('hero.title')}</h1>
        </Reveal>
        <Reveal delay={240}>
          <p>{t('hero.subtitle')}</p>
        </Reveal>
        <Reveal delay={360}>
          <div className="hero-btns">
            <a href="#products" className="btn btn-primary">{t('hero.ctaProducts')}</a>
            <a href="#calculator" className="btn btn-outline">{t('hero.ctaCalculator')}</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Hero;