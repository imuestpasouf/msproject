import Link from 'next/link'
import ProductForm from '@/components/admin/ProductForm'

export default function NouveauProduitPage() {
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
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>Nouveau</span>
        </nav>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────── */}
      <div className="px-8 py-8 max-w-4xl max-md:px-4">
        <h1
          className="font-display font-light text-white mb-8"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
        >
          Nouveau produit
        </h1>
        <ProductForm mode="create" />
      </div>
    </div>
  )
}
