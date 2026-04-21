import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import HomeCatalogueSection from '@/components/HomeCatalogueSection'
import { getDictionary, isLocale } from '@/lib/i18n'
import type { Locale, Dict } from '@/lib/i18n'
import type { Product, SiteImage } from '@/lib/supabase/database.types'

type SiteImageKey = 'hero' | 'life1' | 'life2' | 'life3' | 'life4'
type SiteImages = Record<SiteImageKey, string>
const PLACEHOLDERS: SiteImages = { hero: '', life1: '', life2: '', life3: '', life4: '' }

async function getSiteImages(): Promise<SiteImages> {
  try {
    const { data } = await createServiceClient().from('site_images').select('*')
    const result: SiteImages = { ...PLACEHOLDERS }
    for (const row of (data as SiteImage[] | null) ?? []) {
      if (row.cle in result) result[row.cle as SiteImageKey] = row.url
    }
    return result
  } catch { return { ...PLACEHOLDERS } }
}

async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await createServiceClient()
      .from('products').select('*').eq('actif', true).order('ordre', { ascending: true })
    if (error || !data) return []
    return data as Product[]
  } catch { return [] }
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection({ image, lang, t }: { image: string; lang: Locale; t: Dict }) {
  return (
    <section id="hero" className="relative h-screen flex items-end overflow-hidden bg-black">
      <div
        className="absolute inset-0 anim-hero-bg"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%), url("${image}") center / cover no-repeat`,
          backgroundColor: '#1a1a1a',
        }}
      />
      <div className="relative z-10 px-12 pb-16 max-w-[640px] anim-fade-up max-md:px-5 max-md:pb-12">
        <p className="text-[0.68rem] tracking-[0.3em] uppercase font-light mb-3.5" style={{ color: 'var(--color-rgl)' }}>
          {t.hero.tagline}
        </p>
        <h1 className="font-display font-light leading-[1.05] text-white mb-[18px]" style={{ fontSize: 'clamp(2.8rem, 6vw, 5.2rem)' }}>
          {t.hero.h1_1}<br />
          <em className="italic" style={{ color: 'var(--color-rgl)' }}>{t.hero.h1_em}</em>
        </h1>
        <p className="text-[0.83rem] font-light tracking-[0.05em] leading-[1.7] mb-8 max-w-[400px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {t.hero.desc}
        </p>
        <div className="flex gap-3.5 items-center flex-wrap">
          <Link href={`/${lang}#catalogue`} className="inline-block text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-[30px] py-[14px] no-underline transition-colors duration-200 hover:bg-rg">
            {t.hero.cta_discover}
          </Link>
          <Link href={`/${lang}#process`} className="text-[0.72rem] tracking-[0.2em] uppercase font-light text-white no-underline pb-[2px] transition-colors duration-200 hover:text-rgl" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
            {t.hero.cta_how}
          </Link>
        </div>
      </div>
      <div className="absolute bottom-8 right-[52px] hidden md:flex flex-col items-center gap-2 anim-fade-up-late" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <div className="w-[1px] h-12 anim-scroll-pulse" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)' }} />
        <span className="text-[0.62rem] tracking-[0.25em] uppercase">{t.hero.scroll}</span>
      </div>
    </section>
  )
}

function BrandStrip({ t }: { t: Dict }) {
  return (
    <div className="bg-black px-12 py-[14px] flex gap-12 items-center overflow-x-auto no-scrollbar">
      {t.brand_items.map((item) => (
        <div key={item} className="flex items-center gap-2.5 whitespace-nowrap text-[0.68rem] tracking-[0.18em] uppercase font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <div className="w-1 h-1 rounded-full flex-shrink-0 bg-rg" />
          {item}
        </div>
      ))}
    </div>
  )
}

function CollectionsSection({ products, lang, t }: { products: Product[]; lang: Locale; t: Dict }) {
  const featured = products.slice(0, 4)
  const cs = t.collections_section
  const cards = [
    { href: `/${lang}/produits/${featured[0]?.id ?? 'mock-0'}`, badge: cs.badge_phare, name: 'Polycarbon', sub: cs.cards.polycarbon_sub, span: true, photo: featured[0]?.photo_principale ?? null },
    { href: `/${lang}/produits/${featured[2]?.id ?? 'mock-2'}`, badge: cs.badge_bestseller, name: 'Ultra Thin', sub: cs.cards.ultrathin_sub, photo: featured[2]?.photo_principale ?? null },
    { href: `/${lang}/produits/${featured[3]?.id ?? 'mock-3'}`, badge: cs.badge_premium, name: 'Skeleton', sub: cs.cards.skeleton_sub, photo: featured[3]?.photo_principale ?? null },
  ]

  return (
    <section id="collections" className="bg-off px-12 py-[88px] max-md:px-5 max-md:py-16">
      <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
        <div>
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">{cs.tagline}</p>
          <h2 className="font-display font-light leading-[1.15] text-black" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {cs.title_plain} <em className="italic text-gm">{cs.title_em}</em>
          </h2>
        </div>
        <Link href={`/${lang}/catalogue`} className="text-[0.72rem] tracking-[0.18em] uppercase text-black no-underline pb-[2px] border-b border-black">
          {cs.see_all}
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
        {cards.map((card, i) => (
          <Link key={card.href + i} href={card.href}
            className={['relative overflow-hidden cursor-pointer bg-gl no-underline group', card.span ? 'col-span-2 max-md:col-span-1' : '', 'aspect-[16/9] max-md:aspect-[4/3]'].join(' ')}>
            {card.photo ? (
              <Image src={card.photo} alt={card.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes={card.span ? '66vw' : '33vw'} />
            ) : (
              <div className="w-full h-full bg-gl transition-transform duration-700 group-hover:scale-105" />
            )}
            <span className="absolute top-4 left-4 text-[0.6rem] tracking-[0.18em] uppercase px-2.5 py-1 text-black" style={{ background: 'rgba(250,250,250,0.92)' }}>{card.badge}</span>
            <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }}>
              <div>
                <div className="font-display text-[1.5rem] font-light text-white">{card.name}</div>
                <div className="text-[0.68rem] tracking-[0.15em] uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{card.sub}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function LifestyleSection({ images, t }: { images: SiteImages; t: Dict }) {
  return (
    <section id="lifestyle" className="bg-black py-[88px] overflow-hidden">
      <div className="px-12 mb-11 flex justify-between items-end flex-wrap gap-4 max-md:px-5">
        <div>
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">{t.lifestyle.tagline}</p>
          <h2 className="font-display font-light leading-[1.15] text-white" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {t.lifestyle.title_plain} <em className="italic" style={{ color: 'var(--color-rgl)' }}>{t.lifestyle.title_em}</em>
          </h2>
        </div>
        <a href="https://www.instagram.com/mamontre.ma.officiel?igsh=cnQ2ZWF1Z25kNGJ2" target="_blank" rel="noopener noreferrer"
          className="text-[0.72rem] tracking-[0.18em] uppercase no-underline pb-[2px]"
          style={{ color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.25)' }}>
          @mamontre.ma
        </a>
      </div>
      <div className="flex gap-[2px]">
        {(['life1', 'life2', 'life3', 'life4'] as const).map((key) => (
          <div key={key} className="relative flex-none bg-gd transition-all duration-500 hover:flex-[0_0_35%]" style={{ flex: '0 0 25%', height: '320px', filter: 'grayscale(15%)' }}>
            {images[key] && <Image src={images[key]} alt="" fill className="object-cover" sizes="25vw" />}
          </div>
        ))}
      </div>
    </section>
  )
}

function ProcessSection({ t }: { t: Dict }) {
  return (
    <section id="process" className="bg-off px-12 py-[88px] max-md:px-5 max-md:py-16">
      <div className="text-center max-w-[520px] mx-auto mb-13">
        <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">{t.process.tagline}</p>
        <h2 className="font-display font-light leading-[1.15] text-black mb-2.5" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          {t.process.title_plain} <em className="italic text-gm">{t.process.title_em}</em>
        </h2>
        <p className="text-[0.83rem] text-gd font-light leading-[1.7] mt-2.5">{t.process.desc}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
        {t.process.steps.map((step, i) => (
          <div key={i} className="relative bg-white px-7 py-9">
            <div className="absolute top-[18px] right-[18px] w-[7px] h-[7px] rounded-full bg-rg" />
            <div className="font-display text-[3.5rem] font-light leading-none mb-4 text-gl">0{i + 1}</div>
            <div className="text-[1.5rem] mb-3.5">{['🔍', '📝', '📦'][i]}</div>
            <div className="font-display text-[1.2rem] font-normal mb-2">{step.title}</div>
            <p className="text-[0.78rem] font-light leading-[1.7] text-gd">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const [products, siteImages, dict] = await Promise.all([
    getProducts(),
    getSiteImages(),
    getDictionary(lang as Locale),
  ])

  return (
    <>
      <HeroSection image={siteImages.hero} lang={lang as Locale} t={dict} />
      <BrandStrip t={dict} />
      <CollectionsSection products={products} lang={lang as Locale} t={dict} />
      <HomeCatalogueSection products={products} />
      <LifestyleSection images={siteImages} t={dict} />
      <ProcessSection t={dict} />
    </>
  )
}
