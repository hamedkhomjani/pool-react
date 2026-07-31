import { useEffect } from 'react'

function upsertHead(selector, create) {
  const existing = document.head.querySelector(selector)
  if (existing) return existing
  const el = create()
  el.setAttribute('data-seo', 'true')
  document.head.appendChild(el)
  return el
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
