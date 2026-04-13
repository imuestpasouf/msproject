import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MOCK_PRODUCTS, formatPrice } from '@/lib/mock-products'
import type { Product } from '@/lib/supabase/database.types'
import ProductGallery from '@/components/ProductGallery'

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function getProduct(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (data) return data
  } catch {
    /* fall through to mock */
  }
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null
}

async function getRelated(current: Product): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('actif', true)
      .neq('id', current.id)
      .limit(3)
    if (data && data.length > 0) return data
  } catch {
    /* fall through to mock */
  }
  return MOCK_PRODUCTS.filter((p) => p.id !== current.id).slice(0, 3)
}

function productImages(p: Product): string[] {
  return [p.photo_principale, p.photo_2, p.photo_3, p.photo_4, p.photo_5].filter(
    (url): url is string => !!url
  )
}

interface Spec { label: string; value: string }

function buildSpecs(p: Product): Spec[] {
  const pairs: [string, string | null][] = [
    ['Boîtier', p.boitier],
    ['Lunette', p.lunette],
    ['Cadran', p.cadran],
    ['Bracelet', p.bracelet],
    ['Mouvement', p.mouvement],
    ['Étanchéité', p.resistance],
  ]
  return pairs
    .filter(([, v]) => v !== null)
    .map(([l, v]) => ({ label: l, value: v as string }))
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

  return (
    <div className="pt-[80px] min-h-screen">
      {/* Breadcrumb */}
      <div className="px-12 py-5 text-[0.68rem] tracking-[0.12em] text-gm max-md:px-6">
        <Link href="/" className="text-gm no-underline hover:text-rg">Accueil</Link>
        <span className="mx-2">›</span>
        <Link href="/catalogue" className="text-gm no-underline hover:text-rg">Catalogue</Link>
        <span className="mx-2">›</span>
        <span>{product.nom}</span>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: '80vh' }}>
        {/* Gallery */}
        <ProductGallery images={images} name={product.nom} />

        {/* Info */}
        <div className="px-12 py-13 max-md:px-6 max-md:py-8">
          <div className="text-[0.66rem] tracking-[0.28em] uppercase text-rg mb-2">
            {product.collection}
          </div>
          <h1
            className="font-display font-light leading-[1.2] text-black mb-1.5"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}
          >
            {product.nom}
          </h1>
          <div className="text-[0.7rem] text-gm tracking-[0.1em] mb-5">
            Réf. {product.ref}
          </div>

          {product.mention && (
            <span
              className={[
                'inline-block text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-[5px] font-normal mb-5',
                mentionClass(product.mention),
              ].join(' ')}
            >
              {product.mention}
            </span>
          )}

          <div
            className="font-light tracking-[0.04em] mb-1.5"
            style={{ fontSize: '1.8rem' }}
          >
            {formatPrice(product.prix_reduc ?? product.prix)}
          </div>
          <div className="text-[0.72rem] text-gm mb-7">
            TTC · Paiement uniquement en boutique
          </div>

          <div className="h-[1px] bg-gl my-6" />

          {/* Specs */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              {specs.map((s) => (
                <div key={s.label}>
                  <div className="text-[0.62rem] tracking-[0.2em] uppercase text-gm mb-0.5">
                    {s.label}
                  </div>
                  <div className="text-[0.82rem] font-normal">{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="h-[1px] bg-gl my-6" />

          {/* Description */}
          {product.description && (
            <p className="text-[0.83rem] font-light leading-[1.8] text-gd mb-7">
              {product.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/commande?id=${product.id}`}
              className="block text-center text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-[30px] py-[17px] no-underline transition-colors duration-200 hover:bg-rg"
            >
              ✦ Commander ce modèle ✦
            </Link>
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

      {/* Related */}
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
                <div className="text-[0.92rem] font-normal tracking-[0.04em]">
                  {formatPrice(rel.prix_reduc ?? rel.prix)}{' '}
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
