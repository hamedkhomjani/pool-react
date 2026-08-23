import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'

const SECTION_ITEMS = [
  { id: 'categories', key: 'nav.categories' },
  { id: 'products', key: 'nav.products' },
  { id: 'packages', key: 'nav.packages' },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Header({ theme, onToggleTheme }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash, location.search])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleSectionClick(e, id) {
    e.preventDefault()
    closeMenu()
    if (location.pathname === '/') {
      scrollToId(id)
    } else {
      sessionStorage.setItem('scrollTo', id)
      navigate('/')
    }
  }

  return (
    <header>
      <div className="container nav-bar">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }} onClick={closeMenu}>
          <div className="logo-icon">💧</div>
          <span>{t('brand')}</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/" onClick={closeMenu}>{t('nav.home')}</Link>
          </li>
          {SECTION_ITEMS.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={e => handleSectionClick(e, item.id)}>
                {t(item.key)}
              </a>
            </li>
          ))}
          <li>
            <Link to="/guides" onClick={closeMenu}>{t('nav.guides')}</Link>
          </li>
          <li>
            <Link to="/about" onClick={closeMenu}>{t('nav.about')}</Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMenu}>{t('nav.contact')}</Link>
          </li>
        </ul>

        <div className="nav-actions">
          <Link to="/contact" className="btn btn-primary desktop-cta">{t('nav.cta')}</Link>
          <LanguageSwitcher />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(p => !p)}
            aria-label={t('nav.menu')}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} />
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-top">
          <button className="mobile-nav-close" onClick={closeMenu}>✕</button>
          <LanguageSwitcher />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <ul className="mobile-nav-links">
          <li>
            <Link to="/" onClick={closeMenu}>{t('nav.home')}</Link>
          </li>
          {SECTION_ITEMS.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={e => handleSectionClick(e, item.id)}>
                {t(item.key)}
              </a>
            </li>
          ))}
          <li>
            <Link to="/guides" onClick={closeMenu}>{t('nav.guides')}</Link>
          </li>
          <li>
            <Link to="/about" onClick={closeMenu}>{t('nav.about')}</Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMenu}>{t('nav.contact')}</Link>
          </li>
        </ul>
        <Link to="/contact" className="btn btn-primary mobile-cta">{t('nav.cta')}</Link>
      </nav>
    </header>
  )
}

export default Header
