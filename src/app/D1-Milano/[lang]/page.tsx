import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import HomeCatalogueSection from '@/components/HomeCatalogueSection'
import HeroVideo from '@/components/HeroVideo'
import HeroIntro from '@/components/motion/HeroIntro'
import Reveal from '@/components/motion/Reveal'
import StatsStrip from '@/components/motion/StatsStrip'
import ParallaxLayer from '@/components/motion/ParallaxLayer'
import ProcessMotion from '@/components/motion/ProcessMotion'
import SpotlightChapter from '@/components/SpotlightChapter'
import ChapterNav from '@/components/motion/ChapterNav'
import ImagePlaceholder from '@/components/ui/ImagePlaceholder'
import { getDictionary, isLocale } from '@/lib/i18n'
import type { Locale, Dict } from '@/lib/i18n'
import type { Product, SiteImage } from '@/lib/supabase/database.types'

const BRAND_BASE = '/D1-Milano'

type SiteImageKey = 'hero' | 'life1' | 'life2' | 'life3' | 'life4' | 'spotlight'
type SiteImages = Record<SiteImageKey, string>
const PLACEHOLDERS: SiteImages = { hero: '', life1: '', life2: '', life3: '', life4: '', spotlight: '' }

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

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url) || url.includes('/video/upload/')
}


function HeroSection({ image, base, t }: { image: string; base: string; t: Dict }) {
  const isVideo = image && isVideoUrl(image)

  return (
    <section id="hero" className="relative h-screen flex items-end overflow-hidden bg-black">
      {isVideo ? (
        <>
          <HeroVideo src={image} />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%)' }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 anim-hero-bg"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%), url("${image}") center / cover no-repeat`,
            backgroundColor: '#1a1a1a',
          }}
        />
      )}
      <HeroIntro base={base} t={t} />
      <div className="absolute bottom-8 right-[52px] hidden md:flex flex-col items-center gap-2 anim-fade-up-late" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <div className="w-[1px] h-12 anim-scroll-pulse" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)' }} />
        <span className="text-[0.62rem] tracking-[0.25em] uppercase">{t.hero.scroll}</span>
      </div>
    </section>
  )
}

function BrandStrip({ t }: { t: Dict }) {
  return (
    <Reveal y={0} duration={0.8} className="bg-black px-12 py-[14px] flex gap-12 items-center overflow-x-auto no-scrollbar">
      {t.brand_items.map((item) => (
        <div key={item} className="flex items-center gap-2.5 whitespace-nowrap text-[0.68rem] tracking-[0.18em] uppercase font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <div className="w-1 h-1 rounded-full flex-shrink-0 bg-rg" />
          {item}
        </div>
      ))}
    </Reveal>
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
        <a href="https://www.instagram.com/ms.store.d1milano" target="_blank" rel="noopener noreferrer"
          className="text-[0.72rem] tracking-[0.18em] uppercase no-underline pb-[2px]"
          style={{ color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.25)' }}>
          @mamontre.ma
        </a>
      </div>
      <div className="flex gap-[2px]">
        {(['life1', 'life2', 'life3', 'life4'] as const).map((key, i) => (
          <Reveal
            key={key}
            y={70}
            delay={i * 0.15}
            className="relative flex-none overflow-hidden bg-gd transition-all duration-500 hover:flex-[0_0_35%]"
            style={{ flex: '0 0 25%', height: '320px', filter: 'grayscale(15%)' }}
          >
            {images[key] ? (
              <ParallaxLayer speed={[0.85, 1.2, 0.9, 1.15][i]} className="absolute inset-0">
                <Image src={images[key]} alt="" fill className="object-cover" sizes="25vw" />
              </ParallaxLayer>
            ) : (
              <ImagePlaceholder label={t.common.missing_image} dark />
            )}
          </Reveal>
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
      <ProcessMotion steps={t.process.steps} />
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const base = `${BRAND_BASE}/${lang}`
  const [products, siteImages, dict] = await Promise.all([
    getProducts(),
    getSiteImages(),
    getDictionary(lang as Locale),
  ])

  const chapters = [
    { id: 'hero', label: dict.chapter_nav.home },
    { id: 'savoir-faire', label: dict.chapter_nav.craft },
    { id: 'catalogue', label: dict.chapter_nav.collection },
    { id: 'lifestyle', label: dict.chapter_nav.community },
    { id: 'process', label: dict.chapter_nav.order },
  ]

  return (
    <>
      <ChapterNav chapters={chapters} />
      <HeroSection image={siteImages.hero} base={base} t={dict} />
      <BrandStrip t={dict} />
      <StatsStrip stats={dict.stats} />
      <SpotlightChapter image={siteImages.spotlight || siteImages.life1} chapter={dict.spotlight} missingImageLabel={dict.common.missing_image} />
      <HomeCatalogueSection products={products} />
      <LifestyleSection images={siteImages} t={dict} />
      <ProcessSection t={dict} />
    </>
  )
}
