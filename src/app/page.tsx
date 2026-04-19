import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/service'
import HomeCatalogueSection from '@/components/HomeCatalogueSection'
import type { Product, SiteImage } from '@/lib/supabase/database.types'

// ─── Data fetching ────────────────────────────────────────────────────────────

type SiteImageKey = 'hero' | 'life1' | 'life2' | 'life3' | 'life4'
type SiteImages = Record<SiteImageKey, string>

const PLACEHOLDERS: SiteImages = { hero: '', life1: '', life2: '', life3: '', life4: '' }

async function getSiteImages(): Promise<SiteImages> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('site_images').select('*')
    const result: SiteImages = { ...PLACEHOLDERS }
    for (const row of (data as SiteImage[] | null) ?? []) {
      if (row.cle in result) result[row.cle as SiteImageKey] = row.url
    }
    return result
  } catch (e) {
    console.error('[getSiteImages]', e)
    return { ...PLACEHOLDERS }
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('actif', true)
      .order('ordre', { ascending: true })
    if (error) { console.error('[getProducts]', error); return [] }
    if (!data) return []
    return data as Product[]
  } catch (e) {
    console.error('[getProducts]', e)
    return []
  }
}

// ─── Section: Hero ────────────────────────────────────────────────────────────

function HeroSection({ image }: { image: string }) {
  return (
    <section
      id="hero"
      className="relative h-screen flex items-end overflow-hidden bg-black"
    >
      {/* Animated background */}
      <div
        className="absolute inset-0 anim-hero-bg"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%), url("${image}") center / cover no-repeat`,
          backgroundColor: '#1a1a1a',
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-12 pb-16 max-w-[640px] anim-fade-up max-md:px-5 max-md:pb-12">
        <p className="text-[0.68rem] tracking-[0.3em] uppercase font-light mb-3.5"
           style={{ color: 'var(--color-rgl)' }}>
          Design Milanais · Disponible au Maroc
        </p>

        <h1
          className="font-display font-light leading-[1.05] text-white mb-[18px]"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5.2rem)' }}
        >
          L&apos;heure selon<br />
          <em className="italic" style={{ color: 'var(--color-rgl)' }}>Milan.</em>
        </h1>

        <p className="text-[0.83rem] font-light tracking-[0.05em] leading-[1.7] mb-8 max-w-[400px]"
           style={{ color: 'rgba(255,255,255,0.7)' }}>
          Des montres au design octogonal épuré, nées à Milan. Disponibles en exclusivité au Maroc.
        </p>

        <div className="flex gap-3.5 items-center flex-wrap">
          <Link
            href="#catalogue"
            className="inline-block text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-[30px] py-[14px] no-underline transition-colors duration-200 hover:bg-rg"
          >
            Découvrir la collection
          </Link>
          <Link
            href="#process"
            className="text-[0.72rem] tracking-[0.2em] uppercase font-light text-white no-underline pb-[2px] transition-colors duration-200 hover:text-rgl"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}
          >
            Comment commander ?
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-[52px] hidden md:flex flex-col items-center gap-2 anim-fade-up-late"
           style={{ color: 'rgba(255,255,255,0.4)' }}>
        <div
          className="w-[1px] h-12 anim-scroll-pulse"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)' }}
        />
        <span className="text-[0.62rem] tracking-[0.25em] uppercase">Défiler</span>
      </div>
    </section>
  )
}

// ─── Section: Brand strip ─────────────────────────────────────────────────────

function BrandStrip() {
  const items = [
    'Montres italiennes prenium',
    'Payement differé jusque 4X',
    'Payement à la livraison',
    'Garantie officielle',
    'Livraison nationale bientôt',
  ]

  return (
    <div className="bg-black px-12 py-[14px] flex gap-12 items-center overflow-x-auto no-scrollbar">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2.5 whitespace-nowrap text-[0.68rem] tracking-[0.18em] uppercase font-light"
             style={{ color: 'rgba(255,255,255,0.5)' }}>
          <div className="w-1 h-1 rounded-full flex-shrink-0 bg-rg" />
          {item}
        </div>
      ))}
    </div>
  )
}

// ─── Section: Collections ─────────────────────────────────────────────────────

interface CollectionCard {
  href: string
  badge: string
  name: string
  sub: string
  span?: boolean
  photo: string | null
}

function CollectionsSection({ products }: { products: Product[] }) {
  const featured = products.slice(0, 3)

  const cards: CollectionCard[] = [
    {
      href: `/produits/${featured[0]?.id ?? 'mock-0'}`,
      badge: 'Phare',
      name: 'Polycarbon',
      sub: 'Boîtier octogonal · Caoutchouc',
      span: true,
      photo: featured[0]?.photo_principale ?? null,
    },
    {
      href: `/produits/${featured[2]?.id ?? 'mock-2'}`,
      badge: 'Bestseller',
      name: 'Ultra Thin',
      sub: 'Finesse extrême · Cuir',
      photo: featured[2]?.photo_principale ?? null,
    },
    {
      href: `/produits/${featured[3]?.id ?? 'mock-3'}`,
      badge: 'Premium',
      name: 'Skeleton',
      sub: 'Mécanisme apparent',
      photo: products[3]?.photo_principale ?? null,
    },
  ]

  return (
    <section id="collections" className="bg-off px-12 py-[88px] max-md:px-5 max-md:py-16">
      {/* Header */}
      <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
        <div>
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
            Nos lignes
          </p>
          <h2 className="font-display font-light leading-[1.15] text-black"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            Les <em className="italic text-gm">Collections</em>
          </h2>
        </div>
        <Link
          href="/catalogue"
          className="text-[0.72rem] tracking-[0.18em] uppercase text-black no-underline pb-[2px] border-b border-black"
        >
          Tout voir
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
        {cards.map((card, i) => (
          <Link
            key={card.href + i}
            href={card.href}
            className={[
              'relative overflow-hidden cursor-pointer bg-gl no-underline group',
              card.span ? 'col-span-2 max-md:col-span-1' : '',
              card.span ? 'aspect-[16/9] max-md:aspect-[3/4]' : 'aspect-[3/4]',
            ].join(' ')}
          >
            {/* Image or grey placeholder */}
            {card.photo ? (
              <Image
                src={card.photo}
                alt={card.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes={card.span ? '100vw' : '50vw'}
              />
            ) : (
              <div className="w-full h-full bg-gl transition-transform duration-700 group-hover:scale-105" />
            )}

            {/* Badge */}
            <span className="absolute top-4 left-4 text-[0.6rem] tracking-[0.18em] uppercase px-2.5 py-1 text-black"
                  style={{ background: 'rgba(250,250,250,0.92)' }}>
              {card.badge}
            </span>

            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                 style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }}>
              <div>
                <div className="font-display text-[1.5rem] font-light text-white">{card.name}</div>
                <div className="text-[0.68rem] tracking-[0.15em] uppercase mt-0.5"
                     style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {card.sub}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Section: Lifestyle ───────────────────────────────────────────────────────

function LifestyleSection({ images }: { images: SiteImages }) {
  return (
    <section id="lifestyle" className="bg-black py-[88px] overflow-hidden">
      <div className="px-12 mb-11 flex justify-between items-end flex-wrap gap-4 max-md:px-5">
        <div>
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
            La communauté
          </p>
          <h2 className="font-display font-light leading-[1.15] text-white"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            Portez <em className="italic" style={{ color: 'var(--color-rgl)' }}>l&apos;instant.</em>
          </h2>
        </div>
        <a
          href="#"
          className="text-[0.72rem] tracking-[0.18em] uppercase no-underline pb-[2px]"
          style={{ color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.25)' }}
        >
          @d1milano.ma
        </a>
      </div>

      {/* Image strip */}
      <div className="flex gap-[2px]">
        {(['life1', 'life2', 'life3', 'life4'] as const).map((key) => (
          <div
            key={key}
            className="relative flex-none bg-gd transition-all duration-500 hover:flex-[0_0_35%]"
            style={{ flex: '0 0 25%', height: '320px', filter: 'grayscale(15%)' }}
          >
            {images[key] && (
              <Image
                src={images[key]}
                alt=""
                fill
                className="object-cover"
                sizes="25vw"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section: Process ─────────────────────────────────────────────────────────

function ProcessSection() {
  const steps = [
    {
      num: '01',
      icon: '🔍',
      title: 'Choisissez votre montre',
      desc: 'Parcourez le catalogue, cliquez sur le modèle qui vous correspond.',
    },
    {
      num: '02',
      icon: '📝',
      title: 'Passez votre commande',
      desc: 'Remplissez le formulaire : nom, téléphone, email. Confirmation immédiate par email & WhatsApp.',
    },
    {
      num: '03',
      icon: '🏪',
      title: 'Retirez en boutique',
      desc: 'On vous contacte quand votre montre est prête. Venez la récupérer et payez sur place.',
    },
  ]

  return (
    <section id="process" className="bg-off px-12 py-[88px] max-md:px-5 max-md:py-16">
      {/* Center header */}
      <div className="text-center max-w-[520px] mx-auto mb-13">
        <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
          Simple & rapide
        </p>
        <h2 className="font-display font-light leading-[1.15] text-black mb-2.5"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          Comment <em className="italic text-gm">commander ?</em>
        </h2>
        <p className="text-[0.83rem] text-gd font-light leading-[1.7] mt-2.5">
          Pas de paiement en ligne. Réservez votre montre, nous vous confirmons la disponibilité,
          vous la récupérez en boutique.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
        {steps.map((step) => (
          <div key={step.num} className="relative bg-white px-7 py-9">
            {/* Red dot */}
            <div className="absolute top-[18px] right-[18px] w-[7px] h-[7px] rounded-full bg-rg" />

            <div className="font-display text-[3.5rem] font-light leading-none mb-4 text-gl">
              {step.num}
            </div>
            <div className="text-[1.5rem] mb-3.5">{step.icon}</div>
            <div className="font-display text-[1.2rem] font-normal mb-2">
              {step.title}
            </div>
            <p className="text-[0.78rem] font-light leading-[1.7] text-gd">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [products, siteImages] = await Promise.all([getProducts(), getSiteImages()])

  return (
    <>
      <HeroSection image={siteImages.hero} />
      <BrandStrip />
      <CollectionsSection products={products} />
      <HomeCatalogueSection products={products} />
      <LifestyleSection images={siteImages} />
      <ProcessSection />
    </>
  )
}
