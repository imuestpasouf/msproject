'use client'

import { useState } from 'react'
import { useCart, CartItem } from '@/context/CartContext'

interface Props {
  product: Omit<CartItem, 'quantite'>
  stock: number
}

function QtyBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center border border-gl text-gd hover:border-black hover:text-black transition-colors cursor-pointer bg-transparent text-[0.9rem]"
    >
      {children}
    </button>
  )
}

export default function AddToCartButton({ product, stock }: Props) {
  const { addItem, updateQuantity, openDrawer, items } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const cartItem = items.find((i) => i.product_id === product.product_id)
  const inCart = !!cartItem

  function handleAdd() {
    addItem({ ...product, quantite: qty, stock })
    setAdded(true)
    openDrawer()
    setTimeout(() => setAdded(false), 2000)
  }

  if (stock === 0) return null

  if (inCart) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[0.62rem] tracking-[0.18em] uppercase text-gm">Quantité</span>
          <div className="flex items-center gap-0">
            <QtyBtn onClick={() => updateQuantity(cartItem.product_id, cartItem.quantite - 1)}>
              −
            </QtyBtn>
            <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gl text-[0.85rem] font-light select-none">
              {cartItem.quantite}
            </span>
            <QtyBtn onClick={() => updateQuantity(cartItem.product_id, Math.min(cartItem.quantite + 1, stock))}>
              +
            </QtyBtn>
          </div>
        </div>
        <button
          type="button"
          onClick={openDrawer}
          className="block w-full text-center text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-rg px-[30px] py-[17px] cursor-pointer border-none transition-colors duration-200 hover:bg-black"
        >
          ✓ Dans le panier — Voir
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-[0.62rem] tracking-[0.18em] uppercase text-gm">Quantité</span>
        <div className="flex items-center gap-0">
          <QtyBtn onClick={() => setQty((q) => Math.max(1, q - 1))}>−</QtyBtn>
          <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gl text-[0.85rem] font-light select-none">
            {qty}
          </span>
          <QtyBtn onClick={() => setQty((q) => Math.min(stock, q + 1))}>+</QtyBtn>
        </div>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="block w-full text-center text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-[30px] py-[17px] cursor-pointer border-none transition-colors duration-200 hover:bg-rg"
      >
        {added ? '✓ Ajouté au panier' : '✦ Ajouter au panier ✦'}
      </button>
    </div>
  )
}
