import { Component } from 'react'
import i18n from '../i18n'
import { track } from '../utils/track'

// Catches render/lifecycle errors anywhere below and shows a friendly,
// localized fallback with a reload action instead of a blank page.
// A keyed boundary (made from the route path) also makes navigation reset it.
class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error('[ErrorBoundary]', error)
    try {
      track('error_boundary', { message: String(error?.message || error) })
    } catch {
      // never let telemetry make things worse
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    const t = key => i18n.t(key)
    return (
      <section className="error-boundary">
        <div className="container">
          <div className="error-boundary-icon" aria-hidden="true">⚠️</div>
          <h2>{t('errors.title')}</h2>
          <p>{t('errors.message')}</p>
          <button type="button" className="btn btn-primary" onClick={() => {
            this.setState({ hasError: false })
            window.location.reload()
          }}>
            {t('errors.reload')}
          </button>
        </div>
      </section>
    )
  }
}

export default ErrorBoundary