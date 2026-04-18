'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import ProductForm from '@/components/admin/ProductForm'
import type { Product } from '@/lib/supabase/database.types'

export default function EditProduitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/produits/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) setProduct(data.product)
        else setError(data.error ?? 'Produit introuvable')
      })
      .catch(() => setError('Erreur de connexion'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>

      {/* ── Admin header ─────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-[250] flex items-center gap-5 px-8 py-3 border-b"
        style={{ background: 'rgba(10,10,10,0.97)', borderColor: 'rgba(58,55,51,0.5)', backdropFilter: 'blur(8px)' }}
      >
        <Link
          href="/admin/produits"
          className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] uppercase no-underline transition-colors duration-200 hover:text-white"
          style={{ color: 'rgba(154,149,144,0.8)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour aux produits
        </Link>
        <span style={{ color: 'rgba(58,55,51,0.8)' }}>|</span>
        <nav className="flex items-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase">
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</span>
          <span style={{ color: 'rgba(58,55,51,0.8)' }}>›</span>
          <Link href="/admin/produits" className="no-underline transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Produits
          </Link>
          <span style={{ color: 'rgba(58,55,51,0.8)' }}>›</span>
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>
            {product ? product.nom : 'Modifier'}
          </span>
        </nav>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="px-8 py-8 max-w-4xl max-md:px-4">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-rg border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-[0.8rem] text-red-400">{error}</div>
        )}

        {!loading && product && (
          <>
            <h1
              className="font-display font-light text-white mb-2"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
            >
              {product.nom}
            </h1>
            <p className="text-[0.65rem] tracking-[0.15em] uppercase mb-8" style={{ color: 'rgba(154,149,144,0.6)' }}>
              Réf. {product.ref}
            </p>
            <ProductForm mode="edit" initialData={product} />
          </>
        )}
      </div>
    </div>
  )
}
