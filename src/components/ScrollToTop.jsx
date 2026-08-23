import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { langFromPath } from '../config/site'

function ScrollToTop() {
  const { pathname } = useLocation()
  // Ignore language-prefix-only changes so switching language keeps scroll.
  const pagePath = pathname.slice(langFromPath(pathname) === 'en' ? 3 : 0)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pagePath])

  return null
}

export default ScrollToTop
