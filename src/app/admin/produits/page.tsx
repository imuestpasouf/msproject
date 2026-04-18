'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/supabase/database.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString('fr-MA') + ' MAD'
}

const MENTION_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  populaire: 'Populaire',
  bestseller: 'Bestseller',
  premium: 'Premium',
  finserie: 'Fin de série',
  limitee: 'Limitée',
  exclusivite: 'Exclusivité',
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  const color =
    stock === 0
      ? 'rgba(239,68,68,0.8)'
      : stock <= 3
      ? 'rgba(234,179,8,0.8)'
      : 'rgba(34,197,94,0.7)'
  return (
    <span
      className="text-[0.65rem] font-medium px-2 py-0.5"
      style={{ color, border: `1px solid ${color}` }}
    >
      {stock}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/produits')
      const data = await res.json()
      if (res.ok) setProducts(data.products ?? [])
      else setError(data.error ?? 'Erreur chargement')
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleActif(product: Product) {
    setTogglingId(product.id)
    try {
      const res = await fetch(`/api/admin/produits/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !product.actif }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, actif: !p.actif } : p))
        )
      }
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>

      {/* ── Admin header ───────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-[250] flex items-center gap-5 px-8 py-3 border-b"
        style={{ background: 'rgba(10,10,10,0.97)', borderColor: 'rgba(58,55,51,0.5)', backdropFilter: 'blur(8px)' }}
      >
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] uppercase no-underline transition-colors duration-200 hover:text-white"
          style={{ color: 'rgba(154,149,144,0.8)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour au dashboard
        </Link>
        <span style={{ color: 'rgba(58,55,51,0.8)' }}>|</span>
        <nav className="flex items-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase">
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</span>
          <span style={{ color: 'rgba(58,55,51,0.8)' }}>›</span>
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>Produits</span>
        </nav>

        <Link
          href="/admin/produits/nouveau"
          className="ml-auto flex items-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase px-4 py-2 transition-colors duration-200 no-underline"
          style={{ background: 'var(--color-rg)', color: '#0a0a0a' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouveau produit
        </Link>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="px-8 py-8 max-md:px-4">

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-rg border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-[0.8rem] text-red-400">{error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-[0.8rem] text-white/30 mb-4">Aucun produit enregistré.</p>
            <Link href="/admin/produits/nouveau" className="text-[0.7rem] tracking-[0.18em] uppercase text-rg no-underline hover:underline">
              Créer le premier produit →
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(58,55,51,0.5)' }}>
                  {['Photo', 'Nom / Réf', 'Collection', 'Prix', 'Stock', 'Mention', 'Ordre', 'Statut', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[0.6rem] tracking-[0.2em] uppercase pb-3 pr-4 font-normal"
                      style={{ color: 'rgba(154,149,144,0.7)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b transition-colors duration-150 hover:bg-white/2"
                    style={{ borderColor: 'rgba(58,55,51,0.3)' }}
                  >
                    {/* Photo */}
                    <td className="py-3 pr-4 w-12">
                      {p.photo_principale ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.photo_principale}
                          alt={p.nom}
                          className="w-10 h-10 object-cover"
                          style={{ filter: p.actif ? 'none' : 'grayscale(1) opacity(0.4)' }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(255,255,255,0.2)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                    </td>

                    {/* Nom / Réf */}
                    <td className="py-3 pr-4">
                      <p className="text-[0.8rem] text-white font-light">{p.nom}</p>
                      <p className="text-[0.65rem] mt-0.5" style={{ color: 'rgba(154,149,144,0.7)' }}>{p.ref}</p>
                    </td>

                    {/* Collection */}
                    <td className="py-3 pr-4">
                      <span className="text-[0.65rem] tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {p.collection ?? '—'}
                      </span>
                    </td>

                    {/* Prix */}
                    <td className="py-3 pr-4">
                      {p.prix_reduc ? (
                        <div>
                          <span className="text-[0.75rem] font-light" style={{ color: 'var(--color-rgl)' }}>
                            {formatPrice(p.prix_reduc)}
                          </span>
                          <span
                            className="ml-2 text-[0.65rem] line-through"
                            style={{ color: 'rgba(154,149,144,0.5)' }}
                          >
                            {formatPrice(p.prix)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[0.75rem] text-white font-light">{formatPrice(p.prix)}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 pr-4">
                      <StockBadge stock={p.stock} />
                    </td>

                    {/* Mention */}
                    <td className="py-3 pr-4">
                      {p.mention ? (
                        <span
                          className="text-[0.6rem] tracking-[0.12em] uppercase px-2 py-0.5"
                          style={{ color: 'rgba(232,196,168,0.8)', border: '1px solid rgba(232,196,168,0.25)' }}
                        >
                          {MENTION_LABELS[p.mention] ?? p.mention}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                      )}
                    </td>

                    {/* Ordre */}
                    <td className="py-3 pr-4">
                      <span className="text-[0.75rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {p.ordre ?? '—'}
                      </span>
                    </td>

                    {/* Statut toggle */}
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => toggleActif(p)}
                        disabled={togglingId === p.id}
                        className="relative flex items-center gap-2 group disabled:opacity-50"
                        aria-label={p.actif ? 'Désactiver' : 'Activer'}
                      >
                        <span
                          className={[
                            'relative w-8 h-4 rounded-full transition-colors duration-200',
                            p.actif ? 'bg-rg' : 'bg-white/15',
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200',
                              p.actif ? 'translate-x-4' : 'translate-x-0.5',
                            ].join(' ')}
                          />
                        </span>
                        <span
                          className="text-[0.6rem] tracking-[0.1em] uppercase"
                          style={{ color: p.actif ? 'rgba(201,149,108,0.8)' : 'rgba(154,149,144,0.5)' }}
                        >
                          {p.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3">
                      <Link
                        href={`/admin/produits/${p.id}`}
                        className="text-[0.65rem] tracking-[0.15em] uppercase px-3 py-1.5 border no-underline transition-colors duration-200 hover:border-rg hover:text-rg"
                        style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
