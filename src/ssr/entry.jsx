import { Suspense } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from '../App'
import { takeCollectedSeo } from '../hooks/useSeo'
import i18n, { initPromise } from '../i18n'
import { langFromPath } from '../config/site'
import { ROUTES } from '../routes'

// Warm up i18n once (loads locale bundles through the same backend the
// client uses).
await initPromise

// Eagerly resolve every page module so renderToString outputs real content
// instead of lazy-Suspense fallbacks.
const eagerPages = new Map()
for (const route of ROUTES) {
  const mod = await route.load()
  eagerPages.set(route.path, mod.default)
}

export async function render(url) {
  const lang = langFromPath(url)
  await i18n.changeLanguage(lang)

  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <Suspense fallback={null}>
        <AppShell resolvePage={route => eagerPages.get(route.path)} />
      </Suspense>
    </MemoryRouter>,
  )

  // useSeo records meta during render; keep the last entry per render.
  const collected = takeCollectedSeo()
  const meta = collected[collected.length - 1] || null
  return { html, meta }
}
