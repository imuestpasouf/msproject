'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageKey = 'hero' | 'life1' | 'life2' | 'life3' | 'life4' | 'spotlight'
const VIDEO_ALLOWED_KEYS: ImageKey[] = ['hero', 'spotlight']
type SiteImages = Partial<Record<ImageKey, string>>

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
  )
}

function PencilIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

// ─── Edit overlay ─────────────────────────────────────────────────────────────

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url) || url.includes('/video/upload/')
}

function getVideoType(url: string): string {
  if (/\.webm(\?.*)?$/i.test(url)) return 'video/webm'
  if (/\.mov(\?.*)?$/i.test(url)) return 'video/quicktime'
  return 'video/mp4'
}

function EditOverlay({
  imageKey,
  uploading,
  onUpload,
}: {
  imageKey: ImageKey
  uploading: boolean
  onUpload: (key: ImageKey, file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onUpload(imageKey, file)
    e.target.value = ''
  }

  const accept = VIDEO_ALLOWED_KEYS.includes(imageKey)
    ? 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/png,image/webp'

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={[
          'absolute inset-0 z-20 flex items-center justify-center',
          'transition-opacity duration-200',
          uploading
            ? 'opacity-100 cursor-default pointer-events-none'
            : 'opacity-0 group-hover:opacity-100 cursor-pointer pointer-events-none group-hover:pointer-events-auto',
        ].join(' ')}
        style={{ background: 'rgba(0,0,0,0.5)', border: 'none' }}
        aria-label="Modifier l'image ou la vidéo"
      >
        {uploading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white">
            <PencilIcon />
            <span className="text-[0.68rem] tracking-[0.2em] uppercase font-light">
              {VIDEO_ALLOWED_KEYS.includes(imageKey) ? 'Image / Vidéo' : 'Modifier'}
            </span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </>
  )
}

// ─── Section: Hero ────────────────────────────────────────────────────────────

function HeroSection({
  image,
  uploading,
  onUpload,
}: {
  image?: string
  uploading: boolean
  onUpload: (key: ImageKey, file: File) => void
}) {
  const bgUrl = image ?? '/hero-placeholder.jpg'
  const isVideo = image && isVideoUrl(image)

  return (
    <section
      id="hero"
      className="relative h-screen flex items-end overflow-hidden bg-black group"
    >
      {isVideo ? (
        <>
          <video
            className="absolute inset-0 w-full h-full object-cover anim-hero-bg"
            autoPlay
            muted
            loop
            playsInline
            src={bgUrl}
          >
            <source src={bgUrl} type={getVideoType(bgUrl)} />
          </video>
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%)' }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 anim-hero-bg"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%), url("${bgUrl}") center / cover no-repeat`,
            backgroundColor: '#1a1a1a',
          }}
        />
      )}

      <EditOverlay imageKey="hero" uploading={uploading} onUpload={onUpload} />

      <div className="relative z-10 px-12 pb-16 max-w-[640px] anim-fade-up max-md:px-5 max-md:pb-12">
        <p
          className="text-[0.68rem] tracking-[0.3em] uppercase font-light mb-3.5"
          style={{ color: 'var(--color-rgl)' }}
        >
          Design Milanais · Disponible au Maroc
        </p>

        <h1
          className="font-display font-light leading-[1.05] text-white mb-[18px]"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5.2rem)' }}
        >
          L&apos;heure selon
          <br />
          <em className="italic" style={{ color: 'var(--color-rgl)' }}>
            Milan.
          </em>
        </h1>

        <p
          className="text-[0.83rem] font-light tracking-[0.05em] leading-[1.7] mb-8 max-w-[400px]"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Des montres au design octogonal épuré, nées à Milan. Disponibles en
          exclusivité au Maroc.
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

      <div
        className="absolute bottom-8 right-[52px] hidden md:flex flex-col items-center gap-2 anim-fade-up-late"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        <div
          className="w-[1px] h-12 anim-scroll-pulse"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
          }}
        />
        <span className="text-[0.62rem] tracking-[0.25em] uppercase">
          Défiler
        </span>
      </div>
    </section>
  )
}

// ─── Section: Brand strip ─────────────────────────────────────────────────────

function BrandStrip() {
  const items = [
    'Design Milanais',
    'Livraison nationale',
  ]

  return (
    <div className="bg-black px-12 py-[14px] flex gap-12 items-center overflow-x-auto no-scrollbar">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2.5 whitespace-nowrap text-[0.68rem] tracking-[0.18em] uppercase font-light"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <div className="w-1 h-1 rounded-full flex-shrink-0 bg-rg" />
          {item}
        </div>
      ))}
    </div>
  )
}

// ─── Section: Spotlight (Savoir-faire) ────────────────────────────────────────

function SpotlightSection({
  image,
  uploading,
  onUpload,
}: {
  image?: string
  uploading: boolean
  onUpload: (key: ImageKey, file: File) => void
}) {
  const isVideo = image && isVideoUrl(image)

  return (
    <section id="spotlight" className="relative h-[280px] bg-black group overflow-hidden">
      {image ? (
        isVideo ? (
          <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline src={image}>
            <source src={image} type={getVideoType(image)} />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[0.68rem] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Aucun média
        </div>
      )}
      <div className="absolute top-4 left-4 text-[0.6rem] tracking-[0.18em] uppercase px-2.5 py-1 text-white" style={{ background: 'rgba(0,0,0,0.5)' }}>
        Chapitre · Savoir-faire
      </div>
      <EditOverlay imageKey="spotlight" uploading={uploading} onUpload={onUpload} />
    </section>
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
    <section
      id="collections"
      className="bg-off px-12 py-[88px] max-md:px-5 max-md:py-16"
    >
      <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
        <div>
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
            Nos lignes
          </p>
          <h2
            className="font-display font-light leading-[1.15] text-black"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Les{' '}
            <em className="italic text-gm">Collections</em>
          </h2>
        </div>
        <Link
          href="/catalogue"
          className="text-[0.72rem] tracking-[0.18em] uppercase text-black no-underline pb-[2px] border-b border-black"
        >
          Tout voir
        </Link>
      </div>

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

            <span
              className="absolute top-4 left-4 text-[0.6rem] tracking-[0.18em] uppercase px-2.5 py-1 text-black"
              style={{ background: 'rgba(250,250,250,0.92)' }}
            >
              {card.badge}
            </span>

            <div
              className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)',
              }}
            >
              <div>
                <div className="font-display text-[1.5rem] font-light text-white">
                  {card.name}
                </div>
                <div
                  className="text-[0.68rem] tracking-[0.15em] uppercase mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
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

const LIFE_KEYS: ImageKey[] = ['life1', 'life2', 'life3', 'life4']

function LifestyleSection({
  images,
  uploading,
  onUpload,
}: {
  images: SiteImages
  uploading: Set<ImageKey>
  onUpload: (key: ImageKey, file: File) => void
}) {
  return (
    <section id="lifestyle" className="bg-black py-[88px] overflow-hidden">
      <div className="px-12 mb-11 flex justify-between items-end flex-wrap gap-4 max-md:px-5">
        <div>
          <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
            La communauté
          </p>
          <h2
            className="font-display font-light leading-[1.15] text-white"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            Portez{' '}
            <em className="italic" style={{ color: 'var(--color-rgl)' }}>
              l&apos;instant.
            </em>
          </h2>
        </div>
        <a
          href="#"
          className="text-[0.72rem] tracking-[0.18em] uppercase no-underline pb-[2px]"
          style={{
            color: 'rgba(255,255,255,0.45)',
            borderBottom: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          @d1milano.ma
        </a>
      </div>

      <div className="flex gap-[2px]">
        {LIFE_KEYS.map((key) => (
          <div
            key={key}
            className="relative flex-none group transition-all duration-500 hover:flex-[0_0_35%]"
            style={{ flex: '0 0 25%', height: '320px', filter: 'grayscale(15%)' }}
          >
            {images[key] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[key]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gd" />
            )}

            <EditOverlay
              imageKey={key}
              uploading={uploading.has(key)}
              onUpload={onUpload}
            />
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

  ]

  return (
    <section
      id="process"
      className="bg-off px-12 py-[88px] max-md:px-5 max-md:py-16"
    >
      <div className="text-center max-w-[520px] mx-auto mb-13">
        <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
          Simple & rapide
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
        {steps.map((step) => (
          <div key={step.num} className="relative bg-white px-7 py-9">
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

export default function AdminSitePage() {
  const [images, setImages] = useState<SiteImages>({})
  const [uploading, setUploading] = useState<Set<ImageKey>>(new Set())
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/admin/site-images')
      .then((r) => r.json())
      .then((data) => {
        if (data.images) setImages(data.images)
      })
      .catch(console.error)
  }, [])

  const handleUpload = useCallback(
    async (key: ImageKey, file: File) => {
      setUploading((prev) => new Set([...prev, key]))

      const fd = new FormData()
      fd.append('file', file)
      fd.append('cle', key)

      try {
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: fd,
        })
        const data = await res.json()

        if (!res.ok) {
          setToast({ msg: data.error ?? 'Erreur lors de l\'upload', ok: false })
        } else {
          setImages((prev) => ({ ...prev, [key]: data.url }))
          setToast({ msg: 'Image mise à jour ✓', ok: true })
        }
      } catch {
        setToast({ msg: 'Erreur de connexion', ok: false })
      } finally {
        setUploading((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
        setTimeout(() => setToast(null), 3500)
      }
    },
    []
  )

  return (
    <>
      {/* ── Admin header ─────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-[250] flex items-center gap-5 px-8 py-3 border-b"
        style={{
          background: 'rgba(10,10,10,0.97)',
          borderColor: 'rgba(58,55,51,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] uppercase no-underline transition-colors duration-200 hover:text-white"
          style={{ color: 'rgba(154,149,144,0.8)' }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Retour au dashboard
        </Link>

        <span style={{ color: 'rgba(58,55,51,0.8)' }}>|</span>

        <nav className="flex items-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase">
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</span>
          <span style={{ color: 'rgba(58,55,51,0.8)' }}>›</span>
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>
            Gestion du site
          </span>
        </nav>

        <div
          className="ml-auto text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1"
          style={{
            color: 'rgba(201,149,108,0.7)',
            border: '1px solid rgba(201,149,108,0.25)',
          }}
        >
          Mode édition
        </div>
      </div>

      {/* ── Page sections ────────────────────────────────────────────────── */}
      <HeroSection
        image={images.hero}
        uploading={uploading.has('hero')}
        onUpload={handleUpload}
      />
      <BrandStrip />
      <SpotlightSection
        image={images.spotlight}
        uploading={uploading.has('spotlight')}
        onUpload={handleUpload}
      />
      <LifestyleSection
        images={images}
        uploading={uploading}
        onUpload={handleUpload}
      />
      <ProcessSection />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] text-[0.72rem] tracking-[0.1em] px-5 py-3 shadow-xl transition-all duration-300"
          style={{
            background: toast.ok ? '#fff' : '#1a0a0a',
            color: toast.ok ? '#0a0a0a' : '#e88888',
            border: toast.ok
              ? '1px solid rgba(0,0,0,0.1)'
              : '1px solid rgba(232,136,136,0.3)',
          }}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
