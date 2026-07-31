import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import PoolPumpGuide from './pages/PoolPumpGuide'

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
        <Route path="/pool-pump-guide" element={<PoolPumpGuide />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
