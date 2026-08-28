'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import ImagePlaceholder from '@/components/ui/ImagePlaceholder'
import type { Dict } from '@/lib/i18n'

const FRAME_COUNT = 60

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url) || url.includes('/video/upload/')
}

// Derives a Cloudinary still-frame URL from a video URL at a given timestamp
// via the `so_<seconds>` (start offset) transformation — Cloudinary renders
// and caches a JPG frame on first request. No pre-processing needed: any
// video uploaded through /admin/site works automatically.
function cloudinaryFrameUrl(videoUrl: string, seconds: number): string | null {
  const match = videoUrl.match(/^(.*\/upload\/)([^/]+(?:\/[^/]+)*)\.[a-zA-Z0-9]+(?:\?.*)?$/)
  if (!match) return null
  const [, prefix, rest] = match
  return `${prefix}so_${Math.max(0, seconds).toFixed(2)}/${rest}.jpg`
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number,
) {
  const scale = Math.max(canvasW / imgW, canvasH / imgH)
  const drawW = imgW * scale
  const drawH = imgH * scale
  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.drawImage(img, (canvasW - drawW) / 2, (canvasH - drawH) / 2, drawW, drawH)
}

export default function SpotlightChapter({
  image,
  chapter,
  missingImageLabel,
}: {
  image: string
  chapter: Dict['spotlight']
  missingImageLabel: string
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  // Pinned/scrubbed on every screen size, not just desktop — the source
  // asset is already portrait-shaped for mobile and light enough to scrub
  // smoothly there. Only prefers-reduced-motion falls back to the static stack.
  const pinnedActive = !prefersReducedMotion
  const isVideo = image ? isVideoUrl(image) : false
  const posterUrl = isVideo && image ? cloudinaryFrameUrl(image, 0) : null

  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const barFillRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // Preload the still-frame sequence: canvas.drawImage() on an already-decoded
  // bitmap is synchronous and near-instant, unlike <video>.currentTime seeking
  // (which always carries real async latency in every browser — that's what
  // was causing the stutter, no matter how the source video was encoded).
  useEffect(() => {
    if (!isVideo || !image) return
    let cancelled = false
    const probe = document.createElement('video')
    probe.preload = 'metadata'
    probe.muted = true
    probe.src = image
    probe.onloadedmetadata = () => {
      if (cancelled || !probe.duration) return
      const frames: HTMLImageElement[] = []
      for (let i = 0; i < FRAME_COUNT; i++) {
        const t = (i / (FRAME_COUNT - 1)) * probe.duration
        const url = cloudinaryFrameUrl(image, t)
        if (!url) continue
        const frame = new window.Image()
        frame.src = url
        frames.push(frame)
      }
      framesRef.current = frames
      setReady(true)
    }
    return () => {
      cancelled = true
    }
  }, [isVideo, image])

  useEffect(() => {
    if (!pinnedActive) return
    const section = sectionRef.current
    const pinTarget = pinRef.current
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    const panels = panelRefs.current
    const barFill = barFillRef.current
    if (!section || !pinTarget || panels.length === 0) return

    panels.forEach((panel, i) => {
      if (panel) gsap.set(panel, { opacity: i === 0 ? 1 : 0 })
    })

    const ctx = canvas?.getContext('2d') ?? null

    function resizeCanvas() {
      if (!canvas || !wrapper) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = wrapper.clientWidth * dpr
      canvas.height = wrapper.clientHeight * dpr
    }

    function drawFrame(idx: number) {
      if (!ctx || !canvas) return
      const frame = framesRef.current[idx]
      if (!frame || !frame.complete || frame.naturalWidth === 0) return
      drawCover(ctx, frame, frame.naturalWidth, frame.naturalHeight, canvas.width, canvas.height)
    }

    if (isVideo) {
      resizeCanvas()
      drawFrame(0)
      window.addEventListener('resize', resizeCanvas)
    }

    const pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=250%',
      pin: pinTarget,
      scrub: 0.6,
      onUpdate: (self) => {
        const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length))
        panels.forEach((panel, i) => {
          if (panel) gsap.to(panel, { opacity: i === idx ? 1 : 0, duration: 0.4 })
        })
        if (barFill) gsap.set(barFill, { scaleX: self.progress })

        if (isVideo && framesRef.current.length > 0) {
          const frameIdx = Math.min(framesRef.current.length - 1, Math.round(self.progress * (framesRef.current.length - 1)))
          drawFrame(frameIdx)
        }
      },
    })

    // Only static images get the parallax drift — the frame sequence itself
    // already is the motion for video.
    const wrapperTween = wrapper && !isVideo
      ? gsap.to(wrapper, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: '+=250%', scrub: 1 },
        })
      : null

    return () => {
      pinTrigger.kill()
      wrapperTween?.scrollTrigger?.kill()
      wrapperTween?.kill()
      window.removeEventListener('resize', resizeCanvas)
    }
    // `ready` isn't read here, but re-running once frames are preloaded keeps
    // drawFrame(0)'s initial paint in sync with newly-available bitmaps.
  }, [pinnedActive, isVideo, ready])

  if (!pinnedActive) {
    return (
      <section id="savoir-faire" className="bg-black">
        <div className="relative w-full h-[360px]">
          {!image ? (
            <ImagePlaceholder label={missingImageLabel} dark />
          ) : isVideo ? (
            // prefers-reduced-motion: a still frame, no motion at all — not an autoplaying loop.
            posterUrl && <Image src={posterUrl} alt="" fill className="object-cover" sizes="100vw" unoptimized />
          ) : (
            <Image src={image} alt="" fill className="object-cover" sizes="100vw" />
          )}
        </div>
        <div className="px-6 py-14 max-w-[520px] mx-auto">
          <span className="font-display italic text-[0.85rem] mb-8 block" style={{ color: 'var(--color-rgl)' }}>
            {chapter.chapter}
          </span>
          <div className="flex flex-col gap-10">
            {chapter.panels.map((panel, i) => (
              <div key={i}>
                <h3 className="font-display text-[1.8rem] font-light mb-3 text-white">
                  {panel.title_plain} <em className="italic" style={{ color: 'var(--color-rgl)' }}>{panel.title_em}</em>
                </h3>
                <p className="text-[0.9rem] leading-[1.8] font-light" style={{ color: 'rgba(255,255,255,0.65)' }}>{panel.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="savoir-faire" ref={sectionRef} className="relative bg-black overflow-hidden" style={{ height: '250vh' }}>
      <div ref={pinRef} className="relative h-screen overflow-hidden">
        {/* Media island — centered, inset from the edges rather than full-bleed */}
        <div className="absolute inset-y-0 left-[8%] right-[8%] overflow-hidden max-md:left-0 max-md:right-0">
          <div ref={wrapperRef} className="absolute inset-0" style={{ height: isVideo ? '100%' : '120%' }}>
            {!image ? (
              <ImagePlaceholder label={missingImageLabel} dark />
            ) : isVideo ? (
              <>
                {/* Poster underneath so there's never a blank flash while frames preload */}
                {posterUrl && <Image src={posterUrl} alt="" fill className="object-cover" sizes="(max-width: 900px) 100vw, 84vw" unoptimized />}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
              </>
            ) : (
              <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 900px) 100vw, 84vw" />
            )}
          </div>

          {/* Legibility veil on the media itself — not a background behind the text */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 42%, transparent 68%)' }}
          />

          {/* Text overlay, bottom-right, no panel */}
          <div className="absolute bottom-0 right-0 z-10 w-[60%] max-w-[620px] px-10 pb-14 text-right max-md:w-full max-md:px-6 max-md:pb-10">
            <span className="font-display italic text-[0.85rem] mb-6 block" style={{ color: 'var(--color-rgl)' }}>
              {chapter.chapter}
            </span>
            <div className="relative h-[210px] max-md:h-[260px]">
              {chapter.panels.map((panel, i) => (
                <div key={i} ref={(el) => { panelRefs.current[i] = el }} className="absolute inset-0">
                  <h3 className="font-display font-light mb-4 text-white" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
                    {panel.title_plain} <em className="italic" style={{ color: 'var(--color-rgl)' }}>{panel.title_em}</em>
                  </h3>
                  <p className="text-[0.85rem] leading-[1.75] font-light" style={{ color: 'rgba(255,255,255,0.75)' }}>{panel.text}</p>
                </div>
              ))}
            </div>
            <div className="h-px w-full max-w-[320px] ml-auto mt-7 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div ref={barFillRef} className="absolute inset-0 origin-left bg-rg" style={{ transform: 'scaleX(0)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
