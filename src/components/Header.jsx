import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
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

  function handleHashClick(e, id) {
    e.preventDefault()
    closeMenu()
    scrollTo(id)
  }

  function handlePackagesNav() {
    closeMenu()
    if (isHome) {
      scrollTo('packages')
    } else {
      sessionStorage.setItem('scrollTo', 'packages')
      navigate('/')
    }
  }

  return (
    <header>
      <div className="container nav-bar">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon">💧</div>
          <span>آکوا پرو</span>
        </Link>
        <ul className="nav-links">
          {isHome ? (
            <>
              <li><a href="#categories" onClick={e => handleHashClick(e, 'categories')}>دسته‌بندی‌ها</a></li>
              <li><a href="#products" onClick={e => handleHashClick(e, 'products')}>تجهیزات اصلی</a></li>
              <li><a href="#packages" onClick={e => handleHashClick(e, 'packages')}>پکیج‌های آماده</a></li>
              <li><Link to="/about" onClick={closeMenu}>درباره ما</Link></li>
              <li><Link to="/contact" onClick={closeMenu}>تماس با ما</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/" onClick={closeMenu}>صفحه اصلی</Link></li>
              <li><a href="#packages" onClick={e => { e.preventDefault(); handlePackagesNav() }}>پکیج‌های آماده</a></li>
              <li><Link to="/about" onClick={closeMenu}>درباره ما</Link></li>
              <li><Link to="/contact" onClick={closeMenu}>تماس با ما</Link></li>
            </>
          )}
        </ul>
        <button className="btn btn-primary desktop-cta">مشاوره و سفارش</button>
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(p => !p)}
          aria-label="منو"
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} />
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={closeMenu}>✕</button>
        <ul className="mobile-nav-links">
          {isHome ? (
            <>
              <li><a href="#categories" onClick={e => handleHashClick(e, 'categories')}>دسته‌بندی‌ها</a></li>
              <li><a href="#products" onClick={e => handleHashClick(e, 'products')}>تجهیزات اصلی</a></li>
              <li><a href="#packages" onClick={e => handleHashClick(e, 'packages')}>پکیج‌های آماده</a></li>
              <li><Link to="/about" onClick={closeMenu}>درباره ما</Link></li>
              <li><Link to="/contact" onClick={closeMenu}>تماس با ما</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/" onClick={closeMenu}>صفحه اصلی</Link></li>
              <li><a href="#packages" onClick={e => { e.preventDefault(); handlePackagesNav() }}>پکیج‌های آماده</a></li>
              <li><Link to="/about" onClick={closeMenu}>درباره ما</Link></li>
              <li><Link to="/contact" onClick={closeMenu}>تماس با ما</Link></li>
            </>
          )}
        </ul>
        <button className="btn btn-primary mobile-cta">مشاوره و سفارش</button>
      </nav>
    </header>
  );
}

export default Header;
