import { useTranslation } from 'react-i18next'
import { CONTACT_CONFIG } from '../config/contact'

function MobileCtaBar() {
  const { t } = useTranslation()
  return (
    <div className="mobile-cta-bar">
      <a href={CONTACT_CONFIG.phoneHref} className="mobile-cta-btn mobile-cta-call">
        <span className="mobile-cta-icon">📞</span>
        {t('mobileCta.call')}
      </a>
      <a href="#guide-sizer" className="mobile-cta-btn mobile-cta-calc">
        <span className="mobile-cta-icon">🧮</span>
        {t('mobileCta.calc')}
      </a>
    </div>
  )
}

export default MobileCtaBar
