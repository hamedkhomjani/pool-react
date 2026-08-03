import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const LANGUAGES = [
  { code: 'fa', label: 'فارسی', short: 'FA', dir: 'rtl' },
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
]

export const SUPPORTED_LANGUAGES = ['fa', 'en']

const resourceCache = {}

function loadResource(lng) {
  if (resourceCache[lng]) return resourceCache[lng]
  resourceCache[lng] =
    lng === 'en'
      ? import('./locales/en.json')
      : import('./locales/fa.json')
  return resourceCache[lng]
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'fa'
  const stored = localStorage.getItem('aquapro-language')
  if (SUPPORTED_LANGUAGES.includes(stored)) return stored
  const navLang = navigator.language?.toLowerCase()?.slice(0, 2)
  return SUPPORTED_LANGUAGES.includes(navLang) ? navLang : 'fa'
}

i18n.use(initReactI18next).init({
  resources: {},
  lng: getInitialLanguage(),
  fallbackLng: 'fa',
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: ['translation'],
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
  react: {
    useSuspense: false,
  },
})

async function loadLanguage(lng) {
  try {
    const data = await loadResource(lng)
    if (!i18n.hasResourceBundle(lng, 'translation')) {
      i18n.addResourceBundle(lng, 'translation', data)
    }
  } catch {
    /* load error: fallback is used */
  }
}

const initPromise = loadLanguage(i18n.language)

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
  loadLanguage(lang)
})

export { initPromise }

export default i18n