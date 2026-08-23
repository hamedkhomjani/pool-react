import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { langFromPath, swapLangPath } from '../config/site'

function LanguageSwitcher() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  // The URL prefix is the source of truth for the active language.
  const current = langFromPath(location.pathname)

  const switchTo = lang => {
    if (lang === current) return
    navigate(swapLangPath(location.pathname, lang))
  }

  return (
    <div className="lang-switcher" role="group" aria-label={t('langSwitcher.label')}>
      <button
        type="button"
        className={`lang-opt ${current === 'fa' ? 'active' : ''}`}
        onClick={() => switchTo('fa')}
        aria-label="فارسی"
        title="فارسی"
      >
        فا
      </button>
      <button
        type="button"
        className={`lang-opt ${current === 'en' ? 'active' : ''}`}
        onClick={() => switchTo('en')}
        aria-label="English"
        title="English"
      >
        EN
      </button>
    </div>
  )
}

export default LanguageSwitcher
