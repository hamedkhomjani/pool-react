import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'

function Banner() {
  const { t } = useTranslation()
  return (
    <section className="container" id="packages">
      <Reveal>
      <div className="highlight-banner">
        <div className="banner-text">
          <h3>{t('banner.title')}</h3>
          <p>{t('banner.subtitle')}</p>
          <Link to="/contact" className="btn banner-btn">{t('banner.cta')}</Link>
        </div>
        <div className="banner-icon">🏊‍♂️</div>
      </div>
      </Reveal>
    </section>
  );
}

export default Banner;
