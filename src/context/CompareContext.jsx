// Compare list state. Mirrors the cart pattern: only product keys are stored
// (localStorage persisted, capped) and prices/labels are resolved through the
// catalog at render time so we never hold stale localized data.
/* eslint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { track } from '../utils/track'

const STORAGE_KEY = 'aquapro.compare.v1'
const MAX_COMPARE = 4

const CompareContext = createContext(null)

function readStorage() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed)
      ? parsed.filter(k => typeof k === 'string')
      : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }) {
  const [keys, setKeys] = useState(readStorage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
    } catch {
      // storage full/blocked — compare still works for the session
    }
  }, [keys])

  const toggle = key => {
    setKeys(current => {
      if (current.includes(key)) {
        track('compare_remove', { key })
        return current.filter(k => k !== key)
      }
      if (current.length >= MAX_COMPARE) {
        track('compare_full', { key })
        return current
      }
      track('compare_add', { key })
      return [...current, key]
    })
  }

  const remove = key => {
    setKeys(current => {
      track('compare_remove', { key })
      return current.filter(k => k !== key)
    })
  }

  const clear = () => {
    track('compare_clear', { count: keys.length })
    setKeys([])
  }

  const contains = key => keys.includes(key)
  const isFull = keys.length >= MAX_COMPARE

  return (
    <CompareContext.Provider
      value={{ keys, toggle, remove, clear, contains, isFull, max: MAX_COMPARE }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  return useContext(CompareContext)
}

export default CompareProvider
