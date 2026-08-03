import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import useTheme from './hooks/useTheme'

const Home = lazy(() => import('./pages/Home'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const PoolPumpGuide = lazy(() => import('./pages/PoolPumpGuide'))
const CategoryGuide = lazy(() => import('./pages/CategoryGuide'))
const GuidesPage = lazy(() => import('./pages/GuidesPage'))
const ChatWidget = lazy(() => import('./components/ChatWidget'))

function PageLoading() {
  return (
    <section className="page-loading" aria-hidden="true">
      <div className="page-loading-spinner" />
    </section>
  )
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang = i18n.language === 'en' ? 'en' : 'fa'
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr')
  }, [i18n.language])

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <ScrollToTop />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:key" element={<ProductPage />} />
          <Route path="/pool-pump-guide" element={<PoolPumpGuide />} />
          <Route path="/guide/pump" element={<Navigate to="/pool-pump-guide" replace />} />
          <Route path="/guide/:slug" element={<CategoryGuide />} />
          <Route path="/guides" element={<GuidesPage />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
      <Footer />
    </>
  )
}

export default App
