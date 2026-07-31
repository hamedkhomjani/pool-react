import { Routes, Route } from 'react-router-dom'
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
