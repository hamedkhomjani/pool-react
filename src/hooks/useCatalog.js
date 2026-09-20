import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createCatalog, getCatalogContentSync, loadCatalogContent } from '../data/catalog'
import { getProductsFromSupabase, transformProductRow, seedStaticCatalogToSupabase } from '../services/catalogService'

export function useCatalog() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const [langState, setLangState] = useState(() =>
    getCatalogContentSync(lang) ? lang : null,
  )
  const [dynamicProducts, setDynamicProducts] = useState(null)

  useEffect(() => {
    let alive = true

    if (getCatalogContentSync(lang)) {
      setLangState(lang)
    } else {
      loadCatalogContent(lang).then(() => {
        if (alive) setLangState(lang)
      })
    }

    getProductsFromSupabase().then(rows => {
      if (!alive) return
      if (rows && rows.length > 0) {
        setDynamicProducts(rows.map(r => transformProductRow(r, lang)))
      } else {
        // Auto-seed if database is currently empty
        seedStaticCatalogToSupabase().then(res => {
          if (res && res.seeded) {
            getProductsFromSupabase().then(newRows => {
              if (alive && newRows) {
                setDynamicProducts(newRows.map(r => transformProductRow(r, lang)))
              }
            })
          }
        })
      }
    })

    return () => {
      alive = false
    }
  }, [lang])

  return langState === lang ? createCatalog(lang, dynamicProducts) : null
}

export default useCatalog