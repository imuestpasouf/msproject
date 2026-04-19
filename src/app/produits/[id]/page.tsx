import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import type { Product } from '@/lib/supabase/database.types'
import ProductGallery from '@/components/ProductGallery'
import AddToCartButton from '@/components/ui/AddToCartButton'

function formatPrice(n: number) { return n.toLocaleString('fr-MA') + ' MAD' }

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function getProduct(id: string): Promise<Product | null> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('actif', true)
      .single()
    if (error) { console.error('[getProduct]', error); return null }
    if (data) return data as Product
  } catch (e) {
    console.error('[getProduct]', e)
    return null
  }
  return null
}

async function getRelated(current: Product): Promise<Product[]> {
  try {
    const supabase = createServiceClient()

    // Priority: same collection
    if (current.collection) {
      const { data: sameColl } = await supabase
        .from('products')
        .select('*')
        .eq('actif', true)
        .eq('collection', current.collection)
        .neq('id', current.id)
        .limit(3)
      if (sameColl && sameColl.length >= 3) return sameColl as Product[]

      if (sameColl && sameColl.length > 0) {
        const { data: others } = await supabase
          .from('products')
          .select('*')
          .eq('actif', true)
          .neq('id', current.id)
          .neq('collection', current.collection)
          .limit(3 - sameColl.length)
        return [...sameColl, ...(others ?? [])].slice(0, 3) as Product[]
      }
    }

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('actif', true)
      .neq('id', current.id)
      .limit(3)
    if (data && data.length > 0) return data as Product[]
  } catch (e) {
    console.error('[getRelated]', e)
    return []
  }
  return []
}

function productImages(p: Product): string[] {
  return [p.photo_principale, p.photo_2, p.photo_3, p.photo_4, p.photo_5].filter(
    (url): url is string => !!url
  )
}

interface Spec {
  label: string
  value: string | null
}

function buildSpecs(p: Product): Spec[] {
  return [
    { label: 'Taille du boîtier', value: p.boitier },
    { label: 'Matériau du boîtier', value: p.materiau },
    { label: 'Bracelet', value: p.bracelet },
    { label: 'Fermoir', value: p.fermoir },
    { label: 'Lunette', value: p.lunette },
    { label: 'Fond de boîtier', value: p.fond },
    { label: 'Cadran', value: p.cadran },
    { label: 'Aiguilles & index', value: p.aiguilles },
    { label: 'Verre', value: p.verre },
    { label: 'Mouvement', value: p.mouvement },
    { label: "Résistance à l'eau & poids", value: p.resistance },
    { label: 'Référence', value: p.ref },
    ...(p.sku ? [{ label: 'SKU', value: p.sku }] : []),
  ]
}

function mentionClass(mention: string | null): string {
  if (!mention) return ''
  if (mention === 'Nouveau' || mention === 'Premium') return 'bg-black text-white'
  return 'bg-rg text-white'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProduitPage(props: PageProps<'/produits/[id]'>) {
  const { id } = await props.params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelated(product)
  const images = productImages(product)
  const specs = buildSpecs(product)
  const hasReduc = !!product.reduction && !!product.prix_reduc

  return (
    <div className="pt-[80px] min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="px-12 py-5 text-[0.68rem] tracking-[0.12em] text-gm max-md:px-6">
        <Link href="/" className="text-gm no-underline hover:text-rg">Accueil</Link>
        <span className="mx-2">›</span>
        <Link href="/catalogue" className="text-gm no-underline hover:text-rg">Catalogue</Link>
        <span className="mx-2">›</span>
        <span>{product.nom}</span>
      </div>

      {/* ── Detail grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: '80vh' }}>

        {/* Gallery */}
        <ProductGallery images={images} name={product.nom} />

        {/* Info */}
        <div className="px-12 py-13 max-md:px-6 max-md:py-8">

          {/* Collection + name + ref */}
          <div className="text-[0.66rem] tracking-[0.28em] uppercase text-rg mb-2">
            {product.collection}
          </div>
          <h1
            className="font-display font-light leading-[1.2] text-black mb-1.5"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}
          >
            {product.nom}
          </h1>
          <div className="text-[0.7rem] text-gm tracking-[0.1em] mb-4">
            Réf. {product.ref}
          </div>

          {/* Mention badge */}
          {product.mention && (
            <span
              className={[
                'inline-block text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-[5px] font-normal mb-4',
                mentionClass(product.mention),
              ].join(' ')}
            >
              {product.mention}
            </span>
          )}

          {/* ── Prix ── */}
          {hasReduc ? (
            <div className="flex flex-wrap items-baseline gap-2.5 mb-1.5">
              <span className="font-light tracking-[0.04em]" style={{ fontSize: '1.8rem' }}>
                {formatPrice(product.prix_reduc!)}
              </span>
              <span className="text-gm line-through" style={{ fontSize: '1.1rem' }}>
                {formatPrice(product.prix)}
              </span>
              <span
                className="text-[0.6rem] tracking-[0.15em] uppercase px-2 py-1"
                style={{ background: 'rgba(201,149,108,0.1)', color: '#c9956c' }}
              >
                -{product.reduction}%
              </span>
            </div>
          ) : (
            <div className="font-light tracking-[0.04em] mb-1.5" style={{ fontSize: '1.8rem' }}>
              {formatPrice(product.prix)}
            </div>
          )}
          <div className="text-[0.72rem] text-gm mb-5">
            TTC · Paiement uniquement en boutique
          </div>

          {/* ── Stock ── */}
          {product.stock === 0 ? (
            <div
              className="inline-block text-[0.63rem] tracking-[0.18em] uppercase px-3 py-1.5 mb-5"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              Rupture de stock
            </div>
          ) : product.stock <= 3 ? (
            <div
              className="inline-block text-[0.63rem] tracking-[0.18em] uppercase px-3 py-1.5 mb-5"
              style={{ color: '#f97316', background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)' }}
            >
              Plus que {product.stock} en stock
            </div>
          ) : null}

          <div className="h-[1px] bg-gl my-6" />

          {/* ── Specs techniques ── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
            {specs.map((s) => (
              <div key={s.label}>
                <div className="text-[0.6rem] tracking-[0.2em] uppercase text-gm mb-0.5">
                  {s.label}
                </div>
                <div
                  className="text-[0.82rem] font-normal"
                  style={{ color: s.value ? '#0a0a0a' : 'rgba(154,149,144,0.5)' }}
                >
                  {s.value ?? '—'}
                </div>
              </div>
            ))}
          </div>

          <div className="h-[1px] bg-gl my-6" />

          {/* ── Description ── */}
          {product.description && (
            <p
              className="text-[0.83rem] font-light leading-[1.85] text-gd mb-7 italic pl-4"
              style={{ borderLeft: '2px solid #c9956c' }}
            >
              {product.description}
            </p>
          )}

          {/* ── Actions ── */}
          <div className="flex flex-col gap-3">
            {product.stock === 0 ? (
              <Link
                href={`/alerter?id=${product.id}`}
                className="block text-center text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-gd px-[30px] py-[17px] no-underline transition-colors duration-200 hover:bg-black"
              >
                🔔 M&apos;alerter quand disponible
              </Link>
            ) : (
              <AddToCartButton
                stock={product.stock}
                product={{
                  product_id: product.id,
                  nom: product.nom,
                  ref: product.ref,
                  collection: product.collection,
                  photo_principale: product.photo_principale,
                  prix: product.prix,
                  prix_reduc: product.prix_reduc,
                  reduction: product.reduction,
                  stock: product.stock,
                }}
              />
            )}
            <Link
              href="/catalogue"
              className="block text-center text-[0.72rem] tracking-[0.2em] uppercase font-light text-black border border-black px-[28px] py-[13px] no-underline transition-all duration-200 hover:bg-black hover:text-white"
            >
              ← Retour au catalogue
            </Link>
          </div>

          <p className="text-[0.7rem] text-gm text-center leading-[1.6] mt-2">
            📱 Confirmation par{' '}
            <strong className="text-rg">email &amp; WhatsApp</strong> · Retrait en
            boutique · Casablanca
          </p>
        </div>
      </div>

      {/* ── Vous aimerez aussi ── */}
      {related.length > 0 && (
        <div className="px-12 py-16 bg-off max-md:px-5 max-md:py-12">
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
            Vous aimerez aussi
          </p>
          <h2
            className="font-display font-light leading-[1.15] text-black mb-9"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Autres <em className="italic text-gm">modèles</em>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-md:gap-3">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/produits/${rel.id}`}
                className="block no-underline text-black cursor-pointer group transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-square bg-off overflow-hidden mb-3.5">
                  {rel.photo_principale ? (
                    <Image
                      src={rel.photo_principale}
                      alt={rel.nom}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gl" />
                  )}
                </div>
                <div className="text-[0.62rem] tracking-[0.2em] uppercase text-rg mb-1">
                  {rel.collection}
                </div>
                <div className="font-display text-[1.1rem] font-normal mb-0.5">
                  {rel.nom}
                </div>
                <div className="text-[0.65rem] text-gm tracking-[0.08em] mb-2">
                  Réf. {rel.ref}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[0.92rem] font-normal tracking-[0.04em]">
                    {formatPrice(rel.prix_reduc ?? rel.prix)}
                  </span>
                  {rel.prix_reduc && (
                    <span className="text-[0.7rem] text-gm line-through">
                      {formatPrice(rel.prix)}
                    </span>
                  )}
                  <span className="text-[0.68rem] text-gm">TTC</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
