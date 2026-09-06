import { createContext, useContext, useState } from 'react'

// Shared UI state for overlays that multiple components need to open —
// e.g. MobileCtaBar needs to open the cart drawer without prop-drilling.
const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [consultationOpen, setConsultationOpen] = useState(false)

  return (
    <UIContext.Provider
      value={{
        cartOpen,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
        searchOpen,
        openSearch: () => setSearchOpen(true),
        closeSearch: () => setSearchOpen(false),
        consultationOpen,
        openConsultation: () => setConsultationOpen(true),
        closeConsultation: () => setConsultationOpen(false),
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  return useContext(UIContext)
}
