'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string
  nom: string
  ref: string
  collection: string | null
  photo_principale: string | null
  prix: number
  prix_reduc: number | null
  reduction: number | null
  quantite: number
  stock: number
}

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  addItem: (item: CartItem) => void
  updateQuantity: (productId: string, qty: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'd1milano_cart'

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadFromStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id)
      if (existing) {
        const newQty = Math.min(existing.quantite + item.quantite, item.stock)
        return prev.map((i) =>
          i.product_id === item.product_id ? { ...i, quantite: newQty } : i
        )
      }
      return [...prev, { ...item, quantite: Math.min(item.quantite, item.stock) }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.product_id !== productId)
      return prev.map((i) =>
        i.product_id === productId
          ? { ...i, quantite: Math.min(qty, i.stock) }
          : i
      )
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((s, i) => s + i.quantite, 0)
  const total = items.reduce((s, i) => s + (i.prix_reduc ?? i.prix) * i.quantite, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
