import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import useTheme from './hooks/useTheme'
import { ROUTES, REDIRECTS } from './routes'
import { langFromPath } from './config/site'

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

export function AppShell({ resolvePage }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <ScrollToTop />
      <LangSync />
      <Suspense fallback={<PageLoading />}>
        <Routes>{routeElements(resolvePage)}</Routes>
      </Suspense>
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
      <Footer />
    </>
  )
}

function App() {
  return <AppShell resolvePage={lazyResolver()} />
}

export default App
