// Single source of truth for the app's routes.
// `load` returns the page module; App.jsx wraps it in lazy() for code
// splitting, while the prerender script awaits it directly.

export const ROUTES = [
  { path: '/', load: () => import('./pages/Home') },
  { path: '/about', load: () => import('./pages/AboutPage') },
  { path: '/contact', load: () => import('./pages/ContactPage') },
  { path: '/category/:slug', load: () => import('./pages/CategoryPage') },
  { path: '/product/:key', load: () => import('./pages/ProductPage') },
  { path: '/compare', load: () => import('./pages/ComparePage') },
  { path: '/checkout', load: () => import('./pages/CheckoutPage') },
  { path: '/search', load: () => import('./pages/SearchPage') },
  { path: '/pool-pump-guide', load: () => import('./pages/PoolPumpGuide') },
  { path: '/guides', load: () => import('./pages/GuidesPage') },
  { path: '/guide/:slug', load: () => import('./pages/CategoryGuide') },
]

// Legacy URL kept working via a redirect.
export const REDIRECTS = [
  { from: '/guide/pump', to: '/pool-pump-guide' },
]
