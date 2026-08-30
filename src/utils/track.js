// Analytics seam. Every tracked action funnels through this single function
// so a real provider (GA4/Plausible/self-hosted beacon) can be attached in one
// place later. For now events land in window.dataLayer (what Google Tag Manager
// reads) and are de-bug-logged in development.
//
// Events so far: page_view, category_view, product_view, search, error_boundary,
// and (step 7) add_to_cart.
export function track(event, data = {}) {
  if (import.meta.env.DEV) {
    console.debug('[track]', event, data)
  }
  if (typeof window === 'undefined') return
  const payload = {
    event,
    ts: Date.now(),
    href: typeof window.location !== 'undefined' ? window.location.pathname + window.location.search : '',
    lang: typeof document !== 'undefined' ? document.documentElement.lang : '',
    ...data,
  }
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(payload)
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[track] failed:', err)
  }
}

export default track