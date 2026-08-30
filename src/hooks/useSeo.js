import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SITE_URL,
  SITE_NAME,
  canonicalUrl,
  alternateUrl,
  langFromPath,
} from '../config/site'

const LANG_CODES = ['fa', 'en']
const DEFAULT_OG_IMAGE = `${SITE_URL}/image.png`

// During prerendering there is no document and effects never run, so meta
// tags are recorded at render time into this collector. The prerender
// script clears it around each route render.
export function takeCollectedSeo() {
  const collected = globalThis.__SEO_COLLECTED__ || []
  globalThis.__SEO_COLLECTED__ = []
  return collected
}

function buildMeta({ title, description, path, image, jsonLd, noindex }, pathname) {
  const lang = langFromPath(pathname)
  const seoPath = path || pathname
  const canonical = canonicalUrl(seoPath, lang)
  const ogImage = image || DEFAULT_OG_IMAGE

  const metas = [
    { name: 'description', content: description },
    ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonical },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    {
      property: 'og:locale',
      content: lang === 'fa' ? 'fa_IR' : 'en_US',
    },
    {
      property: 'og:locale:alternate',
      content: lang === 'fa' ? 'en_US' : 'fa_IR',
    },
    { property: 'og:image', content: ogImage },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },
  ].filter(m => m.content)

  const links = [
    { rel: 'canonical', href: canonical },
    ...LANG_CODES.map(code => ({
      rel: 'alternate',
      hreflang: code,
      href: alternateUrl(seoPath, code),
    })),
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: canonicalUrl(seoPath, 'fa'),
    },
  ]

  return {
    lang,
    dir: lang === 'fa' ? 'rtl' : 'ltr',
    title: title || '',
    metas,
    links,
    jsonLd: jsonLd ? JSON.stringify(jsonLd) : null,
  }
}

function upsertHead(selector, create) {
  const existing = document.head.querySelector(selector)
  if (existing) return existing
  const el = create()
  el.setAttribute('data-seo', 'true')
  document.head.appendChild(el)
  return el
}

function applyToDocument(meta) {
  document.title = meta.title
  const injected = []

  meta.metas.forEach(({ name, property, content }) => {
    const attr = name ? 'name' : 'property'
    const value = name || property
    const el = upsertHead(`meta[${attr}="${value}"][data-seo]`, () => {
      const m = document.createElement('meta')
      m.setAttribute(attr, value)
      return m
    })
    el.setAttribute('content', content)
    injected.push(el)
  })

  meta.links.forEach(link => {
    let selector
    let make
    if (link.rel === 'canonical') {
      selector = 'link[rel="canonical"][data-seo]'
      make = () => {
        const l = document.createElement('link')
        l.setAttribute('rel', 'canonical')
        return l
      }
    } else {
      selector = `link[data-seo][rel="alternate"][hreflang="${link.hreflang}"]`
      make = () => {
        const l = document.createElement('link')
        l.setAttribute('rel', 'alternate')
        l.setAttribute('hreflang', link.hreflang)
        return l
      }
    }
    const el = upsertHead(selector, make)
    el.setAttribute('href', link.href)
    injected.push(el)
  })

  if (meta.jsonLd) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = meta.jsonLd
    document.head.appendChild(script)
    injected.push(script)
  }

  return () => {
    injected.forEach(el => el.remove())
  }
}

function useSeo({ title, description, path, image, jsonLd, noindex } = {}) {
  const location = useLocation()
  const isServer = typeof document === 'undefined'

  // Prerender path: record meta during render (effects never run there).
  if (isServer) {
    globalThis.__SEO_COLLECTED__ = globalThis.__SEO_COLLECTED__ || []
    globalThis.__SEO_COLLECTED__.push(
      buildMeta({ title, description, path, image, jsonLd, noindex }, location.pathname),
    )
  }

  // Client path: apply to <head>, reapplying when any input changes.
  // jsonLd objects are memoized by callers; stringify keeps deps stable.
  const jsonLdKey = JSON.stringify(jsonLd ?? null)
  useEffect(() => {
    if (isServer) return undefined
    return applyToDocument(
      buildMeta({ title, description, path, image, jsonLd, noindex }, location.pathname),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, noindex, jsonLdKey, location.pathname])
}

export default useSeo
