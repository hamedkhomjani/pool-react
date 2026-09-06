import { useEffect, useRef, useState } from 'react'

function Reveal({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null)
  // For SSR prerendering, default visible to true so pre-rendered HTML contains visible content
  const [visible, setVisible] = useState(() => typeof window === 'undefined')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Immediately reveal if user prefers reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    // Fallback if IntersectionObserver is unsupported
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    // Immediately reveal if element is already inside or near the viewport on mount
    const vh = window.innerHeight || document.documentElement?.clientHeight || 800
    const rect = el.getBoundingClientRect()
    if (rect.top < vh + 100 && rect.bottom > -100) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: '60px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sanitizedDelay = Math.max(0, Number(delay) || 0)

  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction} ${visible ? 'reveal-visible' : ''}`}
      style={sanitizedDelay > 0 ? { transitionDelay: `${sanitizedDelay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export default Reveal
