import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import useTheme from './hooks/useTheme'
import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import PoolPumpGuide from './pages/PoolPumpGuide'
import CategoryGuide from './pages/CategoryGuide'
import GuidesPage from './pages/GuidesPage'

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
      <Footer />
    </>
  )
}

export default App
