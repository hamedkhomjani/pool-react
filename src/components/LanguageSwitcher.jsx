import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = i18n.language === 'en' ? 'en' : 'fa'

  return (
    <div className="lang-switcher" role="group" aria-label={t('langSwitcher.label')}>
      <button
        type="button"
        className={`lang-opt ${current === 'fa' ? 'active' : ''}`}
        onClick={() => i18n.changeLanguage('fa')}
        aria-label="فارسی"
        title="فارسی"
      >
        فا
      </button>
      <button
        type="button"
        className={`lang-opt ${current === 'en' ? 'active' : ''}`}
        onClick={() => i18n.changeLanguage('en')}
        aria-label="English"
        title="English"
      >
        EN
      </button>
    </div>
  )
}

export default LanguageSwitcher
