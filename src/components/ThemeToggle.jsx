import { useTranslation } from 'react-i18next'

function ThemeToggle({ theme, onToggle }) {
  const { t } = useTranslation()
  const isDark = theme === 'dark'
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? t('themeToggle.enableLight') : t('themeToggle.enableDark')}
      title={isDark ? t('themeToggle.light') : t('themeToggle.dark')}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle
