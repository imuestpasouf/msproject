'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import type { Product } from '@/lib/supabase/database.types'
import { useLocale } from '@/context/LocaleContext'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsDesktop } from '@/hooks/useIsDesktop'

function formatPrice(n: number) { return n.toLocaleString('fr-MA') + ' MAD' }

const COLLECTION_FILTER: Record<string, string> = {
  Polycarbon: 'polycarbon',
  'Ultra Thin': 'ultrathin',
  Skeleton: 'skeleton',
  Tahoe: 'tahoe',
}

function mentionStyle(mention: string | null): string {
  if (!mention) return ''
  if (mention === 'Nouveau' || mention === 'Premium') return 'bg-black text-white'
  return 'bg-rg text-white'
}

function matchesFilter(product: Product, filterKey: string) {
  if (filterKey === 'all') return true
  const key = COLLECTION_FILTER[product.collection ?? ''] ?? product.collection?.toLowerCase()
  return key === filterKey
}

export default function HomeCatalogueSection({ products }: { products: Product[] }) {
  const [active, setActive] = useState('all')
  const { t, base } = useLocale()
  const cs = t.catalogue_section
  const prefersReducedMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()
  const columns = isDesktop ? 4 : 2

  const pillRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const curtainRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const hasMountedRef = useRef(false)

  const FILTERS = [
    { key: 'all', label: cs.all },
    { key: 'polycarbon', label: 'Polycarbon' },
    { key: 'ultrathin', label: 'Ultra Thin' },
    { key: 'skeleton', label: 'Skeleton' },
  ]

  function positionPill(key: string, animate: boolean) {
    const btn = buttonRefs.current[key]
    const pill = pillRef.current
    if (!btn || !pill) return
    const { offsetLeft, offsetWidth } = btn
    if (animate && !prefersReducedMotion) {
      gsap.to(pill, { x: offsetLeft, width: offsetWidth, duration: 0.55, ease: 'expo.out' })
    } else {
      gsap.set(pill, { x: offsetLeft, width: offsetWidth })
    }
  }

  // Reposition the pill on the active filter change and on layout reflow (resize/wrap).
  useEffect(() => {
    positionPill(active, hasMountedRef.current)

    products.forEach((product) => {
      const card = cardRefs.current[product.id]
      if (!card) return
      const show = matchesFilter(product, active)
      const animate = hasMountedRef.current && !prefersReducedMotion
      if (!animate) {
        card.style.display = show ? '' : 'none'
        gsap.set(card, { opacity: show ? 1 : 0, scale: show ? 1 : 0.94 })
        return
      }
      if (show) card.style.display = ''
      gsap.to(card, {
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0.94,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          if (!show) card.style.display = 'none'
        },
      })
    })

    hasMountedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, prefersReducedMotion])

  useEffect(() => {
    function onResize() { positionPill(active, false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Curtain reveal on scroll-in, independent of the filter state.
  useEffect(() => {
    if (prefersReducedMotion) return
    const tweens = products.map((product, i) => {
      const card = cardRefs.current[product.id]
      const panel = curtainRefs.current[product.id]
      if (!card || !panel) return null
      gsap.set(panel, { scaleY: 1 })
      return gsap.to(panel, {
        scaleY: 0,
        duration: 0.9,
        ease: 'expo.inOut',
        delay: (i % columns) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
      })
    })

    return () => {
      tweens.forEach((tween) => {
        tween?.scrollTrigger?.kill()
        tween?.kill()
      })
    }
  }, [prefersReducedMotion, columns, products])

  return (
    <section id="catalogue" className="px-12 py-[88px] max-md:px-5 max-md:py-16">
      <div className="flex justify-between items-end mb-11 flex-wrap gap-4">
        <div>
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">{cs.available_now}</p>
          <h2 className="font-display font-light leading-[1.15] text-black mb-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {cs.title_plain}{cs.title_plain ? ' ' : ''}<em className="italic text-gm">{cs.title_em}</em>
          </h2>
        </div>
        <div className="relative flex gap-2 flex-wrap">
          <div ref={pillRef} className="absolute inset-y-0 left-0 bg-black pointer-events-none" style={{ zIndex: 0 }} />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              ref={(el) => { buttonRefs.current[f.key] = el }}
              onClick={() => setActive(f.key)}
              className={clsx(
                'relative z-10 text-[0.68rem] tracking-[0.14em] uppercase font-normal px-4 py-2 border transition-colors duration-300 cursor-pointer font-body',
                active === f.key ? 'text-white border-black' : 'text-gd border-gl hover:text-black',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-md:gap-3.5">
        {products.map((product) => (
          <div key={product.id} ref={(el) => { cardRefs.current[product.id] = el }}>
            <Link href={`${base}/produits/${product.id}`} data-cursor={t.cursor.view}
              className={['block no-underline text-black cursor-pointer group transition-transform duration-300 hover:-translate-y-1', product.stock === 0 ? 'opacity-60' : ''].join(' ')}>
              <div className="relative aspect-square bg-off overflow-hidden mb-3.5">
                {product.photo_principale ? (
                  <Image src={product.photo_principale} alt={product.nom} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" sizes="(max-width: 768px) 50vw, 25vw" />
                ) : <div className="w-full h-full bg-gl transition-transform duration-500 group-hover:scale-[1.06]" />}

                {!prefersReducedMotion && (
                  <div
                    ref={(el) => { curtainRefs.current[product.id] = el }}
                    className="absolute inset-0 bg-off z-[5] pointer-events-none"
                    style={{ transformOrigin: 'bottom' }}
                  />
                )}

                {/* Top badges — flex container prevents overlap on mobile */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start gap-1 pointer-events-none">
                  <span className={['text-[0.58rem] tracking-[0.14em] uppercase px-2 py-1 font-normal', product.mention && product.stock > 0 ? mentionStyle(product.mention) : 'invisible'].join(' ')}>
                    {product.mention ?? ''}
                  </span>
                  {product.stock > 0 && product.stock <= 2 && (
                    <span className="text-[0.58rem] tracking-[0.14em] uppercase px-2 py-1 font-normal shrink-0"
                      style={{ color: '#f97316', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.35)' }}>
                      {cs.low_stock.replace('{n}', String(product.stock))}
                    </span>
                  )}
                </div>

                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <span className="text-[0.62rem] tracking-[0.2em] uppercase text-white px-3 py-1.5 border border-white/60">
                      {cs.out_of_stock}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-center py-3 text-[0.68rem] tracking-[0.16em] uppercase translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  {cs.quick_view}
                </div>
              </div>

              <div className="text-[0.62rem] tracking-[0.2em] uppercase text-rg mb-1">{product.collection}</div>
              <div className="font-display text-[1.1rem] font-normal mb-0.5">{product.nom}</div>
              <div className="text-[0.65rem] text-gm tracking-[0.08em] mb-2">Réf. {product.ref}</div>
              <div className="text-[0.92rem] font-normal tracking-[0.04em]">
                {product.prix_reduc != null ? (
                  <span className="flex items-baseline gap-2 flex-wrap">
                    <span>
                      {formatPrice(product.prix_reduc)}{' '}
                      <span className="text-[0.68rem] text-gm">TTC</span>
                    </span>
                    <span className="text-[0.72rem] text-gm line-through">{formatPrice(product.prix)}</span>
                  </span>
                ) : (
                  <>
                    {formatPrice(product.prix)}{' '}
                    <span className="text-[0.68rem] text-gm">TTC</span>
                  </>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
