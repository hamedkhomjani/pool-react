/* eslint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { track } from '../utils/track'

const STORAGE_KEY = 'aquapro.cart.v1'

// Items are stored as [{ key, qty }]; prices/labels are resolved through the
// catalog at render time so the cart never holds stale localized data.
const CartContext = createContext(null)

function readStorage() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed)
      ? parsed.filter(i => i && typeof i.key === 'string' && Number.isFinite(i.qty))
      : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStorage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full/blocked — cart still works for the session
    }
  }, [items])

  const add = (key, qty = 1) => {
    setItems(current => {
      const existing = current.find(i => i.key === key)
      return existing
        ? current.map(i => (i.key === key ? { ...i, qty: i.qty + qty } : i))
        : [...current, { key, qty }]
    })
    track('add_to_cart', { key, qty })
  }

  const setQty = (key, qty) =>
    setItems(current =>
      current.map(i => (i.key === key ? { ...i, qty: Math.max(1, Math.floor(qty)) } : i)),
    )

  const remove = key => setItems(current => current.filter(i => i.key !== key))

  const clear = () => setItems([])

  const count = items.reduce((sum, i) => sum + (i.qty || 0), 0)

  return (
    <CartContext.Provider value={{ items, count, add, setQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}

export default CartProvider