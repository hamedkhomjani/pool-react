export const SITE_URL = 'https://aquapro.ir'
export const SITE_NAME = 'AquaPro | آکوا پرو'
export const DEFAULT_LANG = 'fa'

// Active language is part of the URL: Persian lives at the root (preserving
// existing URLs), English under /en.
export function langFromPath(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : DEFAULT_LANG
}

// Path with the given language's prefix ('' for Persian).
export function langPrefix(lang) {
  return lang === 'en' ? '/en' : ''
}

// Canonical URL for a path, honoring the given language prefix.
export function canonicalUrl(path, lang) {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${langPrefix(lang)}${clean}`
}

// The same page in the other language (for hreflang alternates).
export function alternateUrl(path, lang) {
  return canonicalUrl(path, lang === 'en' ? DEFAULT_LANG : 'en')
}

// Swap the language prefix of a pathname (used by the language switcher).
export function swapLangPath(pathname, targetLang) {
  const rest = langFromPath(pathname) === 'en' ? pathname.slice(3) : pathname
  return `${langPrefix(targetLang)}${rest || '/'}`
}
