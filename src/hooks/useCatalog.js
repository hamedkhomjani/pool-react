import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createCatalog, getCatalogContentSync, loadCatalogContent } from '../data/catalog'

// Returns the catalog bound to the current i18n language, or null while that
// language's content is loading (e.g. during an in-app language switch). The
// initial language is pre-warmed before mount (main.jsx) and before server
// renders (ssr/entry.jsx), so first paint is never a loading shell.
export function useCatalog() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const [langState, setLangState] = useState(() =>
    getCatalogContentSync(lang) ? lang : null,
  )

  useEffect(() => {
    let alive = true
    if (getCatalogContentSync(lang)) {
      setLangState(lang)
    } else {
      loadCatalogContent(lang).then(() => {
        if (alive) setLangState(lang)
      })
    }
    return () => {
      alive = false
    }
  }, [lang])

  return langState === lang ? createCatalog(lang) : null
}

export default useCatalog