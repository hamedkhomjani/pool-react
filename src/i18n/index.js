import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const LANGUAGES = [
  { code: 'fa', label: 'فارسی', short: 'FA', dir: 'rtl' },
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
]

export const SUPPORTED_LANGUAGES = ['fa', 'en']

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'fa'
  try {
    const stored = localStorage.getItem('aquapro-language')
    if (SUPPORTED_LANGUAGES.includes(stored)) return stored
    const navLang = navigator.language?.toLowerCase()?.slice(0, 2)
    return SUPPORTED_LANGUAGES.includes(navLang) ? navLang : 'fa'
  } catch {
    return 'fa'
  }
}

const resourceCache = {}

// Vite serves/bundles ".json" as a JS module — no import attribute wanted.
// Native ESM runtimes (e.g. Node test scripts) require the attribute, so
// fall back to an attributed import when the first attempt is rejected.
function loadFa() {
  return import('./locales/fa.json').catch(err =>
    err && err.code === 'ERR_IMPORT_ATTRIBUTE_MISSING'
      ? import('./locales/fa.json', { with: { type: 'json' } })
      : Promise.reject(err),
  )
}

function loadEn() {
  return import('./locales/en.json').catch(err =>
    err && err.code === 'ERR_IMPORT_ATTRIBUTE_MISSING'
      ? import('./locales/en.json', { with: { type: 'json' } })
      : Promise.reject(err),
  )
}

function loadResource(lng) {
  if (!resourceCache[lng]) {
    resourceCache[lng] = lng === 'en' ? loadEn() : loadFa()
    // don't cache failures — allow a later retry
    resourceCache[lng].catch(() => {
      delete resourceCache[lng]
    })
  }
  return resourceCache[lng]
}

// i18next backend so changeLanguage() awaits the locale chunk BEFORE it
// emits "languageChanged" — otherwise React re-renders while the bundle is
// still loading and t() falls back to Persian until the next switch.
const jsonBackend = {
  type: 'backend',
  init() {},
  async read(language, namespace, callback) {
    try {
      const data = await loadResource(language)
      callback(null, data.default ?? data)
    } catch (err) {
      // resolve empty instead of failing init(): a failed bundle must never
      // leave the app unrendered (raw keys are better than a blank page)
      console.warn(`[i18n] failed to load "${language}" translations`, err)
      callback(null, {})
    }
  },
}

export const initPromise = i18n
  .use(jsonBackend)
  .use(initReactI18next)
  .init({
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

i18n.on('languageChanged', lng => {
  if (typeof document === 'undefined') return
  const lang = SUPPORTED_LANGUAGES.includes(lng) ? lng : 'fa'
  document.documentElement.setAttribute('lang', lang === 'fa' ? 'fa' : 'en')
  document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr')
  try {
    localStorage.setItem('aquapro-language', lang)
  } catch {
    /* ignore */
  }
})

export default i18n
