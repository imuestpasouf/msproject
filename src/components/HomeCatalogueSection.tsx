'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase/database.types'
import { useLocale } from '@/context/LocaleContext'

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

export default function HomeCatalogueSection({ products }: { products: Product[] }) {
  const [active, setActive] = useState('all')
  const { lang, t } = useLocale()
  const cs = t.catalogue_section

  const FILTERS = [
    { key: 'all', label: cs.all },
    { key: 'polycarbon', label: 'Polycarbon' },
    { key: 'ultrathin', label: 'Ultra Thin' },
    { key: 'skeleton', label: 'Skeleton' },
  ]

  const visible = products.filter((p) => {
    if (active === 'all') return true
    const key = COLLECTION_FILTER[p.collection ?? ''] ?? p.collection?.toLowerCase()
    return key === active
  })

  return (
    <section id="catalogue" className="px-12 py-[88px] max-md:px-5 max-md:py-16">
      <div className="flex justify-between items-end mb-11 flex-wrap gap-4">
        <div>
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">{cs.available_now}</p>
          <h2 className="font-display font-light leading-[1.15] text-black mb-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {cs.title_plain}{cs.title_plain ? ' ' : ''}<em className="italic text-gm">{cs.title_em}</em>
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setActive(f.key)}
              className={['text-[0.68rem] tracking-[0.14em] uppercase font-normal px-4 py-2 border transition-all duration-200 cursor-pointer font-body',
                active === f.key ? 'bg-black text-white border-black' : 'bg-transparent text-gd border-gl hover:bg-black hover:text-white hover:border-black'].join(' ')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-md:gap-3.5">
        {visible.map((product) => (
          <Link key={product.id} href={`/${lang}/produits/${product.id}`}
            className={['block no-underline text-black cursor-pointer group transition-transform duration-300 hover:-translate-y-1', product.stock === 0 ? 'opacity-60' : ''].join(' ')}>
            <div className="relative aspect-square bg-off overflow-hidden mb-3.5">
              {product.photo_principale ? (
                <Image src={product.photo_principale} alt={product.nom} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" sizes="(max-width: 768px) 50vw, 25vw" />
              ) : <div className="w-full h-full bg-gl transition-transform duration-500 group-hover:scale-[1.06]" />}

              {product.mention && product.stock > 0 && (
                <span className={['absolute top-2.5 left-2.5 text-[0.58rem] tracking-[0.14em] uppercase px-2 py-1 font-normal', mentionStyle(product.mention)].join(' ')}>
                  {product.mention}
                </span>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
                  <span className="text-[0.62rem] tracking-[0.2em] uppercase text-white px-3 py-1.5 border border-white/60">
                    {cs.out_of_stock}
                  </span>
                </div>
              )}

              {product.stock > 0 && product.stock <= 2 && (
                <span className="absolute top-2.5 right-2.5 text-[0.58rem] tracking-[0.14em] uppercase px-2 py-1 font-normal"
                  style={{ color: '#f97316', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.35)' }}>
                  {cs.low_stock.replace('{n}', String(product.stock))}
                </span>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-center py-3 text-[0.68rem] tracking-[0.16em] uppercase translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                {cs.quick_view}
              </div>
            </div>

            <div className="text-[0.62rem] tracking-[0.2em] uppercase text-rg mb-1">{product.collection}</div>
            <div className="font-display text-[1.1rem] font-normal mb-0.5">{product.nom}</div>
            <div className="text-[0.65rem] text-gm tracking-[0.08em] mb-2">Réf. {product.ref}</div>
            <div className="text-[0.92rem] font-normal tracking-[0.04em]">
              {formatPrice(product.prix_reduc ?? product.prix)}{' '}
              <span className="text-[0.68rem] text-gm">TTC</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
