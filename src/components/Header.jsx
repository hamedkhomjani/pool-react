import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const NAV_ITEMS = [
  { type: 'section', label: 'دسته‌بندی‌ها', id: 'categories' },
  { type: 'section', label: 'تجهیزات اصلی', id: 'products' },
  { type: 'section', label: 'پکیج‌های آماده', id: 'packages' },
  { type: 'link', label: 'درباره ما', to: '/about' },
  { type: 'link', label: 'تماس با ما', to: '/contact' },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Header({ theme, onToggleTheme }) {
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

  function isActive(item) {
    return item.type === 'link' && location.pathname === item.to
  }

  return (
    <header>
      <div className="container nav-bar">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }} onClick={closeMenu}>
          <div className="logo-icon">💧</div>
          <span>آکوا پرو</span>
        </Link>

        <ul className="nav-links">
          {NAV_ITEMS.map(item =>
            item.type === 'section' ? (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={e => handleSectionClick(e, item.id)}>
                  {item.label}
                </a>
              </li>
            ) : (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={closeMenu}
                  className={isActive(item) ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>

        <div className="nav-actions">
          <button className="btn btn-primary desktop-cta">مشاوره و سفارش</button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(p => !p)}
            aria-label="منو"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} />
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-top">
          <button className="mobile-nav-close" onClick={closeMenu}>✕</button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <ul className="mobile-nav-links">
          {NAV_ITEMS.map(item =>
            item.type === 'section' ? (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={e => handleSectionClick(e, item.id)}>
                  {item.label}
                </a>
              </li>
            ) : (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={closeMenu}
                  className={isActive(item) ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
        <button className="btn btn-primary mobile-cta">مشاوره و سفارش</button>
      </nav>
    </header>
  )
}

export default Header
