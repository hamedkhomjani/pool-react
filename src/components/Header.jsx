import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import SearchOverlay from './SearchOverlay'
import CalculatorLink from './CalculatorLink'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice } from '../utils/price'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'

const SECTION_ITEMS = [
  { id: 'products', key: 'nav.products' },
  { id: 'packages', key: 'nav.packages' },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Header({ theme, onToggleTheme }) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const catalog = useCatalog()
  const cart = useCart()
  const { openCart, openSearch, searchOpen, closeSearch, openConsultation } = useUI()
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false)
  const [canHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches,
  )

  useEffect(() => {
    setMenuOpen(false)
    setMegaOpen(false)
    setMobileCatsOpen(false)
  }, [location.pathname, location.hash, location.search])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setMegaOpen(false)
      }
    }
    function handleResize() {
      if (window.innerWidth > 768) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  function closeMega() {
    setMegaOpen(false)
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

  const featured = catalog?.products[0]
  const categories = catalog?.topCategories || []

  return (
    <header onMouseLeave={canHover ? closeMega : undefined}>
      <div className="container nav-bar">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }} onClick={closeMenu}>
          <div className="logo-icon">💧</div>
          <span>{t('brand')}</span>
        </Link>

        <ul className="nav-links">
          <li onMouseEnter={megaOpen ? closeMega : undefined}>
            <Link to="/" onClick={closeMenu}>{t('nav.home')}</Link>
          </li>
          {SECTION_ITEMS.map(item => (
            <li key={item.id} onMouseEnter={megaOpen ? closeMega : undefined}>
              <a href={`#${item.id}`} onClick={e => handleSectionClick(e, item.id)}>
                {t(item.key)}
              </a>
            </li>
          ))}
          <li>
            <button
              className={`mega-btn ${megaOpen ? 'open' : ''}`}
              onClick={() => setMegaOpen(o => !o)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              {t('nav.categories')}
              <svg className="mega-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </li>
          <li onMouseEnter={megaOpen ? closeMega : undefined}>
            <Link to="/guides" onClick={closeMenu}>{t('nav.guides')}</Link>
          </li>
          <li onMouseEnter={megaOpen ? closeMega : undefined}>
            <Link to="/about" onClick={closeMenu}>{t('nav.about')}</Link>
          </li>
          <li onMouseEnter={megaOpen ? closeMega : undefined}>
            <Link to="/contact" onClick={closeMenu}>{t('nav.contact')}</Link>
          </li>
        </ul>

        <div className="nav-actions">
          <button onClick={openConsultation} className="btn btn-primary desktop-cta">{t('nav.cta')}</button>
          <button
            className="search-toggle"
            onClick={openSearch}
            aria-label={t('search.ariaLabel')}
            title={t('search.label')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="cart-toggle"
            onClick={openCart}
            aria-label={t('cart.openAria', { count: cart.count })}
            title={t('cart.title')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="9" cy="20" r="1.6" />
              <circle cx="17" cy="20" r="1.6" />
              <path d="M3 3h2l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20 7H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {cart.count > 0 && <span key={cart.count} className="cart-badge">{cart.count > 99 ? '99+' : cart.count}</span>}
          </button>
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

      {megaOpen && (
        <nav className="mega-panel" aria-label={t('nav.categories')}>
          <div className="mega-panel-inner">
            <div className="mega-col">
              <h4 className="mega-title">{t('megaMenu.explore')}</h4>
              <div className="mega-cat-grid">
                {categories.map(cat => {
                  const children = catalog?.categoryChildren(cat.slug) || []
                  return (
                    <div key={cat.slug} className="mega-cat-group">
                      <Link
                        to={`/category/${cat.slug}`}
                        className="mega-cat"
                        onClick={closeMega}
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="mega-cat-icon" aria-hidden="true">{cat.icon}</span>
                        <span>{t(`categories.${cat.slug}`)}</span>
                      </Link>
                      {children.length > 0 && (
                        <div className="mega-subcats">
                          {children.map(sub => (
                            <Link
                              key={sub.slug}
                              to={`/category/${sub.slug}`}
                              className="mega-subcat"
                              onClick={closeMega}
                              style={{ textDecoration: 'none' }}
                            >
                              <span aria-hidden="true">{sub.icon}</span>
                              {t(`categories.${sub.slug}`)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mega-col">
              {featured && (
                <Link
                  to={`/product/${featured.key}`}
                  className="mega-featured"
                  onClick={closeMega}
                  style={{ textDecoration: 'none' }}
                >
                  <h4 className="mega-title">{t('megaMenu.featured')}</h4>
                  <div className="mega-featured-card">
                    <div className="mega-featured-icon" aria-hidden="true">{featured.icon}</div>
                    <div className="mega-featured-body">
                      <strong className="mega-featured-title">{featured.title}</strong>
                      <p className="mega-featured-desc">{featured.desc}</p>
                      <div className="mega-featured-price">
                        {formatPrice(featured.price, i18n.language)} <span>{t('product.toman')}</span>
                      </div>
                      <span className="btn btn-primary">{t('product.details')}</span>
                    </div>
                  </div>
                </Link>
              )}

              <div className="mega-promo">
                <CalculatorLink>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" strokeLinecap="round" />
                  </svg>
                  {t('megaMenu.volumeCalc')}
                </CalculatorLink>
                <Link to="/contact" className="mega-promo-consult" onClick={closeMega}>
                  {t('megaMenu.consult')}
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} aria-hidden="true" />
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-label={t('nav.menu')}>
        <div className="mobile-nav-top">
          <button className="mobile-nav-close" onClick={closeMenu} aria-label="Close menu">✕</button>
          <div className="mobile-nav-actions">
            <LanguageSwitcher />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
        <ul className="mobile-nav-links">
          <li>
            <Link to="/" onClick={closeMenu} className={location.pathname === '/' ? 'active' : ''}>
              {t('nav.home')}
            </Link>
          </li>
          <li className="mobile-cats">
            <button
              className={`mobile-cats-toggle ${mobileCatsOpen ? 'open' : ''}`}
              onClick={() => setMobileCatsOpen(o => !o)}
              aria-expanded={mobileCatsOpen}
            >
              {t('nav.categories')}
              <svg className="mega-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ul className={`mobile-cats-list ${mobileCatsOpen ? 'open' : ''}`}>
              {categories.map(cat => {
                const children = catalog?.categoryChildren(cat.slug) || []
                const catPath = `/category/${cat.slug}`
                return (
                  <li key={cat.slug}>
                    <Link to={catPath} onClick={closeMenu} className={location.pathname === catPath ? 'active' : ''}>
                      <span aria-hidden="true">{cat.icon}</span>
                      {t(`categories.${cat.slug}`)}
                    </Link>
                    {children.length > 0 && (
                      <ul className="mobile-subcats-list">
                        {children.map(sub => {
                          const subPath = `/category/${sub.slug}`
                          return (
                            <li key={sub.slug}>
                              <Link to={subPath} onClick={closeMenu} className={location.pathname === subPath ? 'active' : ''}>
                                <span aria-hidden="true">{sub.icon}</span>
                                {t(`categories.${sub.slug}`)}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </li>
          {SECTION_ITEMS.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={e => handleSectionClick(e, item.id)}>
                {t(item.key)}
              </a>
            </li>
          ))}
          <li>
            <Link to="/guides" onClick={closeMenu} className={location.pathname.startsWith('/guides') ? 'active' : ''}>
              {t('nav.guides')}
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={closeMenu} className={location.pathname === '/about' ? 'active' : ''}>
              {t('nav.about')}
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMenu} className={location.pathname === '/contact' ? 'active' : ''}>
              {t('nav.contact')}
            </Link>
          </li>
        </ul>
        <button onClick={() => { closeMenu(); openConsultation(); }} className="btn btn-primary mobile-cta">{t('nav.cta')}</button>
      </nav>
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  )
}

export default Header