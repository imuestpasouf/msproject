'use client'

import { useState } from 'react'
import { useCart, CartItem } from '@/context/CartContext'

interface Props {
  product: CartItem
  stock: number
}

export default function AddToCartButton({ product, stock }: Props) {
  const { addItem, openDrawer, items } = useCart()
  const [added, setAdded] = useState(false)

  const inCart = items.some((i) => i.product_id === product.product_id)

  function handleAdd() {
    if (inCart || stock === 0) return
    addItem(product)
    setAdded(true)
    openDrawer()
    setTimeout(() => setAdded(false), 2000)
  }

  if (stock === 0) return null

  if (inCart) {
    return (
      <button
        type="button"
        onClick={openDrawer}
        className="block w-full text-center text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-rg px-[30px] py-[17px] cursor-pointer border-none transition-colors duration-200 hover:bg-black"
      >
        ✓ Dans le panier — Voir
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="block w-full text-center text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-[30px] py-[17px] cursor-pointer border-none transition-colors duration-200 hover:bg-rg"
    >
      {added ? '✓ Ajouté au panier' : '✦ Ajouter au panier ✦'}
    </button>
  )
}
