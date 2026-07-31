import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fa from './locales/fa.json'
import en from './locales/en.json'

export const LANGUAGES = [
  { code: 'fa', label: 'فارسی', short: 'FA', dir: 'rtl' },
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
]

export const SUPPORTED_LANGUAGES = ['fa', 'en']

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'fa'
  const stored = localStorage.getItem('aquapro-language')
  if (SUPPORTED_LANGUAGES.includes(stored)) return stored
  const navLang = navigator.language?.toLowerCase()?.slice(0, 2)
  return SUPPORTED_LANGUAGES.includes(navLang) ? navLang : 'fa'
}

i18n.use(initReactI18next).init({
  resources: {
    fa: { translation: fa },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'fa',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
})

i18n.on('languageChanged', lng => {
  if (typeof document === 'undefined') return
  const lang = SUPPORTED_LANGUAGES.includes(lng) ? lng : 'fa'
  const dir = lang === 'fa' ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('lang', lang === 'fa' ? 'fa' : 'en')
  document.documentElement.setAttribute('dir', dir)
  try {
    localStorage.setItem('aquapro-language', lang)
  } catch {
    /* ignore */
  }
})

export default i18n
