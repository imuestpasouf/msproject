'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useLocale } from '@/context/LocaleContext'

function formatPrice(n: number) { return n.toLocaleString('fr-MA') + ' MAD' }

export default function PanierPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const { t, base } = useLocale()
  const ct = t.cart

  const itemCount = items.reduce((s, i) => s + i.quantite, 0)
  const countLabel = (itemCount === 1 ? ct.n_item : ct.n_items).replace('{n}', String(itemCount))

  if (items.length === 0) {
    return (
      <div className="pt-[80px] min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gl">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <div>
          <p className="text-[1rem] font-light text-gd mb-1">{ct.empty}</p>
          <p className="text-[0.78rem] text-gm">{ct.empty_sub}</p>
        </div>
        <Link href={`${base}/catalogue`} className="text-[0.72rem] tracking-[0.2em] uppercase text-white bg-black px-6 py-3.5 no-underline hover:bg-rg transition-colors duration-200">
          {ct.see_catalogue}
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-[80px] min-h-screen bg-off">
      <div className="max-w-[1100px] mx-auto px-6 py-12 max-md:py-8">

        <div className="mb-8">
          <p className="text-[0.62rem] tracking-[0.28em] uppercase text-rg mb-1.5">{ct.my_cart}</p>
          <h1 className="font-display font-light text-black" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)' }}>
            {countLabel}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8">

          {/* Items */}
          <div className="flex flex-col gap-[2px]">
            {items.map((item) => (
              <div key={item.product_id} className="bg-white flex gap-5 p-5">
                <Link href={`${base}/produits/${item.product_id}`} className="flex-shrink-0">
                  <div className="bg-off overflow-hidden" style={{ width: 96, height: 96 }}>
                    {item.photo_principale ? (
                      <Image src={item.photo_principale} alt={item.nom} width={96} height={96} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-gl" />}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-[0.6rem] tracking-[0.2em] uppercase text-rg mb-0.5">{item.collection}</p>
                  <Link href={`${base}/produits/${item.product_id}`} className="no-underline">
                    <p className="text-[0.95rem] font-light text-black leading-tight mb-0.5 hover:text-rg transition-colors">{item.nom}</p>
                  </Link>
                  <p className="text-[0.65rem] text-gm mb-3">Réf. {item.ref}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <button type="button" onClick={() => updateQuantity(item.product_id, item.quantite - 1)} className="w-7 h-7 flex items-center justify-center border border-gl text-gm hover:border-black hover:text-black transition-colors cursor-pointer bg-transparent text-[0.85rem]">−</button>
                      <span className="w-9 h-7 flex items-center justify-center border-t border-b border-gl text-[0.82rem] font-light select-none">{item.quantite}</span>
                      <button type="button" onClick={() => updateQuantity(item.product_id, Math.min(item.quantite + 1, item.stock))} className="w-7 h-7 flex items-center justify-center border border-gl text-gm hover:border-black hover:text-black transition-colors cursor-pointer bg-transparent text-[0.85rem]">+</button>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[0.95rem] font-light" style={{ color: item.prix_reduc ? '#c9956c' : '#0a0a0a' }}>
                        {formatPrice((item.prix_reduc ?? item.prix) * item.quantite)}
                      </span>
                      {item.prix_reduc && item.quantite === 1 && (
                        <span className="text-[0.7rem] text-gm line-through">{formatPrice(item.prix)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button type="button" onClick={() => removeItem(item.product_id)} className="flex-shrink-0 self-start w-7 h-7 flex items-center justify-center cursor-pointer bg-transparent border-none text-gm hover:text-red-500 transition-colors" aria-label={ct.remove_aria}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="flex justify-end pt-3">
              <button type="button" onClick={clearCart} className="text-[0.65rem] tracking-[0.14em] uppercase text-gm hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none">
                {ct.clear}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-[2px]">
            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-5">{ct.summary}</p>
              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between items-baseline gap-3">
                    <span className="text-[0.78rem] font-light text-gd truncate">
                      {item.nom}{item.quantite > 1 && <span className="text-gm"> ×{item.quantite}</span>}
                    </span>
                    <span className="text-[0.78rem] font-light text-black flex-shrink-0">
                      {formatPrice((item.prix_reduc ?? item.prix) * item.quantite)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-[1px] bg-gl mb-5" />
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-[0.62rem] tracking-[0.2em] uppercase text-gm">{ct.total_ttc}</span>
                <span className="text-[1.2rem] font-light">{formatPrice(total)}</span>
              </div>
              <Link href={`${base}/commande`} className="block text-center text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-6 py-4 no-underline mb-3 transition-colors hover:bg-rg">
                {ct.checkout}
              </Link>
              <Link href={`${base}/catalogue`} className="block text-center text-[0.68rem] tracking-[0.16em] uppercase text-gm py-2 no-underline hover:text-black transition-colors">
                {ct.continue_shopping}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
