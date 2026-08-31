import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import CartProvider from './context/CartContext'
import CompareProvider from './context/CompareContext'
import CartDrawer from './components/CartDrawer'
import CompareTray from './components/CompareTray'
import useTheme from './hooks/useTheme'
import { ROUTES, REDIRECTS } from './routes'
import { langFromPath } from './config/site'
import { track } from './utils/track'

const ChatWidget = lazy(() => import('./components/ChatWidget'))

// Client build code-splits every page; the prerender entry passes its own
// resolver with eagerly imported pages instead.
function lazyResolver() {
  const cache = new Map()
  return route => {
    if (!cache.has(route.path)) cache.set(route.path, lazy(route.load))
    return cache.get(route.path)
  }
}

const enPath = p => (p === '/' ? '/en' : `/en${p}`)

function routeElements(resolvePage) {
  const pages = ROUTES.map(r => ({ ...r, Component: resolvePage(r) }))
  return (
    <>
      {pages.map(({ Component, path }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      {pages.map(({ Component, path }) => (
        <Route key={enPath(path)} path={enPath(path)} element={<Component />} />
      ))}
      {REDIRECTS.map(({ from, to }) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
      {REDIRECTS.map(({ from, to }) => (
        <Route
          key={enPath(from)}
          path={enPath(from)}
          element={<Navigate to={enPath(to)} replace />}
        />
      ))}
    </>
  )
}

// Keeps i18n language in sync with the URL prefix (/en vs root).
function LangSync() {
  const location = useLocation()
  const { i18n } = useTranslation()
  const urlLang = langFromPath(location.pathname)

  useEffect(() => {
    if (i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang)
    }
  }, [urlLang, i18n])

  return null
}

function PageLoading() {
  return (
    <section className="page-loading" aria-hidden="true">
      <div className="page-loading-spinner" />
    </section>
  )
}

// Emits a page_view event for the analytics seam on every route change.
function PageViewTrack() {
  const location = useLocation()
  useEffect(() => {
    track('page_view', { path: location.pathname + location.search })
  }, [location.pathname, location.search])
  return null
}

// Resets the error boundary when the route changes, so a failure on one page
// is not carried over to the next navigation.
function KeyedErrorBoundary({ children }) {
  const location = useLocation()
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>
}

export function AppShell({ resolvePage }) {
  const { theme, toggleTheme } = useTheme()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <CartProvider>
      <CompareProvider>
        <Header theme={theme} onToggleTheme={toggleTheme} onOpenCart={() => setCartOpen(true)} />
        <ScrollToTop />
        <LangSync />
        <PageViewTrack />
        <KeyedErrorBoundary>
          <Suspense fallback={<PageLoading />}>
            <Routes>{routeElements(resolvePage)}</Routes>
          </Suspense>
        </KeyedErrorBoundary>
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
        <Footer />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <CompareTray />
      </CompareProvider>
    </CartProvider>
  )
}

function App() {
  return <AppShell resolvePage={lazyResolver()} />
}

export default App
