import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import i18n, { initPromise } from './i18n'
import { loadCatalogContent } from './data/catalog'
import App from './App.jsx'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const initialLang = i18n.language === 'en' ? 'en' : 'fa'
document.documentElement.setAttribute('lang', initialLang === 'fa' ? 'fa' : 'en')
document.documentElement.setAttribute('dir', initialLang === 'fa' ? 'rtl' : 'ltr')

Promise.all([initPromise, loadCatalogContent(initialLang)]).then(() => {
  document.title = i18n.t('meta.homeTitle')
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
})