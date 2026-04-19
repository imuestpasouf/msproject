'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'

function formatPrice(n: number) { return n.toLocaleString('fr-MA') + ' MAD' }

export default function CartDrawer() {
  const { items, total, removeItem, isDrawerOpen, closeDrawer } = useCart()

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isDrawerOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeDrawer])

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[150] transition-opacity duration-300"
        style={{
          background: 'rgba(10,10,10,0.5)',
          opacity: isDrawerOpen ? 1 : 0,
          pointerEvents: isDrawerOpen ? 'auto' : 'none',
        }}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-[160] h-full flex flex-col bg-white"
        style={{
          width: 'min(400px, 100vw)',
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
        }}
        role="dialog"
        aria-label="Panier"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gl flex-shrink-0">
          <div>
            <p className="text-[0.6rem] tracking-[0.25em] uppercase text-rg mb-0.5">Mon panier</p>
            <p className="text-[0.75rem] text-gm">{items.length} article{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center cursor-pointer bg-transparent border-none text-gm hover:text-black transition-colors"
            aria-label="Fermer le panier"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gl">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <div>
                <p className="text-[0.85rem] font-light text-gd mb-1">Votre panier est vide</p>
                <p className="text-[0.72rem] text-gm">Ajoutez une montre pour commencer</p>
              </div>
              <Link
                href="/catalogue"
                onClick={closeDrawer}
                className="text-[0.68rem] tracking-[0.18em] uppercase text-black border border-black px-5 py-2.5 no-underline hover:bg-black hover:text-white transition-colors duration-200"
              >
                Voir le catalogue
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-4 pb-4 border-b border-gl last:border-none">
                  {/* Photo */}
                  <Link href={`/produits/${item.product_id}`} onClick={closeDrawer} className="flex-shrink-0">
                    <div className="w-18 h-18 bg-off overflow-hidden" style={{ width: 72, height: 72 }}>
                      {item.photo_principale ? (
                        <Image
                          src={item.photo_principale}
                          alt={item.nom}
                          width={72}
                          height={72}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gl" />
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.62rem] tracking-[0.18em] uppercase text-rg mb-0.5">{item.collection}</p>
                    <p className="text-[0.85rem] font-light text-black leading-tight mb-0.5 truncate">{item.nom}</p>
                    <p className="text-[0.65rem] text-gm mb-2">Réf. {item.ref}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[0.9rem] font-light" style={{ color: item.prix_reduc ? '#c9956c' : '#0a0a0a' }}>
                        {formatPrice(item.prix_reduc ?? item.prix)}
                      </span>
                      {item.prix_reduc && (
                        <span className="text-[0.68rem] text-gm line-through">{formatPrice(item.prix)}</span>
                      )}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id)}
                    className="flex-shrink-0 self-start mt-1 w-6 h-6 flex items-center justify-center cursor-pointer bg-transparent border-none text-gm hover:text-red-500 transition-colors"
                    aria-label="Supprimer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-gl px-6 py-5">
            <div className="flex justify-between items-baseline mb-5">
              <span className="text-[0.62rem] tracking-[0.2em] uppercase text-gm">Total TTC</span>
              <span className="text-[1.1rem] font-light">{formatPrice(total)}</span>
            </div>
            <Link
              href="/commande"
              onClick={closeDrawer}
              className="block text-center text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-6 py-4 no-underline mb-3 transition-colors hover:bg-rg"
            >
              ✦ Passer la commande ✦
            </Link>
            <button
              type="button"
              onClick={closeDrawer}
              className="w-full text-center text-[0.68rem] tracking-[0.16em] uppercase text-gm py-2 cursor-pointer bg-transparent border-none hover:text-black transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  )
}
