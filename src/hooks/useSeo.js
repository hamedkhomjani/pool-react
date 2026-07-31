import { useEffect } from 'react'

const HREFLANG_CODES = ['fa', 'en']

function upsertHead(selector, create) {
  const existing = document.head.querySelector(selector)
  if (existing) return existing
  const el = create()
  el.setAttribute('data-seo', 'true')
  document.head.appendChild(el)
  return el
}

function setHreflang(canonical) {
  document.head
    .querySelectorAll('link[data-seo][rel="alternate"][hreflang]')
    .forEach(el => el.remove())
  if (!canonical) return
  const codes = [...HREFLANG_CODES, 'x-default']
  codes.forEach(code => {
    const el = document.createElement('link')
    el.setAttribute('rel', 'alternate')
    el.setAttribute('hreflang', code)
    el.setAttribute('href', canonical)
    el.setAttribute('data-seo', 'true')
    document.head.appendChild(el)
  })
}

function useSeo({ title, description, canonical, jsonLd } = {}) {
  useEffect(() => {
    document.title = title || ''
    const injected = []

    if (description) {
      const el = upsertHead(
        'meta[name="description"][data-seo]',
        () => {
          const m = document.createElement('meta')
          m.setAttribute('name', 'description')
          return m
        },
      )
      el.setAttribute('content', description)
      injected.push(el)
    }

    if (canonical) {
      const el = upsertHead(
        'link[rel="canonical"][data-seo]',
        () => {
          const l = document.createElement('link')
          l.setAttribute('rel', 'canonical')
          return l
        },
      )
      el.setAttribute('href', canonical)
      injected.push(el)
      setHreflang(canonical)
    } else {
      document.head
        .querySelectorAll('link[data-seo][rel="alternate"][hreflang]')
        .forEach(el => el.remove())
    }

    let script
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(jsonLd)
      document.head.appendChild(script)
      injected.push(script)
    }

    return () => {
      injected.forEach(el => el.remove())
    }
  }, [title, description, canonical, jsonLd])
}

export default useSeo
