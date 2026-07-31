import { useTranslation } from 'react-i18next'

function Hero() {
  const { t } = useTranslation()
  return (
    <section className="hero">
      <div className="container">
        <span className="hero-badge">{t('hero.badge')}</span>
        <h1>{t('hero.title')}</h1>
        <p>{t('hero.subtitle')}</p>
        <div className="hero-btns">
          <a href="#products" className="btn btn-primary">{t('hero.ctaProducts')}</a>
          <a href="#calculator" className="btn btn-outline">{t('hero.ctaCalculator')}</a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
