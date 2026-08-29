'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import ImagePlaceholder from '@/components/ui/ImagePlaceholder'
import type { Dict } from '@/lib/i18n'

const FRAME_COUNT = 50
// Fallback cap on how long we wait for the settle-into-view scroll to finish
// before pinning the body anyway, in ms — the real signal is the `scrollend`
// event; this only covers the rare case it never fires (e.g. the section was
// already perfectly framed, so nothing actually scrolled).
const SNAP_MS = 700
// Absolute ceiling on how long the scroll lock can be held, no matter what.
// If anything ever goes wrong upstream (metadata never loads, a frame never
// becomes ready, any future bug), the user must never be physically unable
// to scroll past this section.
const MAX_LOCK_MS = 8000
// Max "video-seconds" the displayed position can move per real second — a
// pacing cap so a big scroll jump doesn't teleport, not a perf workaround
// (canvas draws are free, so this can be generous).
const MAX_SCRUB_RATE = 2.5
const WHEEL_SECONDS_PER_PX = 0.006
const TOUCH_SECONDS_PER_PX = 0.014
const EPSILON = 0.02

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

const SCROLL_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '])

function preventScrollKeys(e: KeyboardEvent) {
  if (SCROLL_KEYS.has(e.key)) e.preventDefault()
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
  const isDesktop = useIsDesktop()
  const active = !prefersReducedMotion
  const isVideo = image ? isVideoUrl(image) : false
  const posterUrl = isVideo && image ? cloudinaryFrameUrl(image, 0) : null

  const sectionRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const durationRef = useRef(0)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])

  // Preload a still-frame sequence via Cloudinary's so_<seconds> transform.
  // Scrubbing then draws already-decoded bitmaps to canvas (synchronous,
  // zero seek latency) instead of seeking a <video> element — that's what
  // was actually causing the jank/randomness, no matter how the currentTime
  // updates were paced.
  useEffect(() => {
    if (!isVideo || !image) return
    let cancelled = false
    const probe = document.createElement('video')
    probe.preload = 'metadata'
    probe.muted = true
    // Must be attached to the document for metadata to load reliably —
    // desktop browsers (including what Chrome DevTools' mobile emulation
    // actually runs on) are lenient about detached video elements, but
    // mobile WebKit (Safari and Chrome-on-iOS both use it) often won't fire
    // loadedmetadata at all for an element that's never in the page. That
    // silently broke everything downstream: drawing and the exit condition
    // both gate on duration > 0.
    probe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;'
    document.body.appendChild(probe)
    probe.src = image
    probe.onloadedmetadata = () => {
      if (cancelled || !probe.duration) return
      durationRef.current = probe.duration
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
    }
    return () => {
      cancelled = true
      probe.onloadedmetadata = null
      probe.remove()
    }
  }, [isVideo, image])

  // Scroll is a scrub bar with a speed cap: scroll accumulates into a target
  // position, and the displayed position eases toward it at a bounded rate.
  useEffect(() => {
    if (!active || !isVideo) return
    const section = sectionRef.current
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    const panels = panelRefs.current
    if (!section || !wrapper || !canvas || panels.length === 0) return

    panels.forEach((panel, i) => {
      if (panel) gsap.set(panel, { opacity: i === 0 ? 1 : 0 })
    })

    const ctx = canvas.getContext('2d')

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = wrapper!.clientWidth * dpr
      canvas!.height = wrapper!.clientHeight * dpr
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    function updatePanels(time: number, duration: number) {
      const progress = time / duration
      const idx = Math.min(panels.length - 1, Math.floor(progress * panels.length))
      panels.forEach((panel, i) => {
        if (panel) gsap.to(panel, { opacity: i === idx ? 1 : 0, duration: 0.3 })
      })
    }

    function drawAt(time: number) {
      const duration = durationRef.current
      const frames = framesRef.current
      if (!ctx || frames.length === 0 || duration <= 0) return
      const idx = Math.min(frames.length - 1, Math.max(0, Math.round((time / duration) * (frames.length - 1))))
      const frame = frames[idx]
      if (!frame || !frame.complete || frame.naturalWidth === 0) return
      drawCover(ctx, frame, frame.naturalWidth, frame.naturalHeight, canvas!.width, canvas!.height)
      updatePanels(time, duration)
    }

    let locked = false
    let scrubbing = false
    let hasScrubbed = false
    let targetTime = 0
    let displayedTime = 0
    let rafId = 0
    let lastTs = 0
    let touchStartY = 0
    let snapTimer: ReturnType<typeof setTimeout> | null = null
    let safetyTimer: ReturnType<typeof setTimeout> | null = null

    let lockedScrollY = 0
    let bodyPinned = false

    function addInputBlockers() {
      window.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('keydown', preventScrollKeys)
    }

    function removeInputBlockers() {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', preventScrollKeys)
    }

    // On touch devices, preventDefault on touchmove can't stop *momentum*
    // scrolling already in flight when the section was entered — iOS in
    // particular keeps coasting with no further touch events to intercept.
    // Pinning the body with position:fixed stops scrolling at the layout
    // level instead, which momentum can't bypass. Must happen only *after*
    // the scrollIntoView settle below — a fixed body can't be scrolled at
    // all, native or programmatic. Desktop skips this: SmoothScroll's rig
    // already manipulates document.body itself (real scrollable height, no
    // fixed position), and desktop wheel input has no momentum problem.
    function pinBody() {
      if (isDesktop || bodyPinned) return
      bodyPinned = true
      lockedScrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${lockedScrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
    }

    function unpinBody() {
      if (!bodyPinned) return
      bodyPinned = false
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      window.scrollTo(0, lockedScrollY)
    }

    function release() {
      locked = false
      scrubbing = false
      removeInputBlockers()
      unpinBody()
      if (snapTimer) {
        clearTimeout(snapTimer)
        snapTimer = null
      }
      if (safetyTimer) {
        clearTimeout(safetyTimer)
        safetyTimer = null
      }
      cancelAnimationFrame(rafId)
    }

    function tick(ts: number) {
      if (!scrubbing) return
      const duration = durationRef.current
      const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0
      lastTs = ts

      if (duration > 0) {
        const diff = targetTime - displayedTime
        if (Math.abs(diff) > EPSILON) {
          const maxStep = MAX_SCRUB_RATE * dt
          const step = Math.max(-maxStep, Math.min(maxStep, diff))
          displayedTime = Math.min(duration, Math.max(0, displayedTime + step))
        } else {
          displayedTime = targetTime
        }
        drawAt(displayedTime)

        // Only treat "at 0" as a rewind-to-start exit once the user has
        // actually scrubbed at all — otherwise this is trivially true from
        // the first frame (both start at 0), releasing the lock before any
        // input can land. That was the real bug: not a platform quirk, a
        // logic error that only *sometimes* got dodged by a lucky race
        // between an incoming scroll event and the first tick.
        const atStart = hasScrubbed && targetTime <= 0 && displayedTime <= EPSILON
        const atEnd = hasScrubbed && targetTime >= duration && displayedTime >= duration - EPSILON
        if (atStart || atEnd) {
          release()
          return
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    function handleDelta(deltaSeconds: number) {
      const duration = durationRef.current
      if (!scrubbing || duration <= 0) return
      hasScrubbed = true
      targetTime = Math.min(duration, Math.max(0, targetTime + deltaSeconds))
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      handleDelta(e.deltaY * WHEEL_SECONDS_PER_PX)
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0]?.clientY ?? 0
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const y = e.touches[0]?.clientY ?? touchStartY
      handleDelta((touchStartY - y) * TOUCH_SECONDS_PER_PX)
      touchStartY = y
    }

    function beginScrub() {
      targetTime = displayedTime
      scrubbing = true
      hasScrubbed = false
      lastTs = 0
      rafId = requestAnimationFrame(tick)
    }

    function finishSettle() {
      if (snapTimer) {
        clearTimeout(snapTimer)
        snapTimer = null
      }
      window.removeEventListener('scrollend', finishSettle)
      pinBody()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry || locked || entry.intersectionRatio < 0.6) return
        locked = true
        addInputBlockers()
        safetyTimer = setTimeout(release, MAX_LOCK_MS)
        // Scrubbing starts immediately — don't make the user wait for the
        // settle animation before their gesture does anything, especially on
        // touch where a stalled response reads as "broken", not "loading".
        beginScrub()
        // Settle the section into a fully-framed position in parallel. Using
        // the native scrollIntoView (not a manually computed window.scrollTo)
        // matters here: this page's smooth-scroll rig renders a *lerped*
        // visual position that lags behind raw window.scrollY, so hand-
        // computing a target by mixing the two gives the wrong answer on
        // desktop (mobile has no rig, which is why it happened to work
        // there). scrollIntoView operates on real layout/scroll state and
        // stays correct regardless. The hard body-pin (pinBody, which is what
        // actually stops iOS momentum) waits for `scrollend` — a fixed body
        // can't be scrolled at all, so pinning too early would cut the settle
        // animation short and reintroduce the off-center bug. SNAP_MS is only
        // a fallback for when nothing actually scrolls (already framed), so
        // no scrollend event would ever fire.
        section!.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.addEventListener('scrollend', finishSettle, { once: true })
        snapTimer = setTimeout(finishSettle, SNAP_MS)
      },
      { threshold: [0, 0.6, 1] },
    )
    observer.observe(section)

    drawAt(0)

    return () => {
      observer.disconnect()
      removeInputBlockers()
      unpinBody()
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('scrollend', finishSettle)
      if (snapTimer) clearTimeout(snapTimer)
      if (safetyTimer) clearTimeout(safetyTimer)
      cancelAnimationFrame(rafId)
    }
  }, [active, isVideo, isDesktop])

  // Static image: a gentle scroll-linked drift and panel crossfade over the
  // section's natural transit — no lock needed, opacity/transform tweens
  // have no seek-style cost regardless of scroll speed.
  useEffect(() => {
    if (!active || isVideo) return
    const section = sectionRef.current
    const wrapper = wrapperRef.current
    const panels = panelRefs.current
    if (!section || panels.length === 0) return

    panels.forEach((panel, i) => {
      if (panel) gsap.set(panel, { opacity: i === 0 ? 1 : 0 })
    })

    const crossfadeTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length))
        panels.forEach((panel, i) => {
          if (panel) gsap.to(panel, { opacity: i === idx ? 1 : 0, duration: 0.4 })
        })
      },
    })

    const wrapperTween = wrapper
      ? gsap.to(wrapper, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
      : null

    return () => {
      crossfadeTrigger.kill()
      wrapperTween?.scrollTrigger?.kill()
      wrapperTween?.kill()
    }
  }, [active, isVideo])

  if (!active) {
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
    <section id="savoir-faire" ref={sectionRef} className="relative bg-black h-screen overflow-hidden">
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
        </div>
      </div>
    </section>
  )
}
