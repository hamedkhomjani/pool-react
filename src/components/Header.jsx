import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

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
              <li><a href="#categories">دسته‌بندی‌ها</a></li>
              <li><a href="#products">تجهیزات اصلی</a></li>
              <li><a href="#packages">پکیج‌های آماده</a></li>
              <li><Link to="/about">درباره ما</Link></li>
              <li><Link to="/contact">تماس با ما</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/">صفحه اصلی</Link></li>
              <li><Link to="/#packages">پکیج‌های آماده</Link></li>
              <li><Link to="/about">درباره ما</Link></li>
              <li><Link to="/contact">تماس با ما</Link></li>
            </>
          )}
        </ul>
        <button className="btn btn-primary">مشاوره و سفارش</button>
      </div>
    </header>
  );
}

export default Header;
